---
title: "Create a good CDK construct README"
---

## Creating a good CDK Construct README

Leveraging a CDK module should be as easy as possible for the community. We believe that starts with a good README file. Below are some tips for how to write a good README for a CDK Construct or Example

1. Define the purpose of the Construct/Example
    1. What is abstracted
    1. What benefits does it provide?
    
    Good Example:
    
    ""
    
    Bad Example:

1. Show an example usage of the Construct
    1. Include reasonable example values
    1. Show any additional usages you believe will be common
    1. Bonus points if you include a full `cdk synth` pipeline so anyone can just clone your code, run `cdk synth` and have a usable CloudFormation template.    

1. Mention any design considerations or gotchas
    1. There may be use cases where you know your Construct/Example won't work well. Mention those
    
1. As with all good open-source code, license and contribution options should be included.
