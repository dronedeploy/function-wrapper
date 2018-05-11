module.exports = (ctx) => {
  return {
    addRow: mutateRow(ctx)('add'),
    editRow: mutateRow(ctx)('edit'),
    upsertRow: upsertRow(ctx),
    table: table(ctx)
  }
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
    return function (tableId, externalId, data, exclude_fields) {
      exclude_fields = exclude_fields || [];
      const query = createDataMutationQuery(operation, exclude_fields);
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
              }
              retVal.data.data = JSON.parse(retVal.data.data);
              return retVal;
            }
          } catch (e) {
            console.error(e)
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
  return function (tableId, externalId, data, exclude_fields) {
    const tableCtxId = table(ctx)(tableId);
    return tableCtxId.addRow(externalId, data, exclude_fields)
      .then((result) => {
        if (result.errors) {
          // externalId probably already exists (but could be any other error)
          throw new Error(result.errors[0]);
        }
        return result;
      })
      .catch(function () {  // TODO: test this codepath
        return tableCtxId.editRow(externalId, data, exclude_fields);  // attempt to edit preexisting externalId
      });
  };
}

function createDataMutationQuery(operation, exclude_fields) {
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
    return exclude_fields.indexOf(field) !== -1
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
  return function (table_id, externalKey) {
    const query = createGetTableDatumQuery();
    const variables = createGetTableDatumVariables(table_id, externalKey)
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
  }
}


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
