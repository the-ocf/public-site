import { Bucket, RedirectProtocol } from '@aws-cdk/aws-s3';
import { Stack, Construct, StackProps } from '@aws-cdk/core';
import { RecordSet, RecordType, RecordTarget, HostedZone } from '@aws-cdk/aws-route53';

import { BucketWebsiteTarget } from '@aws-cdk/aws-route53-targets'
export class InfraStack extends Stack {
  websiteBucket: Bucket;
  redirectBucket: Bucket;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    this.setupBucket();
    this.setupRoute53();
  }
  setupBucket() {
    this.websiteBucket = new Bucket(this, 'website-bucket', {
      bucketName: 'www.openconstructfoundation.org',
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html'
    });

    this.redirectBucket = new Bucket(this, 'redirect-bucket', {
      bucketName: 'openconstructfoundation.org',
      websiteRedirect: { hostName: 'www.openconstructfoundation.org', protocol: RedirectProtocol.HTTP }
    });
  }
  setupRoute53() {
    const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'zone', { hostedZoneId: 'Z5F4VBVHHUZME', zoneName: 'openconstructfoundation.org' });

    new RecordSet(this, 'website-dns-root', {
      recordType: RecordType.A,
      recordName: '@',
      zone: hostedZone,
      target: RecordTarget.fromAlias(new BucketWebsiteTarget(this.redirectBucket))
    });

    new RecordSet(this, 'website-dns', {
      recordType: RecordType.A,
      recordName: 'www',
      zone: hostedZone,
      target: RecordTarget.fromAlias(new BucketWebsiteTarget(this.websiteBucket))
    });
  }

}
