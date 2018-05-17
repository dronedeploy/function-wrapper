exports.getBaseUrl = () => {
  // If DDENV is defined, use it, otherwise default to prod
  const env = process.env.DDENV ? "_" + process.env.DDENV : "";
  return `https://api${env}.dronedeploy.com`
}
