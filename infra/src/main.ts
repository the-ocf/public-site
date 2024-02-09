import { App } from 'aws-cdk-lib';
import { PipelineStack } from './PipelineStack';


const app = new App();

new PipelineStack(app, 'OcfWebsitePipeline', {
  env: {
    account: '935412892586',
    region: 'us-east-1',
  },
});

app.synth();
