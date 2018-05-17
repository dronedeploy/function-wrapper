exports.getBaseUrl = () => {
  const env = process.env.DDENV || "prod";  // default to prod
  const envUrlPart = env === "prod" ? "" : "_" + env;
  return `https://api${envUrlPart}.dronedeploy.com`
}
