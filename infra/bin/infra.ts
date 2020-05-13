#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();
const hostedZoneId = app.node.tryGetContext("hostedZoneId");
if (!hostedZoneId){
    throw new Error("Please provide a context variable 'hostedZoneId'");
}
new InfraStack(app, 'public-site', { hostedZoneId, env: { region: 'us-east-1' } });
