exports.getBaseUrl = () => {
  const env = process.env.DDENV === "prod" ? "" : "_" + process.env.DDENV;
  return `https://api${env}.dronedeploy.com`
}
