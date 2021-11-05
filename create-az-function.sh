#Variables
#for the Azure Function
TEST_USER="<AZURE_AD_USER_EMAIL>"
TEST_SECRET="<AZURE_AD_USER_PASSWORD>"
WEB_TO_TEST="<THE_WEB_YOU_WANT_TO_TEST>"
APP_INSIGHTS_TO_REPORT="<APP_INSIGHTS_INSTRUMENTATION_KEY>"
AVAILABILITY_TEST_NAME="Test using Node.js"

#for Azure resources
RESOURCE_GROUP="Custom-Tests"
LOCATION="West Europe"
AZURE_FUNCTION_NAME="<YOUR_AZURE_FUNCTION_NAME>"
AZURE_FUNCTION_PLAN="AzFuncNodejsPlan"
STORAGE_ACCOUNT_NAME="<YOUR_STORAGE_ACCOUNT_NAME>"

#1. Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

#2. Create Storage account
az storage account create --resource-group $RESOURCE_GROUP --name $STORAGE_ACCOUNT_NAME --location $LOCATION --sku Standard_LRS

#Get Azure Storage connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string --name $STORAGE_ACCOUNT_NAME --resource-group $RESOURCE_GROUP --output tsv)

#Create Azure Function Plan
az functionapp plan create --resource-group $RESOURCE_GROUP --name $AZURE_FUNCTION_PLAN --location $LOCATION --number-of-workers 1 --sku EP1 --is-linux

# Create Azure Function
az functionapp create --name $AZURE_FUNCTION_NAME --functions-version 3 --storage-account $STORAGE_ACCOUNT_NAME --resource-group $RESOURCE_GROUP --plan $AZURE_FUNCTION_PLAN  --runtime node --runtime-version 12

#Add app settings to the Azure Function
az functionapp config appsettings set --name $AZURE_FUNCTION_NAME --resource-group $RESOURCE_GROUP \
--settings WEB_URL=$WEB_TO_TEST \
RUN_LOCATION=$LOCATION \
TEST_USER=$TEST_USER \
TEST_SECRET=$TEST_SECRET \
APPINSIGHTS_INSTRUMENTATIONKEY_WEBAPP=$APP_INSIGHTS_TO_REPORT \
AVAILABILITY_TEST_NAME=$AVAILABILITY_TEST_NAME \
AZURE_STORAGE_FOR_SCREENSHOTS=$STORAGE_CONNECTION_STRING