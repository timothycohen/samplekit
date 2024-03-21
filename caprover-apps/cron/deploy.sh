#!/bin/bash

required_files=("captain-definition" ".env" "Dockerfile")
required_vars=("CR_ROOT_DOMAIN" "CR_PW" "CR_APP_NAME" "RESET_DB_APP_NAME" "RESET_DB_DELETE_EXPIRED_TOKENS_KEY" "RESET_DB_EXPECTED_DB_NAME")
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

update_data=$(printf '{ "appName": "%s", "instanceCount": 1, "notExposeAsWebApp": true }' "$CR_APP_NAME")

echo *** Loading env vars into cron job scripts...
cp $dirname/bin/reset_db.sh.example $dirname/bin/reset_db.sh.secret
for key in "RESET_DB_APP_NAME" "RESET_DB_DELETE_EXPIRED_TOKENS_KEY" "RESET_DB_EXPECTED_DB_NAME" "X_DEPLOYMENT_ACCESS"; do
	sed -i '' "s/\$$key/${!key}/g" $dirname/bin/reset_db.sh.secret
done

echo *** Registering app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/register --data "$register_data"
echo *** Configuring app...
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW api --method POST --path /user/apps/appDefinitions/update --data "$update_data"
echo *** Compressing app for upload...
tar -cf /tmp/captain.tar $dirname
pnpm caprover --caproverUrl https://captain.$CR_ROOT_DOMAIN --caproverPassword $CR_PW deploy -t /tmp/captain.tar -a $CR_APP_NAME
echo *** Cleaning Up...
rm /tmp/captain.tar
rm $dirname/bin/reset_db.sh.secret
echo *** Finished!
echo The cron jobs are deployed.
echo You can update the app at any time via https://captain.$CR_ROOT_DOMAIN/#/apps/details/$CR_APP_NAME
