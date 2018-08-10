import bootstrap, {
  Context,
  DatastoreResponse,
  Request,
  Response,
  Table,
} from "@dronedeploy/function-wrapper";

import {inspect} from "util";

const config = {
  authRequired: false,  // set to true for real testing
  mockToken: true,
};

const req = {
  headers: {
    'DummyHeader': 'imadummy'
  }
};

const res = {
  headers: {} as any,
  status: () => {
    return {
      send: () => {

      }
    };
  },
  set: (name: any, value: any) => {
    res.headers[name] = value;
  }
};

function findTableByName(ctx: Context, name: string, slug: string) {
  return ctx.datastore.findTableByName(name, slug)
}

let ownerJWT = process.argv[3] || process.argv[2];

async function handler(req: Request, res: Response, ctx: Context) {
  // this is for mocking token.
  ctx.originalToken = process.argv[2];
  return ctx
    .as(ownerJWT, true)
    .datastore
    .ensure('zqyjaheaxvszfgrtdiep', 'new_table_1', 'mydescription',
      [{
        input: {
          columnType: "TEXT",
          name: "name",
          textLength: 255,
          description: "Users name",
        }
      }])
    .then((tableId: string) => findTableByName(ctx, 'new_table_1', tableId))
    .then((tableId: string) => ctx.datastore.table(tableId))
    .then((users: Table) => {
      users
        .upsertRow('mhernandez+test@dronedeploy.com', {name: 'Michaxel Hernandez'})
        .then((result: DatastoreResponse) => {
          console.log(inspect(result, {depth: 20, colors: true}));
        })
        .then(() => {
          users
            .getRowByExternalId('mhernandez+test@dronedeploy.com')
            .then((result) => {
              console.log(inspect(result, {depth: 20, colors: true}));
            })

        })
        .catch(e => {
          console.log(e);
        });
    }).catch(console.error);
}

export default async function func(req: Request, res: Response) {
  return bootstrap(config, req, res, (err: Error, ctx: Context) => {
      // Common headers should have been set automatically.
      // Common requests like OPTIONS should have been handled automatically.
      if (err) {
        console.error(err, err.stack);
        console.warn('An error occurred during the bootstrapping process. A default response has been sent and code paths have been stopped.');
        return;
      }

      return handler(req, res, ctx);
  });
}
