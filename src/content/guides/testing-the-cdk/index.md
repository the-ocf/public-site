---
title: "Testing your CDK code"
description: "One of the biggest advantages of the CDK is that you can unit test your IaC. Learn details on how to here."
---


## Testing your CDK code

The official AWS CDK documentation already covers this subject pretty well and includes some simple examples.

[https://docs.aws.amazon.com/cdk/latest/guide/testing.html]()

Additionally, the constructs you create are just objects and can be tested as you would other object trees.

```typescript
test('Topic was created', () => {
    const testStack = getStack();
    const topic: Topic = testStack.node.findChild('notifications') as Topic;
    should(topic.topicName.startsWith("notifications")).be.true();
});
```

Be mindful that you don't want to go too far into the underlying API for the Construct. These are implementation details that might change in future versions which could cause failures in the future.

That being said, this can be a last choice "release valve" for testing aspects of your code that can't be easily tested using other means.
