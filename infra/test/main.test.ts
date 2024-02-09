import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';

import { WebsiteStack } from '../src/WebsiteStack';

test('Snapshot', () => {
  const app = new App();
  const stack = new WebsiteStack(app, 'test', {
    env: {
      account: '123456789012',
      region: 'us-east-1',
    },
  });

  const template = Template.fromStack(stack);
  expect(template.toJSON()).toMatchSnapshot();
});
