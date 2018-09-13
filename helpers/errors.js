module.exports = {
  handleInternalError
};

function handleInternalError(res, error) {
  console.error('An unexpected error has occurred: ', error);
  return res.status(500).end(stringifyErrorNoStack(error));
}

function stringifyErrorNoStack(error) {
  return JSON.stringify({ message: error.message, name: error.name });
}
