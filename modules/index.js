const graphql = require('./graphql');
const datastore = require('./datastore');
const functions = require('./functions');


exports.install = (ctx) => {
  // Public API that dont require Authorization or Authentication

  ctx.as = (jwtToken, isOwner) => {
    asCtx = Object.assign({}, ctx);
    asCtx.originalToken = jwtToken;
    asCtx.token = {};
    asCtx.isOwner = isOwner;
    exports.install(asCtx);
    return asCtx;
  };
  // Set up proxy functions for private API's
  ctx.datastore = new Proxy(Object.create(null), {
    get: (receiver, name) => {
      return () => {
        throw new Error('Not Authorized')
      }
    }
  });

  ctx.functions = new Proxy(Object.create(null), {
    get: (receiver, name) => {
      return () => {
        throw new Error('Not Authorized')
      }
    }
  });

  // Private API's that do below this check
  if (!ctx.token) {
    return ctx;
  }

  ctx.graphql = graphql(ctx);
  ctx.datastore = datastore(ctx);
  ctx.functions = functions(ctx);
};
