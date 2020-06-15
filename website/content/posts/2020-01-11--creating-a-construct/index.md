---
title: How to Create CDK Constructs
description: "Creating reusable CDK constructs is easier than you may think. Thanks to Github actions you have build and distribute a custom CDK Construct in under an hour."
author: Matthew Bonig @mattbonig
date: 2020-01-11
tags: ["construct","construct development"]
---
The AWS [Cloud Development Kit](https://aws.amazon.com/cdk) offers a powerful and
flexible way to manage your AWS infrastructure. While the CDK ships with a lot of existing constructs to
leverage, there are reasons you will need to create your own. Perhaps you want to abstract common infrastructure
behind something that's easily reusable by your DevOps teams. Or maybe you need to enforce business standards.
Either way, learning how to make a reusable construct provides huge recurring value over the life of your
Infrastructure as Code.

I'm not going to cover much about what makes a good reusable construct (that's coming later). Instead, the goal
is to show you the technical setup of how to get it done. First is creating a JSII module that is our construct, and the second is
getting it built and published. In this case I'm going to use Github as my git repository and GitHub Actions for
automatic publishing, leveraging [Daniel
Schroeder's excellent Docker container](https://github.com/marketplace/actions/jsii-publish).
For simplicity the construct will be a simple S3 Bucket with encryption enforced.

Finally, I'll talk a little bit about the CDK Construct Catalog, and how you can automatically publish to it.

All code for this guide is available publicly [on github](https://github.com/mbonig/secure-bucket).

## Create a JSII-based construct
The JSII is the library that underpins the AWS CDK and makes it possible to write a CDK construct once in TypeScript/Javascript and then compile and distribute it for other languages like Python, Java, and C#.

Start by creating a new project, following the JSII docs. Take your time to read the Configuration section as there is a lot of useful information, some of which is absolutely required for proper JSII compilation and publishing.

Once done you should have the basic shell of a module. However, the JSII does not bootstrap any testing framework, so let's do that now.

```shell script
$ npm i --save-dev @types/jest @types/node ts-jest
```


Let's also go ahead and fill out the scripts section of the package.json by adding the test/watch scripts:

```json

    "scripts": {
        "build": "jsii",
        "build:watch": "jsii -w",
        "package": "jsii-pacmak",
        "test": "tsc && jest",
        "watch": "tsc -w"
    }
```


Also, create a jest.config.js file in the base dir with the following contents:

```js

module.exports = {
    "roots": [
        "/"
    ],
    testMatch: ['**/*.test.ts'],
    "transform": {
        "^.+\\.tsx?$": "ts-jest"
    },
};
```



Now we can run some basic Jest tests around our construct with a simple command:

```shell script
$ npm run test
```


But, we don't have any tests yet, so nothing happens.

Next we're going to write some unit tests and create a construct. I'm not going to go into details here but you should at least see some code. In this case the construct is just going to wrap an S3 Bucket and ensure that it always has encryption enabled.

Don't forget to install some dependencies first, both for the unit testing and for the construct itself:

```shell script
$ npm i -s @aws-cdk/core @aws-cdk/aws-s3
$ npm i --save-dev @aws-cdk/assert
```

Note: When installing dependencies, review your package.json before publishing. If you'd like to support future versions of the CDK, ensure your peerDependencies are setup with a "^":

```json
"peerDependencies": {
  "@aws-cdk/core": "^1.45.0",
  "@aws-cdk/aws-lambda-nodejs": "^1.45.0",
  "@aws-cdk/aws-sqs": "^1.45.0"
}
```

Without this your construct will only support the specific version of the CDK you have in your package.json. This isn't very convienent. 

Here's the test and code:

The test: lib/index.test.ts

```ts
import {SecureBucket} from "../lib/index";
import {App, Stack} from "@aws-cdk/core";
import '@aws-cdk/assert/jest';
import {BucketEncryption} from "@aws-cdk/aws-s3";

test('Has one encrypted Bucket', () => {
    const mockApp = new App();
    const stack = new Stack(mockApp, 'testing-stack');

    new SecureBucket(stack, 'testing', {});

    expect(stack).toHaveResource("AWS::S3::Bucket", {
        "BucketEncryption": {
            "ServerSideEncryptionConfiguration": [
                {
                    "ServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "aws:kms"
                    }
                }
            ]
        }
    });

});

test('Does not allow for unencrypted buckets', () => {
    const mockApp = new App();
    const stack = new Stack(mockApp, 'testing-stack');

    new SecureBucket(stack, 'testing', {encryption: BucketEncryption.UNENCRYPTED});

    expect(stack).toHaveResource("AWS::S3::Bucket", {
        "BucketEncryption": {
            "ServerSideEncryptionConfiguration": [
                {
                    "ServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "aws:kms"
                    }
                }
            ]
        }
    });
});

test('Allows override of default encryption', () => {
    const mockApp = new App();
    const stack = new Stack(mockApp, 'testing-stack');

    new SecureBucket(stack, 'testing', {encryption: BucketEncryption.S3_MANAGED});

    expect(stack).toHaveResource("AWS::S3::Bucket", {
        "BucketEncryption": {
            "ServerSideEncryptionConfiguration": [
                {
                    "ServerSideEncryptionByDefault": {
                        "SSEAlgorithm": "AES256"
                    }
                }
            ]
        }
    });
});
```

The code: lib/index.ts

```ts
import {Construct} from "@aws-cdk/core";
import {Bucket, BucketEncryption, BucketProps} from '@aws-cdk/aws-s3'

export class SecureBucket extends Construct {

    constructor(scope: Construct, id: string, props?: BucketProps) {
        super(scope, id);

        let newProps: BucketProps = {...props};
        if (!props || props?.encryption === undefined || props?.encryption === BucketEncryption.UNENCRYPTED) {
            // @ts-ignore TS2540
            newProps.encryption = BucketEncryption.KMS_MANAGED;
        }
        new Bucket(this, `${id}-bucket`, newProps);
    }
}
```

Once that's setup you can run your unit tests:

```shell script
$ npm run test
```


And we get some test results!

```shell script
> secure-bucket@1.0.0 test /home/mbonig/projects/construct-blog/secure-bucket
> jest

 PASS  lib/index.test.ts
  ✓ Has one encrypted Bucket (59ms)
  ✓ Does not allow for unencrypted buckets (14ms)
  ✓ Allows override of default encryption (10ms)

Test Suites: 1 passed, 1 total
Tests:       3 passed, 3 total
Snapshots:   0 total
Time:        1.175s
Ran all test suites.
```

Now we can build and package the JSII module:

```shell script
$ npm run build

> secure-bucket@1.0.0 build /home/mbonig/projects/construct-blog/secure-bucket
> jsii
```

and

```shell script
$ npm run package

> secure-bucket@1.0.0 package /home/mbonig/projects/construct-blog/secure-bucket
> jsii-pacmak
```

Now if you're like me, you're likely to get some errors during the first time you run build and package because you need to have the dotnot cli, the mvn cli and the jdk installed, and you'll get a warning about twine so install that too. Google for your particular system's favorite package manager for details on getting them installed. I run a debian-based distro so it's mostly:

```shell script
$ pip3 install twine --user
$ sudo apt install dotnet maven openjdk
```

Keep running your build and package until all errors are gone. The result should just be a new .jsii file in the local directory and the dist/ directories getting filled out for our major package managers.

```shell script
$ ls -al dist
Permissions Size User   Date Modified Git Name
drwxr-xr-x     - mbonig 11 Jan  9:42   -- dist/
drwxr-xr-x     - mbonig 11 Jan 15:57   -- ├── dotnet/
drwxr-xr-x     - mbonig 11 Jan  9:47   -- ├── java/
drwxr-xr-x     - mbonig 11 Jan 15:57   -- ├── js/
drwxr-xr-x     - mbonig 11 Jan  9:41   -- └── python/
```

Huzzah! We now have a working JSII module that's unit tested and deliverable to the various package managers. Now we just have to deliver them! But first, go ahead and push your repository to Github and update references in your package.json accordingly.

By the way, all of this code is available [here](https://github.com/mbonig/secure-bucket).

## Github Actions

GitHub Actions is a very convienent and cheap automation pipeline. In our case, we're going to use Daniel Schroeder's Github Action to build and deploy our new JSII construct to NPM, NuGet, PyPi and Github (Maven).

Following the instructions on the linked page is pretty straight forward. You'll have to create accounts at all the places you want to publish and generate Access Tokens. Once you have them, create Secrets in your Github Repository. And you should be all set.

Go ahead now and create a new Tag/Release in your Github Repository and the Action will begin. Review its progress. You should see it produce log lines like:

```shell script
Building source...
...
Building packages...
...
📦 Publishing npm package...
...
✅ Done
📦 Publishing PyPI package...
...
✅ Done
📦 Publishing NuGet package...
...
✅ Done
📦 Publishing Maven package...
...
✅ Done
```


Of course, your mileage may vary if you decided not to publish to any of those Package Managers (but why would you do that?).

# The Construct Catalog
In December of 2019 the Construct Catalog was created to index and document all the fantastic CDK constructs that are being created by the community. If you create a JSII-based construct and publish it to NPM with a keyword of "cdk", like so:

```json
  "keywords": [
    "cdk"
  ]
```


Then your construct will automatically be picked up and cataloged by the Construct Catalog!

Note that as of this writing (2020-01-21), constructs can take some time to publish (we've observed latencies as high as 40 minutes)

### Update: As of Q2-2020 this is usually a fast process. If you don't see results in 10 minutes, please reach out on the [Gitter channel](https://gitter.im/CDK-Construct-Catalog/community).

Happy constructing!
