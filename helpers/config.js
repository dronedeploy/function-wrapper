module.exports = {
  getBootstrapConfig,
};

function getBootstrapConfig() {
  return {
    authRequired: strToBool(process.env.AUTH_REQUIRED, true),
    cors: { headers: commaDelimitedStringToArray('CORS_HEADERS') },
    mockToken: strToBool(process.env.MOCK_TOKEN, false),
    ignoreAuthRoutes: commaDelimitedStringToArray('IGNORE_AUTH_ROUTES'),
  };
}

function strToBool(text, defaultValue) {
  return text ? text.toLowerCase() === 'true' : defaultValue;
}

function commaDelimitedStringToArray(envVarName) {
  return (process.env[envVarName] || '').split(',').filter(Boolean);
}
