---
title: "Command Line Arguments"
description: "You'll sometimes want to pass parameters to your CDK module to define subsets of configuration. "
---

## Command Line Arguments

CDK modules are just normal language apps that happen to do something specific. However, since you're typically going 
to synthesize your constructs using `cdk synth` command. This does not allow you to directly pass any build parameters
from your CLI to your code. There are two workarounds though:

## Use Context Variables

Context variables allow you to define variables that are accessible at runtime. More info can be found
on [AWS's Developer Guide](https://docs.aws.amazon.com/cdk/latest/guide/get_context_var.html). The usage looks something like this:

```shell script
$ cdk synth -c some_variable=some_value
```

The `some_variable` is available from within a Stack or Construct using the `.tryGetContext()` method:

```typescript
const some_variable = this.node.tryGetContext('some_variable');
console.log(some_variable); // some_value
```

You can also supply context variables via the `cdk.json` file:

```json
{
  "context": {
    "some_variable": "some_value"
  }
}
```

## Environment Variables

The one drawback to context variables is that they're not available outside of the CDK API. They're only exposed on 
the underlying `node` object in a construct.

If you want values to be accessible outside of a CDK construct, you can use environment variables as well:

```shell
$ SOME_VARIABLE=some_value cdk synth
```

and then inside of your code (but not inside of a CDK construct):

```typescript
const some_variable = process.env["SOME_VARIABLE"];
console.log(some_variable); // some_value
```

## Lots of data

But what happens when you need to be able to provide more than just a few variables. Environment variables and context variables
don't scale particularly well:

```shell script
$ cdk synth -c database_1_type="db.m5.large" -c database_1_engine="mysql" -c database_1_type="db.r5.xlarge" -c database_1_engine="postgres"  
```

This isn't going to work well if you have to define 10 databases.

Instead, all of this information can be put into a json file (or similar) and parsed by your application code:

```json
[
    {"engine":  "mysql", "class":  "db.m5.large"},
    {"engine":  "postgres", "class":  "db.r5.xlarge"}
]

```

These variables would just be loaded at runtime and passed to the construct:

```typescript
const dbDefinitions = require('./dbs.json');
new MyDatabasesStack(app, 'so-many-dbs', dbDefinitions);
```

But this isn't very interesting. What if you need to reuse this stack across multiple projects? 

That's fine! Just use an environment variable to define the file to open:

```shell script
$ DBS_FILE=someproject.json cdk synth
```

And:

```typescript
const projectFile = process.env["DBS_FILE"];
if (!projectFile) {
    throw new Error("Please provide a DBS_FILE to use");
}
const dbDefinitions = require(projectFile);
new MyDatabaseStack(app, 'so-many-dbs', dbDefinitions);
```

Choose which pattern is going to work best for you.