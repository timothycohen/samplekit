#!/bin/bash

required_files=(".env")
required_vars=("CR_ROOT_DOMAIN" "CR_PW" "CR_APP_NAME" "PG_USER" "PG_PASSWORD" "PG_DB")
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
 			"volumeName": "%s-data",
 			"containerPath": "/var/lib/postgresql/data"
 		}
 	],
 	"ports": [],
 	"description": "",
 	"envVars": [
 		{
 			"key": "POSTGRES_USER",
 			"value": "%s"
 		},
 		{
 			"key": "POSTGRES_PASSWORD",
 			"value": "%s"
 		},
 		{
 			"key": "POSTGRES_DB",
 			"value": "%s"
 		},
 		{
 			"key": "POSTGRES_INITDB_ARGS",
 			"value": "%s"
 		}
 	],
 	"tags": [],
 	"redirectDomain": ""
 }' "$CR_APP_NAME" "$CR_APP_NAME" "$PG_USER" "$PG_PASSWORD" "$PG_DB" "$PG_INITDB_ARGS")

echo *** Registering app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/register --data "$register_data"
echo *** Configuring app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/update --data "$update_data"
echo *** Finished!
echo The app is available on the docker network as \`srv-captain--$CR_APP_NAME:5432\`
echo Example \(from within the docker network\): psql \""postgres://$PG_USER:$PG_PASSWORD@srv-captain--$CR_APP_NAME:5432/$PG_DB$PG_INITDB_ARGS"\" -c \'"SELECT now();"\'
echo You can update the app at any time via https://captain.$CR_ROOT_DOMAIN/#/apps/details/$CR_APP_NAME
