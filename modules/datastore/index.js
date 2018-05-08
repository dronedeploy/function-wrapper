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
    }
  }
}

function mutateRow(ctx) {
  return function (operation) {  // operation could be one of add, edit, delete, etc.
    return function (tableId, externalId, data, exclude_fields) {
      exclude_fields = exclude_fields || [];
      return new Promise((resolve, reject) => {
        try {
          let query = getDataMutationQuery(operation, exclude_fields);
          let variables = getDataMutationVariables(tableId, externalId, data);
          ctx.graphql
            .query(query, variables)
            .then(result => {
              // make sure we convert data back into a javascript object
              try {
                result.data = JSON.parse(result.data);
              } catch (e) {
                // do nothing
              }
              resolve(result);
            })
            .catch(e => {
              reject(e);
            })

        } catch (e) {
          reject(e);
        }
      });
    }
  }
}


function upsertRow(ctx) {
  return function (tableId, externalId, data, exclude_fields) {
    const tableCtxId = table(ctx)(tableId);
    return new Promise((resolve, reject) => {
      tableCtxId
        .addRow(externalId, data, exclude_fields)
        .then((result) => {
          if (result.errors) {
            // externalId probably already exists (but could be any other error)
            throw new Error(result.errors[0]);
          }
          resolve(result);
        }).catch(e => {  // TODO: test this codepath
          tableCtxId
            .editRow(externalId, data, exclude_fields)  // attempt to edit preexisting externalId
            .then(result => resolve(result))
            .catch(e => {
              reject(result);
            });
        });
    });
  };
}

function getDataMutationQuery(operation, exclude_fields) {
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

function getDataMutationVariables(tableId, externalId, data) {
  return {
    input: {
      externalId,
      tableId,
      data: 'string' !== typeof(data) ? JSON.stringify(data) : data
    }
  }
}
