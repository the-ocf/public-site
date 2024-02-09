import { Stack, StackProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep } from 'aws-cdk-lib/pipelines';
import { Construct } from 'constructs';
import { WebsiteStage } from './WebsiteStage';

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('the-ocf/public-site', 'main', {
          connectionArn: 'arn:aws:codestar-connections:us-east-1:935412892586:connection/d4dc7104-a60f-4f8f-b259-48b98cea4b22',
        }),
        commands: [
          'yarn',
          'yarn build',
          'npx cdk synth',
        ],
      }),
    });

    pipeline.addStage(new WebsiteStage(this, 'Prod', {
      ...props,
    }));
  }
}
