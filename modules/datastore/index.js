module.exports = (ctx) => {
  let api = {
    addRow: mutateRow(ctx)('add'),
    editRow: mutateRow(ctx)('edit'),
    upsertRow: upsertRow(ctx),
    table: table(ctx),
    findTableByName: _findTable(ctx),
  };
  if (ctx.isOwner) {
    api.createTable = _createTable(ctx);
    api.ensure =  _ensure(ctx);
  }
  return api;
};

/*
 This function gets the public api methods for a table.
 Right now it exposes the ability to add or edit a row of data.
 You may additionally use the methods on the datastore object
 while passing in a tableId each time.
 example:
 table = dd.datastore.table('ANDKKDKEJJERKER')
 table.addRow('john_doe@gmail.com', {name: 'John Doe'});
 table.editRow('john_doe@gmail.com', {name: 'John'});
*/
function table(ctx) {
  return function (tableId) {
    return {
      addRow: mutateRow(ctx)('add').bind(Object.create(null), tableId),
      editRow: mutateRow(ctx)('edit').bind(Object.create(null), tableId),
      upsertRow: upsertRow(ctx).bind(Object.create(null), tableId),
      getRowByExternalId: getDatum(ctx).bind(Object.create(null), tableId),
    }
  }
}

function mutateRow(ctx) {
  return function (operation) {  // operation could be one of add, edit, delete, etc.
    return function (tableId, externalId, data, excludeFields) {
      excludeFields = excludeFields || [];
      const query = createDataMutationQuery(operation, excludeFields);
      const variables = createDataMutationVariables(tableId, externalId, data);

      return ctx.graphql.query(query, variables)
        .then(result => {
          // we should convert data back into a javascript object
          try {
            if (result.data) {
              let key;
              if ('createTableData' in result.data) {
                key = 'createTableData';
              } else {
                key = 'editTableData';
              }

              retVal = {
                ok: true,
                data: result.data[key].tableData
              };
              retVal.data.data = JSON.parse(retVal.data.data);
              return retVal;
            }
          } catch (e) {
            // do nothing
          }
          if (result.errors) {
              return {
                ok: false,
                errors: result.errors
              }
          }
        });
    };
  };
}

function upsertRow(ctx) {

  return function (tableId, externalId, data, excludeFields) {
    const tableCtxId = table(ctx)(tableId);
    return tableCtxId.addRow(externalId, data, excludeFields)
      .then((result) => {
        if (result.errors) {
          // externalId probably already exists (but could be any other error)
          throw new Error(result.errors[0]);
        }
        return result;
      })
      .catch(function () {  // TODO: test this codepath
        return tableCtxId.editRow(externalId, data, excludeFields);  // attempt to edit preexisting externalId
      });
  };
}

function createDataMutationQuery(operation, excludeFields) {
  let mutationName, inputName, outputName;
  if (operation === 'add') {
    mutationName = 'CreateTableData';
    inputName = 'CreateTableDataInput';
    outputName = 'createTableData';
  } else if (operation === 'edit') {
    mutationName = 'EditTableData';
    inputName = 'EditTableDataInput';
    outputName = 'editTableData';
  }
  let $filtered = (field) => {
    return excludeFields.indexOf(field) !== -1
  };
  let query = `
    mutation ${mutationName}($input: ${inputName}!) {
      ${outputName}(input: $input) {
        tableData {
          ${ $filtered('id') ? '' : 'id\n'}
          ${ $filtered('application') ? '' : 'application {\n  id\n}'}
          ${ $filtered('data') ? '' : 'data\n'}
          ${ $filtered('externalKey') ? '' : 'externalKey\n'}
          ${ $filtered('table') ? '' : 'table {\n  id\n}'}
        }
      }
    }
  `;
  return query;
}

function createDataMutationVariables(tableId, externalId, data) {
  return {
    input: {
      externalId,
      tableId,
      data: 'string' !== typeof(data) ? JSON.stringify(data) : data
    }
  }
}


function getDatum(ctx) {
  return function (tableId, externalKey) {
    const query = createGetTableDatumQuery();
    const variables = createGetTableDatumVariables(tableId, externalKey);
    return ctx.graphql.query(query, variables)
      .then(result => {
        // make sure we convert data back into a javascript object
        try {
          if (result.data) {
            return {
              ok: true,
              data: JSON.parse(result.data.node.tableDatum.data)
            }
          }

        } catch (e) {
          // do nothing
        }
        return {
          ok: false,
          errors: result.errors
        }
      });
  };
}

const resultContainsError = (result) => {
  return result.errors ? true : false;
}

const resultContainsErrorIgnorePsycoPGDuplicate = (result) => {
  return result.errors ? result.errors[0].message.indexOf('duplicate') === -1: false;
}


const getMissingColumns = (columnsSubset, columnDefinitions) => {
  return columnDefinitions.filter((column) => {
    return !columnsSubset.includes(column.name);
  });
}

const getColumnsToCreate = (ctx, appSlug, tableId, tableName, columnDefinitions) => {
  return ctx.graphql.query(createFindTableQuery(), createFindTableQueryVariables(tableName, appSlug))
    .then((result) => {
      var columnsResult = result.data.node.table.columns;
      return getMissingColumns(columnsResult, columnDefinitions);
    })
};

/**
 * Creates the specified columns on the table
 * @param {Object} ctx
 * @param appSlug The app slug
 * @param tableId The table ID
 * @param {String} tableName
 * @param {Array<Object>} columnDefinitions
 */
const _createTableColumns = (ctx, appSlug, tableId, tableName, columnDefinitions) => {
  return getColumnsToCreate(ctx, appSlug, tableId, tableName, columnDefinitions)
    .then((columns) => {
      // This really shouldn't ever happen, but if it does
      // we don't want to error out trying to create columns
      // that already exist
      if (columns.length === 0) {
        return tableId;
      }

      var tableColumnQueries = columns.map((columnData) => {
        columnData.input.tableId = tableId;
        return ctx.graphql.query(CREATE_TABLE_COLUMN_QUERY, columnData);
      });

      return Promise.all(tableColumnQueries)
        .then((results) => {
          if (results.some(resultContainsErrorIgnorePsycoPGDuplicate)) {
            return Promise.reject('Error creating table columns');
          }
          return tableId;
        });
    });
};

function _createTable(ctx) {
  return function (appSlug, tableName, tableDescription, columnDefinitions) {
    // TODO Support ColumnBuilder

    const createInput = {
      input: {
        applicationId: "Application:"+appSlug,
        name: tableName,
        description: tableDescription
      }
    };
    return ctx.graphql.query(CREATE_TABLE_QUERY, createInput)
      .then((result) => {
        if (resultContainsError(result)) {
          return Promise.reject(result.errors[0]);
        }

        return result.data.createTable.table.id;
      })
      .then((tableId) => {
        return _createTableColumns(ctx, appSlug, tableId, tableName, columnDefinitions);
    });
  };
};

function _findTable(ctx) {
  return function(tableName, appSlug) {
    return ctx.graphql.query(createFindTableQuery(), createFindTableQueryVariables(tableName, appSlug))
      .then((result) => {
        if (resultContainsError(result)) {
          return Promise.reject(result.errors[0]);
        }
        return result.data.node.table.id
      });
  }
}

function _ensure(ctx) {
  return function(appSlug, tableName, tableDescription, columnDefinitions) {
      // TODO Support ColumnBuilder
    
    return ctx.graphql.query(createFindTableQuery(), createFindTableQueryVariables(tableName, appSlug))
      .then((result) => {
        if (resultContainsError(result)) {
          if (result.data.node.table === null) {
            return _createTable(ctx)(appSlug, tableName, tableDescription, columnDefinitions);
          } else {
            return Promise.reject(result.errors[0]);
          }
        }
        return _createTableColumns(ctx, appSlug, result.data.node.table.id, tableName, columnDefinitions );
      })
      .catch((err) => {
        return Promise.reject(err);
      });
    }
};


function createGetTableDatumQuery() {
  return `
    query($table_id:ID!, $externalKey:String!){
      node(id:$table_id){
        ... on Table{
          tableDatum(externalKey: $externalKey){
            data
          }
        }
      }
    }`
}

function createGetTableDatumVariables(table_id, externalKey) {
  return {
    table_id,
    externalKey
  }
}



const CREATE_TABLE_QUERY = `mutation CreateTable($input: CreateTableInput!) {
  createTable(input: $input) {
    table {
      id
      application {
        id
      }
      name
      description
    }
  }
}`;

const CREATE_TABLE_COLUMN_QUERY = `mutation CreateTableColumn($input: CreateTableColumnInput!) {
  createTableColumn(input: $input) {
    tableColumn {
      id
      name
      description
      ... on NumberColumn {
        type
      }
      ... on TextColumn {
        length
      }
    }
  }
}`;

function createFindTableQuery() {
  return `
    query($tableName:String!, $appSlug:ID!){
      node(id: $appSlug){
        ... on Application {
          table(name:$tableName) {
            id
            name
            columns {
              name
            }
          }
        }
      }
    }`
}

function createFindTableQueryVariables(tableName, appSlug) {
  return {
    tableName,
    appSlug: "Application:"+appSlug
  }
}
