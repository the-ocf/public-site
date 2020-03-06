---
title: "Testing your CDK code"
description: "One of the biggest advantages of the CDK is that you can unit test your IaC. Learn details on how to here."
---

## Testing your CDK code

There are a lot of good resources regarding testing your code. Start with some in the [official docs](https://docs.aws.amazon.com/cdk/latest/guide/testing.html).



## Additional ways of testing

The above link shows the most common ways to test your CDK code, either through snapshots or the `haveResource` functions.

Sometimes, though, you need to get more "in the weeds". Since the CDK is an object-based API, it's easy to just evaluate those objects.

Let's say you have created a CodePipeline.Pipeline object that uses an S3DeployAction to push built files to an S3 bucket. Here's one way you can test to make sure those files will be deployed with private ACLs:

```typescript
test('deploys to s3 bucket with private when cert set', () => {
    // get the test stack
    const stack = createTestStack();
    
    // find the Pipeline object
    const pipeline = stack.node.findChild('pipeline') as Pipeline;
    
    // get the third stage actions
    const deployActions = pipeline.stages[2].actions;

    // get the first action, cast it to an S3DeployAction
    const deployAction = deployActions[0] as S3DeployAction;

    // expect the ACL to be private.
    // @ts-ignore
    expect(deployAction.props.accessControl).toBe("private");
});
```

Notice in this case I'm doing a `@ts-ignore` to prevent errors regarding the access of private variables.
