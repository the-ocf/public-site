---
title: AWS Solutions Constructs - First Look
description: AWS has released a set of vetted micro-constructs for use with the CDK. Here's what you need to know.
author: Matthew Bonig @mattbonig
date: 2020-06-30
tags: ["cdk","solutions"]
image: ./preview.png
---

AWS just released the [Solutions Constructs](https://aws.amazon.com/solutions/constructs/), a library of vetted
L3 micro-constructs that can be used as building blocks for serverless applications. These are leveraged the same way
as the standard L2 and L3 constructs. Let's dive right in and take a look at a few.

The CDK code from this post can be found [here](https://github.com/mbonig/solutions-constructs-example).

## API Gateway to Lambda *[docs](https://docs.aws.amazon.com/solutions/latest/constructs/aws-apigateway-lambda.html)*


Here is a standard setup for API Gateway to a Lambda function.

![API Gateway to Lambda Function](./aws-apigateway-lambda.png)

```typescript
const { ApiGatewayToLambda } = require('@aws-solutions-constructs/aws-apigateway-lambda');

new ApiGatewayToLambda(stack, 'ApiGatewayToLambdaPattern', {
    deployLambda: true,
    lambdaFunctionProps: {
        runtime: lambda.Runtime.NODEJS_10_X,
        handler: 'index.handler',
        code: lambda.Code.asset(`${__dirname}/lambda`)
    }
});
```

This creates an API Gateway endpoint that is a full proxy (`{proxy+}`) to the Lambda function it creates.

## Lambda to DynamoDB *[docs](https://docs.aws.amazon.com/solutions/latest/constructs/aws-lambda-dynamodb.html)*

This will create a DynamoDB Table and Lambda function to read or write to it.

![Lambda to DynamoDB](./aws-lambda-dynamodb.png)

```typescript
const { LambdaToDynamoDBProps,  LambdaToDynamoDB } = require('@aws-solutions-constructs/aws-lambda-dynamodb');

const props: LambdaToDynamoDBProps = {
    deployLambda: true,
    lambdaFunctionProps: {
        code: lambda.Code.asset(`${__dirname}/lambda`),
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler'
    },
};

new LambdaToDynamoDB(stack, 'test-lambda-dynamodb-stack', props);
```

This construct also takes care of things like permissions and setting up the DynamoDB Table name in the environment
variables for the Lambda to use.

```typescript
this.lambdaFunction.addEnvironment('DDB_TABLE_NAME', this.dynamoTable.tableName);
this.dynamoTable.grantReadWriteData(this.lambdaFunction.grantPrincipal);
```

## DynamoDB to Lambda *[docs](https://docs.aws.amazon.com/solutions/latest/constructs/aws-dynamodb-stream-lambda.html)*

This creates a DynamoDB table with streams enabled and a lambda as a subscriber.

![DynamoDB to Lambda](./aws-dynamodb-stream-lambda.png)

```typescript
const { DynamoDBStreamToLambdaProps,  DynamoDBStreamToLambda} = require('@aws-solutions-constructs/aws-dynamodb-stream-lambda');

const props: DynamoDBStreamToLambdaProps = {
    deployLambda: true,
    lambdaFunctionProps: {
        code: lambda.Code.asset(`${__dirname}/lambda`),
        runtime: lambda.Runtime.NODEJS_12_X,
        handler: 'index.handler'
    },
};

new DynamoDBStreamToLambda(stack, 'test-dynamodb-stream-lambda', props);
```

This construct automatically sets up the event source and permissions:

```typescript
// Grant DynamoDB Stream read perimssion for lambda function
this.dynamoTable.grantStreamRead(this.lambdaFunction.grantPrincipal);

// Create DynamDB trigger to invoke lambda function
this.lambdaFunction.addEventSource(new DynamoEventSource(this.dynamoTable,
  defaults.DynamoEventSourceProps(props.dynamoEventSourceProps)));
}
```

## Wiring it all together

Now let's go ahead and wire these together to make something useful. What we want is something like the following diagram.
I've removed things like the CloudWatch and Role pieces to simplify it.

![All Wired Together](./wired-together.png)

An API Gateway endpoint that integrates with a lambda function. ➡️
That Lambda reads and writes to the DynamoDB table through the AWS sdk. ➡️
A second Lambda that listens to the DynamoDB stream and acts on it.

Let's take a look at the code:

```typescript
import {Construct, Stack, StackProps} from "@aws-cdk/core";
import {AuthorizationType} from "@aws-cdk/aws-apigateway";
import {Code, Runtime} from "@aws-cdk/aws-lambda";
import {AttributeType, BillingMode} from "@aws-cdk/aws-dynamodb";
import {ApiGatewayToLambda} from '@aws-solutions-constructs/aws-apigateway-lambda';
import {LambdaToDynamoDB} from '@aws-solutions-constructs/aws-lambda-dynamodb';
import {DynamoDBStreamToLambda} from '@aws-solutions-constructs/aws-dynamodb-stream-lambda';

export class SolutionConstructExampleStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const ddbAndStream = new DynamoDBStreamToLambda(this, 'subscriber', {
            deployLambda: true,
            lambdaFunctionProps: {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.subscriber',
                code: Code.fromAsset(`${__dirname}/lambda`)
            },
            dynamoTableProps:{
                partitionKey: {
                    name: "pk",
                    type:AttributeType.STRING
                },
                sortKey: {
                    name: "sk",
                    type:AttributeType.STRING
                },
                billingMode: BillingMode.PROVISIONED
            }
        });

        const apig2lambda = new ApiGatewayToLambda(this, 'api', {
            deployLambda: true,
            lambdaFunctionProps: {
                runtime: Runtime.NODEJS_12_X,
                handler: 'index.handler',
                code: Code.fromAsset(`${__dirname}/lambda`),
                environment: {
                    TABLE: ddbAndStream.dynamoTable.tableName
                }
            },
            apiGatewayProps: {
                defaultMethodOptions: {
                    authorizationType: AuthorizationType.NONE
                }
            }
        });

        new LambdaToDynamoDB(this, 'businesslogic', {
            deployLambda: false,
            existingLambdaObj: apig2lambda.lambdaFunction,
            existingTableObj: ddbAndStream.dynamoTable
        });
    }
}
```

Let's break this down section by section:

```typescript
const ddbAndStream = new DynamoDBStreamToLambda(this, 'subscriber', {
    deployLambda: true,
    lambdaFunctionProps: {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.subscriber',
        code: Code.fromAsset(`${__dirname}/lambda`)
    },
    dynamoTableProps:{
        partitionKey: {
            name: "pk",
            type:AttributeType.STRING
        },
        sortKey: {
            name: "sk",
            type:AttributeType.STRING
        },
        billingMode: BillingMode.PROVISIONED
    }
});
```

We start with the end, and create the DynamoDB table and Lambda stream subscriber. We allow the construct to create both
of the resources.

Next, we need the API Gateway to Lambda construct:

```typescript
const apig2lambda = new ApiGatewayToLambda(this, 'api', {
    deployLambda: true,
    lambdaFunctionProps: {
        runtime: Runtime.NODEJS_12_X,
        handler: 'index.handler',
        code: Code.fromAsset(`${__dirname}/lambda`),
        environment: {
            TABLE: ddbAndStream.dynamoTable.tableName
        }
    },
    apiGatewayProps: {
        defaultMethodOptions: {
            authorizationType: AuthorizationType.NONE
        }
    }
});
```

This creates the API Gateway resources and the Lambda function that backs it. We've now got most of our architecture
together, now we're just going to use the LambdaToDynamoDB construct:

```typescript

new LambdaToDynamoDB(this, 'businesslogic', {
    deployLambda: false,
    existingLambdaObj: apig2lambda.lambdaFunction,
    existingTableObj: ddbAndStream.dynamoTable
});
```

We're not going to let the construct actually creating anything new, just use the existing Lambda from the `apig2lambda`
construct and the table from the `ddbAndStream`. At this point the construct isn't really doing a whole lot. Looking
at the construct code:

```typescript
    this.lambdaFunction = defaults.buildLambdaFunction(this, {
      deployLambda: props.deployLambda,
      existingLambdaObj: props.existingLambdaObj,
      lambdaFunctionProps: props.lambdaFunctionProps
    });

    this.dynamoTable = defaults.buildDynamoDBTable(this, {
      dynamoTableProps: props.dynamoTableProps,
      existingTableObj: props.existingTableObj
    });

    this.lambdaFunction.addEnvironment('DDB_TABLE_NAME', this.dynamoTable.tableName);

    this.dynamoTable.grantReadWriteData(this.lambdaFunction.grantPrincipal);

    // Conditional metadata for cfn_nag
    if (props.dynamoTableProps?.billingMode === dynamodb.BillingMode.PROVISIONED) {
      const cfnTable: dynamodb.CfnTable = this.dynamoTable.node.findChild('Resource') as dynamodb.CfnTable;
      cfnTable.cfnOptions.metadata = {
          cfn_nag: {
              rules_to_suppress: [{
                  id: 'W73',
                  reason: `PROVISIONED billing mode is a default and is not explicitly applied as a setting.`
              }]
          }
      };
    }
  }
```

This construct grants permissions and sets an environment variable.

We could have let the LambdaToDynamoDB construct create the DynamoDB table and then pass that to the DynamoDBStreamToLambda
construct instead.

## Conclusion

There ya go, in just a few small steps you've got a clean and easy to maintain architecture. The constructs
are enforcing best practices and common logic.

The rest of the constructs in the Solutions Constructs library are very similar, giving you small building blocks used
to build larger systems.

Like the CDK, the strength comes from a thriving community of L3 constructs you can use to build architectures. The
addition of these new AWS Solutions Constructs should help get organizations building great systems. There are 25 patterns
 [currently](https://aws.amazon.com/solutions/constructs/patterns/?constructs-master-cards.sort-by=item.additionalFields.headline&constructs-master-cards.sort-order=asc) and I'm
excited to see how this grows over time.
