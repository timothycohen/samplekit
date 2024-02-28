#!/bin/bash

required_files=(".env")
required_vars=("CR_ROOT_DOMAIN" "CR_PW" "CR_APP_NAME" "APP_CUSTOM_DOMAIN" "INCLUDE_WWW")
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

register_data=$(printf '{ "appName": "%s", "hasPersistentData": false }' "$CR_APP_NAME")

update_data=$(printf '{
 	"appName": "%s",
 	"instanceCount": 1,
 	"notExposeAsWebApp": false,
 	"forceSsl": true,
 	"websocketSupport": true,
	"volumes": [],
 	"ports": [],
  "containerHttpPort": "3000",
 	"description": "",
 	"envVars": [
 		{
 			"key": "ADDRESS_HEADER",
 			"value": "x-real-ip"
 		}
 	],
	"appDeployTokenConfig": {
    "enabled": true
  },
 	"tags": [],
  "redirectDomain": "www.%s"
 }' "$CR_APP_NAME" "$APP_CUSTOM_DOMAIN")

echo *** Registering app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/register --data "$register_data"
echo *** Enabled SSL for root domain...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/enablebasedomainssl --data "{ \"appName\": \"$CR_APP_NAME\" }"
echo *** Adding custom domain...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/customdomain --data "{ \"appName\": \"$CR_APP_NAME\", \"customDomain\": \"$APP_CUSTOM_DOMAIN\" }"
if [ "$INCLUDE_WWW" = "true" ]; then
	pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/customdomain --data "{ \"appName\": \"$CR_APP_NAME\", \"customDomain\": \"www.$APP_CUSTOM_DOMAIN\" }"
fi
echo *** Enabling SSL for custom domain...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/enablecustomdomainssl --data "{ \"appName\": \"$CR_APP_NAME\", \"customDomain\": \"$APP_CUSTOM_DOMAIN\" }"
if [ "$INCLUDE_WWW" = "true" ]; then
	pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/enablecustomdomainssl --data "{ \"appName\": \"$CR_APP_NAME\", \"customDomain\": \"www.$APP_CUSTOM_DOMAIN\" }"
fi
echo *** Configuring app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/update --data "$update_data"
echo *** Finished!
echo View your App Token \(used for deployment with CI/CD \) or update the app via https://captain.$CR_ROOT_DOMAIN/#/apps/details/$CR_APP_NAME
