#!/bin/bash

required_files=(".env")
required_vars=("CR_ROOT_DOMAIN" "CR_PW" "CR_APP_NAME" "DOZZLE_USERNAME" "DOZZLE_PASSWORD" "DOZZLE_KEY")
dirname=$(dirname "$0")

set -ef -o pipefail

for file in "${required_files[@]}"; do
  if [ ! -f "$dirname/$file" ]; then
    echo "Error: $file file not found!"
    exit 1
  fi
done

source $dirname/.env

for var in "${required_vars[@]}"; do
  if [[ -z "${!var}" ]]; then
    echo "Error: $var is not set in .env"
    exit 1
  fi
done

register_data=$(printf '{ "appName": "%s", "hasPersistentData": true }' "$CR_APP_NAME")

update_data=$(printf '{
  "appName": "%s",
  "instanceCount": 1,
  "notExposeAsWebApp": false,
  "forceSsl": false,
  "websocketSupport": false,
  "volumes": [
    {
      "hostPath": "/var/run/docker.sock",
      "containerPath": "/var/run/docker.sock"
    }
  ],
  "ports": [],
  "containerHttpPort": "8080",
  "description": "",
  "envVars": [
    {
      "key": "DOZZLE_USERNAME",
      "value": "%s"
    },
    {
      "key": "DOZZLE_PASSWORD",
      "value": "%s"
    },
    {
      "key": "DOZZLE_KEY",
      "value": "%s"
    }
  ],
  "tags": [],
  "redirectDomain": ""
}' "$CR_APP_NAME" "$DOZZLE_USERNAME" "$DOZZLE_PASSWORD" "$DOZZLE_KEY")

# Don't dev/null because caprover sends errors to stdout

echo *** Registering app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/register --data "$register_data"
echo *** Configuring app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/update --data "$update_data"
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appData/$CR_APP_NAME --data '{ "captainDefinitionContent": "{\"schemaVersion\":2,\"imageName\":\"amir20/dozzle:v3.7.1\"}", "gitHash": "" }'
echo *** Enabling SSL...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/enablebasedomainssl --data "{ \"appName\": \"$CR_APP_NAME\" }"
echo *** Finished!
echo The log stream is deployed and available at https://${CR_APP_NAME}.${CR_ROOT_DOMAIN}
echo You can update the app at any time via https://captain.$CR_ROOT_DOMAIN/#/apps/details/$CR_APP_NAME
