# deploy-lambda.ps1
# Deploys the IoT-to-Supabase Lambda and creates the AWS IoT Topic Rule

$env:PATH += ";C:\Program Files\Amazon\AWSCLIV2"

$LAMBDA_NAME="IotToSupabaseTelemetry"
$ROLE_NAME="IotToSupabaseLambdaRole"
$ZIP_FILE=".\lambda-deploy.zip"
$LAMBDA_DIR=".\aws\lambda\iot-to-supabase"
$IOT_RULE_NAME="TsubakiTelemetryRule"

Write-Host "Zipping Lambda function..."
if (Test-Path $ZIP_FILE) { Remove-Item $ZIP_FILE }
Compress-Archive -Path "$LAMBDA_DIR\*" -DestinationPath $ZIP_FILE -Force

Write-Host "Creating IAM Execution Role for Lambda..."
$TRUST_POLICY = @"
{
  `"Version`": `"2012-10-17`",
  `"Statement`": [
    {
      `"Effect`": `"Allow`",
      `"Principal`": {
        `"Service`": `"lambda.amazonaws.com`"
      },
      `"Action`": `"sts:AssumeRole`"
    }
  ]
}
"@
Set-Content -Path trust-policy.json -Value $TRUST_POLICY
$roleOutput = aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://trust-policy.json | ConvertFrom-Json
$ROLE_ARN = $roleOutput.Role.Arn

Write-Host "Attaching Basic Execution Policy..."
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Wait a few seconds for IAM role to propagate
Write-Host "Waiting 10 seconds for IAM Role propagation..."
Start-Sleep -Seconds 10

Write-Host "Deploying Lambda Function..."
$lambdaOutput = aws lambda create-function `
    --function-name $LAMBDA_NAME `
    --runtime nodejs20.x `
    --role $ROLE_ARN `
    --handler index.handler `
    --zip-file fileb://$ZIP_FILE | ConvertFrom-Json

$LAMBDA_ARN = $lambdaOutput.FunctionArn

Write-Host "Granting AWS IoT permission to invoke Lambda..."
aws lambda add-permission `
    --function-name $LAMBDA_NAME `
    --statement-id iot-events `
    --action "lambda:InvokeFunction" `
    --principal iot.amazonaws.com

Write-Host "Creating AWS IoT Topic Rule..."
$IOT_RULE_PAYLOAD = @"
{
  `"sql`": `"SELECT * FROM 'dt/spindle/telemetry'`",
  `"description`": `"Routes telemetry to Supabase Lambda`",
  `"actions`": [
    {
      `"lambda`": {
        `"functionArn`": `"$LAMBDA_ARN`"
      }
    }
  ],
  `"ruleDisabled`": false
}
"@
Set-Content -Path iot-rule.json -Value $IOT_RULE_PAYLOAD
aws iot create-topic-rule --rule-name $IOT_RULE_NAME --topic-rule-payload file://iot-rule.json

Write-Host "========================================="
Write-Host "Deployment Complete!"
Write-Host "Lambda ARN: $LAMBDA_ARN"
Write-Host "========================================="
