#!/bin/bash
# AWS IoT Foundation Setup Script
# This script creates an AWS IoT Thing, Generates Certificates, and outputs endpoint info.
# NOTE: Requires AWS CLI to be installed and configured (`aws configure`).

set -e

THING_NAME="DigitalTwinSpindleAlpha"
POLICY_NAME="DigitalTwinSpindleAlphaPolicy"
CERT_DIR="./.aws_certs"

echo "Creating AWS IoT Thing: $THING_NAME..."
aws iot create-thing --thing-name "$THING_NAME"

echo "Creating Certificates directory at $CERT_DIR..."
mkdir -p $CERT_DIR

echo "Generating Certificates..."
CERT_RESPONSE=$(aws iot create-keys-and-certificate --set-as-active \
  --certificate-pem-outfile "$CERT_DIR/certificate.pem.crt" \
  --public-key-outfile "$CERT_DIR/public.pem.key" \
  --private-key-outfile "$CERT_DIR/private.pem.key")

CERT_ARN=$(echo $CERT_RESPONSE | jq -r '.certificateArn')

echo "Creating IoT Policy..."
POLICY_DOC='{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["iot:Connect", "iot:Publish", "iot:Subscribe", "iot:Receive"],
      "Resource": ["*"]
    }
  ]
}'

aws iot create-policy --policy-name "$POLICY_NAME" --policy-document "$POLICY_DOC" || echo "Policy already exists."

echo "Attaching Policy to Certificate..."
aws iot attach-policy --policy-name "$POLICY_NAME" --target "$CERT_ARN"

echo "Attaching Certificate to Thing..."
aws iot attach-thing-principal --thing-name "$THING_NAME" --principal "$CERT_ARN"

echo "Retrieving IoT Endpoint..."
ENDPOINT=$(aws iot describe-endpoint --endpoint-type iot:Data-ATS --query "endpointAddress" --output text)

echo "====================================================="
echo "AWS IoT Setup Complete."
echo "Your Endpoint: $ENDPOINT"
echo "Certificates saved in $CERT_DIR."
echo "Add the Endpoint to your .env.local file as AWS_IOT_ENDPOINT=$ENDPOINT"
echo "====================================================="
