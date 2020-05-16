---
title: Testing and migrating to the cdk8s
description: Now that the cdk8s is out you may want to start moving some workloads to it. Setting up and testing your migrated code is easier than you might expect.
author: Matthew Bonig @mattbonig
tags: ["cdks","kubernetes","testing"]
---

The [cdk8s](https://aws.amazon.com/blogs/containers/introducing-cdk-for-kubernetes/) was just released in alpha. While
still early, there is a lot of potential!

I currently manage a kubernetes cluster for four websites. Three are [MEAN](https://en.wikipedia.org/wiki/MEAN_(solution_stack))
stack applications and one a Wordpress site. There is both a Mongo and MySQL database backing the sites. I've been using
static .yaml files for all the resource management, never having invested in trying to setup Helm charts. I decided
to migrate one application to a cdk8s app. The initial code was pretty easy to write up. I'm not going to cover it here,
though. It looks just like the example code seen in the blog
and [the CNCF Webinar](https://www.cncf.io/webinars/end-yaml-engineering-with-cdk8s/).

On a first pass I just visually confirmed the resulting templates. Then, I moved on to doing a `kubectl diff`
and was generally happy with the results. A finally integration test and my site was still working.
However, that doesn't scale and I had 3 more sites to do this for. So I wanted to write automated tests around it.

The current version of the cdk8s does not come with any testing pipeline in place, so here's how I setup one.

## Project Setup

I started by changing a few things in the package.json, adding some dependencies and setting `test` to run jest:

```json
"scripts": {
    ...
    "test": "jest",
    ...
},
"devDependencies": {
    "@types/jest": "^25.2.2",
    "@types/js-yaml": "^3.12.4",
    ...
    "jest": "^26.0.1",
    "js-yaml": "^3.13.1",
    "ts-jest": "^26.0.0"
}
```

I ran an `npm i` before continuing.

I needed to add a jest.config.js to the root (stolen from the CDK boilerplate):

```js
module.exports = {
  "roots": [
    "<rootDir>/test"
  ],
  testMatch: [ '**/*.test.ts'],
  "transform": {
    "^.+\\.tsx?$": "ts-jest"
  },
}
```

*If you'd like to use a different naming scheme than *.test.ts, just change that 5th line.*

I didn't want to test anything but the pipeline so I added a simple placeholder test:

```ts
describe('LoadBalancedWebsite', () => {
    test('empty', () => {

    });
});
```

I ran the test, looking for a positive result:

```shell script
$ npm run test
```

And I've got the testing pipeline in place!

```shell script
> jest

 PASS  test/main.test.ts
  LoadBalancedWebsite
    ✓ empty

Test Suites: 1 passed, 1 total
Tests:       1 passed, 1 total
Snapshots:   0 total
Time:        1.679 s
Ran all test suites.
```

### The First Test

Time to get started with the real work!

I had to decide how to test against my existing definitions. Thankfully that turned out to be pretty straight forward.
I had the existing .yaml files, so I tried doing a simple comparision. I get the synth'd results, compare that to the
files I had, and that was a good enough 'snapshot' style test:

```typescript
import {App, Chart, Testing} from 'cdk8s';
import {LoadBalancedWebsite} from "../website";
import * as jsyaml from 'js-yaml';
import * as fs from 'fs';

describe('LoadBalancedWebsite', () => {
    let existing: any;
    beforeAll(() => {
        // read the existing yaml files and parse them into the `existing` object for tests to use.
        const [namespace, deployment] = fs.readFileSync(__dirname + '/website.yaml').toString().split('---').map(x => jsyaml.load(x));
        const service = jsyaml.load(fs.readFileSync(__dirname + '/service.yaml').toString());
        const ingress = jsyaml.load(fs.readFileSync(__dirname + '/routing.yaml').toString());
        existing = {
            namespace, deployment, service, ingress
        }
    })
    let results: any[];
    beforeEach(() => {

        // create the app and chart to test with
        const app = new App();
        const testChart = new Chart(app, 'test-chart');

        // everything is encompassed in this construct:
        new LoadBalancedWebsite(testChart, 'thewebsite', {
            env: [
                {name: "NODE_ENV", value: "production"},
                {name: "PORT", value: "3000"},
                {
                    name: "MONGOHQ_URL",
                    value: "mongodb://theconnectionurl..."
                },
            ],
            hosts: [
                "test.fourlittledogs.com"
            ],
            annotations: {
                "cert-manager.io/cluster-issuer": "letsencrypt-thewebsite"
            },
            image: 'fourlittledogs/thewebsite:latest',
            namespace: 'thewebsite',
            tlsSecretName: "letsencrypt-thewebsite"
        });

        // synth and save the results off...
        results = Testing.synth(testChart);
    });

    test('namespace matches', () => {
        const [namespace] = results;
        expect(namespace).toEqual(existing.namespace);
    });
});
```

Right now the construct is a pretty verbose and I'll clean up the LoadBalancedWebsiteProps later...

There's a bit going on here so let's review it piece by piece:

```typescript
import {App, Chart, Testing} from 'cdk8s';
import {LoadBalancedWebsite} from "../website";
import * as jsyaml from 'js-yaml';
import * as fs from 'fs';
```

The LoadBalancedWebsite is the construct being tested. The js-yaml parses the yaml to a JS object. The 'fs' is standard
node for reading the existing .yamls. The `Testing` from cdk8s provides a handy `.synth()` helper method.

```typescript
let existing: any;
beforeAll(() => {
    // read the existing yaml files and parse them into the `existing` object for tests to use.
    const [namespace, deployment] = fs.readFileSync(__dirname + '/website.yaml').toString()
                                      .split('---')
                                      .map(x => jsyaml.load(x));
    const service = jsyaml.load(fs.readFileSync(__dirname + '/service.yaml').toString());
    const ingress = jsyaml.load(fs.readFileSync(__dirname + '/routing.yaml').toString());
    existing = {
        namespace, deployment, service, ingress
    }
})
```

Before the tests run I read in the existing .yaml definitions I wrote last year. Notice on the first line where I have to
split the file by "---" as the js-yaml module doesn't support reading a file with multiple blocks.

```typescript
let results: any[];
beforeEach(() => {

    // create the app and chart to test with
    const app = new App();
    const testChart = new Chart(app, 'test-chart');

    // everything is encompassed in this construct:
    new LoadBalancedWebsite(testChart, 'thewebsite', {
        env: [
            {name: "NODE_ENV", value: "production"},
            {name: "PORT", value: "3000"},
            {
                name: "MONGOHQ_URL",
                value: "mongodb://theconnectionurl..."
            },
        ],
        hosts: [
            "test.fourlittledogs.com"
        ],
        annotations: {
            "cert-manager.io/cluster-issuer": "letsencrypt-thewebsite"
        },
        image: 'fourlittledogs/thewebsite:latest',
        namespace: 'thewebsite',
        tlsSecretName: "letsencrypt-thewebsite"
    });

    // synth and save the results off...
    results = Testing.synth(testChart);
});
```

Before each test is run I recreate and resynth the chart into the results variable.

```typescript
test('namespace matches', () => {
    const [namespace] = results;
    expect(namespace).toEqual(existing.namespace);
});
```

And finally, the comparison. I'm using a straight `.toEqual()` here but writing helpers like the CDK has with
`haveResourceLike` should be helpful in the future.

A few more tests like this and I have the applications controlled through the
cdk8s and replacing static files. I feel confident I can now refactor code and cleanup the props and have a good
testing pipeline in place.

Of course, these snapshots can be replaced with more specific tests later, evaluating the object tree any which way
you like, [as seen here](/testing-the-cdk/).

I've got about 5 more deployments (3 sites and 2 dbs) to test this process out on. Better get to it...

Happy constructing!
