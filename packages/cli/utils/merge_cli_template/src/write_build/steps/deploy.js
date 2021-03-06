module.exports = ({
  region,
  project,
  domain,
  service,
  network,
  context,
  memory,
  operationHash,
  containerRegistery,
  envNameSpecifier,
  envUriSpecifier,
  serviceName,
  secretBucket,
  secretBucketKeyLocation,
  secretBucketKeyRing,
  extension,
  nodeEnv,
  env = "",
  labels = "",
  allowUnauthenticated = false
} = {}) => {
  return {
    name: "gcr.io/cloud-builders/gcloud",
    args: [
      "beta",
      "run",
      "deploy",
      `${serviceName}`,
      `--image=${containerRegistery}/${service}.${context}.${extension}`,
      "--platform=managed",
      `--memory=${memory}`,
      ...(allowUnauthenticated ? ["--allow-unauthenticated"] : []),
      `--project=${project}${envNameSpecifier}`,
      `--region=${region}`,
      `--set-env-vars=NODE_ENV=${nodeEnv},NETWORK=${region}.${envUriSpecifier}${network},SERVICE=${service},CONTEXT=${context},DOMAIN=${domain},GCP_PROJECT=${project}${envNameSpecifier},GCP_REGION=${region},GCP_SECRET_BUCKET=${secretBucket},GCP_KMS_SECRET_BUCKET_KEY_LOCATION=${secretBucketKeyLocation},GCP_KMS_SECRET_BUCKET_KEY_RING=${secretBucketKeyRing},${env}`,
      `--labels=service=${service},context=${context},domain=${domain},hash=${operationHash},${labels}`
    ]
  };
};
