#!/bin/bash

required_files=(".env")
required_vars=("CR_ROOT_DOMAIN" "CR_PW" "CR_APP_NAME" "REDIS_PASSWORD")
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
 	"notExposeAsWebApp": true,
 	"forceSsl": false,
 	"websocketSupport": false,
 	"volumes": [
 		{
 			"volumeName": "%s-redis-data",
 			"containerPath": "/data"
 		}
 	],
 	"ports": [],
 	"description": "",
 	"envVars": [
 		{
 			"key": "REDIS_PASSWORD",
 			"value": "%s"
 		}
 	],
 	"tags": [],
 	"redirectDomain": ""
 }' "$CR_APP_NAME" "$CR_APP_NAME" "$REDIS_PASSWORD")

echo *** Registering app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/register --data "$register_data"
echo *** Configuring app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/update --data "$update_data"
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appData/$CR_APP_NAME --data '{ "captainDefinitionContent": "{\"schemaVersion\":2,\"imageName\":\"redis:latest\"}", "gitHash": "" }'
echo *** Finished!
echo The app is available on the docker network as \`srv-captain--$CR_APP_NAME:6379\`
echo "Example (from within the docker network): redis-cli -h srv-captain--$CR_APP_NAME -p 6379 -a $REDIS_PASSWORD keys *"
echo You can update the app at any time via https://captain.$CR_ROOT_DOMAIN/#/apps/details/$CR_APP_NAME
