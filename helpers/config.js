module.exports = {
  getBootstrapConfig,
};

function getBootstrapConfig() {
  return {
    authRequired: strToBool(process.env.AUTH_REQUIRED, true),
    config: { cors: { headers: [] } },
    mockToken: strToBool(process.env.MOCK_TOKEN, false),
  };
}

function strToBool(text, defaultValue) {
  return text ? text.toLowerCase() === 'true' : defaultValue;
}