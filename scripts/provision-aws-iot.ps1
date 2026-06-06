# provision-aws-iot.ps1
# Make sure you have the AWS CLI installed and configured (`aws configure`) before running.

$env:PATH += ";C:\Program Files\Amazon\AWSCLIV2"

$THING_NAME="TsubakiSpindle"
$POLICY_NAME="TsubakiSpindlePolicy"
$CERTS_DIR=".\certs"

if (!(Test-Path -Path $CERTS_DIR)) {
    New-Item -ItemType Directory -Force -Path $CERTS_DIR
}

Write-Host "Creating AWS IoT Thing: $THING_NAME..."
aws iot create-thing --thing-name $THING_NAME

Write-Host "Creating Keys and Certificate..."
$certOutput = aws iot create-keys-and-certificate `
    --set-as-active `
    --certificate-pem-outfile "$CERTS_DIR\certificate.pem.crt" `
    --public-key-outfile "$CERTS_DIR\public.pem.key" `
    --private-key-outfile "$CERTS_DIR\private.pem.key" | ConvertFrom-Json

$CERT_ARN = $certOutput.certificateArn

Write-Host "Attaching Certificate to Thing..."
aws iot attach-thing-principal --thing-name $THING_NAME --principal $CERT_ARN

$POLICY_DOC = @"
{
  `"Version`": `"2012-10-17`",
  `"Statement`": [
    {
      `"Effect`": `"Allow`",
      `"Action`": [
        `"iot:Connect`",
        `"iot:Publish`",
        `"iot:Subscribe`",
        `"iot:Receive`"
      ],
      `"Resource`": [
        `"*`"
      ]
    }
  ]
}
"@

Write-Host "Creating IoT Policy: $POLICY_NAME..."
aws iot create-policy --policy-name $POLICY_NAME --policy-document $POLICY_DOC

Write-Host "Attaching Policy to Certificate..."
aws iot attach-policy --policy-name $POLICY_NAME --target $CERT_ARN

Write-Host "Downloading Amazon Root CA 1..."
Invoke-WebRequest -Uri "https://www.amazontrust.com/repository/AmazonRootCA1.pem" -OutFile "$CERTS_DIR\AmazonRootCA1.pem"

Write-Host "Fetching AWS IoT Endpoint..."
$endpoint = aws iot describe-endpoint --endpoint-type iot:Data-ATS | ConvertFrom-Json
$IOT_ENDPOINT = $endpoint.endpointAddress

Write-Host ""
Write-Host "========================================="
Write-Host "AWS IoT Provisioning Complete!"
Write-Host "========================================="
Write-Host "Endpoint: $IOT_ENDPOINT"
Write-Host "Certificates saved to: $CERTS_DIR"
Write-Host "Please add this endpoint to your .env.local file as NEXT_PUBLIC_AWS_IOT_ENDPOINT=$IOT_ENDPOINT"
Write-Host "========================================="
