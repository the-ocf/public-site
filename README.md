# The Open Construct Foundation Public Site

This is the source for the public facing openconstructfoundation.org website.

## Contents

* infra - the CDK Module that deploys the AWS infrastucture to support this site
* src - the source code, a [Hugo](https://gohugo.io/) site.

## Development

To install the hugo cli, refer to [these](https://gohugo.io/getting-started/installing/) docs.

To run the hugo server:

```shell script
$ cd src
$ hugo server -w
```

#### Theme changes

If you want to make changes to the theme of the site, those changes are made directly in the [src/themes/hugo-tailwind-journal](). To recompile Tailwind CSS:

```shell script
$ cd src/themes/huge-tailwind-journal
$ npm run watch

```

## Contribute

This website is supported by the community. If you'd like to contribute, please open a [PR](https://github.com/Open-Construct-Foundation/public-site/pulls).
