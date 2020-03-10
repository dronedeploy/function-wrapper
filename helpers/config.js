module.exports = {
  getBootstrapConfig,
};

function getBootstrapConfig() {
  return {
    authRequired: strToBool(process.env.AUTH_REQUIRED, true),
    cors: { headers: strToArray('CORS_HEADERS').filter(Boolean) },
    mockToken: strToBool(process.env.MOCK_TOKEN, false),
    ignoreAuthRoutes: strToArray('IGNORE_AUTH_ROUTES'),
  };
}

function strToBool(text, defaultValue) {
  return text ? text.toLowerCase() === 'true' : defaultValue;
}

function strToArray(envVarName) {
  return (process.env[envVarName] || '').split(',')
}
