const { oneLine } = require("common-tags");
module.exports = ({ serviceName, uri, project, envNameSpecifier, region }) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    entrypoint: "bash",
    args: [
      "-c",
      oneLine`
      gcloud beta run domain-mappings create
      --platform=managed
      --service=${serviceName}
      --domain=${uri}
      --project=${project}${envNameSpecifier}
      --region=${region} || exit 0
      `
    ]
  };
};
