---
title: "Upgrading your CDK code"
description: "The CDK is rapidly changing and here are some tips for keeping up with it."
author: Matthew Bonig @mattbonig
tags: ["cli", "upgrading"]

---

The CDK is rapidly changing with minor version releases hitting every few days.

If you're actively developing against the CDK with Typescript you've probably ran into this error:

```shell script
error TS2345: Argument of type 'this' is not assignable to parameter of type 'Construct'.
```

and it usually comes after you just installed an AWS CDK module like `@aws-cdk/aws-ec2`. But why?

The CDK modules have a hard dependency on the `core` module. If your `core` (and other CDK modules) are all on version 1.34.1 and 1.35.0 is released, then an `npm install -s @aws-cdk/aws-ec2` will install 1.35.0, creating a break and exhibiting this error.

The CDK is [actively working on addressing this issue](https://github.com/aws/aws-cdk-rfcs/blob/master/text/0006-monolothic-packaging.md).

Until then, you will need to make sure all your cdk modules are the same version. This can usually be done by running:

```shell script
$ npm update
```

If this doesn't update your packages it's probably because you have a pinned version:

```json
    "@aws-cdk/core": "1.35.0"
```



