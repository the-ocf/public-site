import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { WebsiteStack } from './WebsiteStack';

export class WebsiteStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);
    new WebsiteStack(this, 'Website', {
      ...props,
    });
  }

}
