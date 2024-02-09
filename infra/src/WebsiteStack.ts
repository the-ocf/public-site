import { DockerImage, Stack, StackProps } from 'aws-cdk-lib';
import { Certificate } from 'aws-cdk-lib/aws-certificatemanager';
import { Distribution } from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { ARecord, HostedZone } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { BlockPublicAccess, Bucket, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export class WebsiteStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const hostedZone = HostedZone.fromLookup(this, 'HostedZone', {
      domainName: 'openconstructfoundation.org',
    });

    const bucket = new Bucket(this, 'BucketForWebsite', {
      encryption: BucketEncryption.S3_MANAGED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    });

    // Create CloudFront distribution
    const dist = new Distribution(this, 'Distribution', {
      defaultBehavior: { origin: new S3Origin(bucket) },

      certificate: Certificate.fromCertificateArn(this, 'Certificate', 'arn:aws:acm:us-east-1:935412892586:certificate/16724c20-4370-4e56-8d7a-1c1d48022674'),
      domainNames: ['www.openconstructfoundation.org', 'openconstructfoundation.org'],
    });

    new BucketDeployment(this, 'DeployWebsite', {
      sources: [Source.asset('../the-ocf-website/out', {
        bundling: {
          command: ['npm', 'run', 'build'],
          workingDirectory: '../the-ocf-website',
          image: DockerImage.fromRegistry('node:20'),
        },
      })],
      destinationBucket: bucket,
      distribution: dist,
      distributionPaths: ['/*'],
    });


    new ARecord(this, 'Alias', {
      zone: hostedZone,
      target: {
        aliasTarget: new CloudFrontTarget(dist),
      },
      recordName: 'www',
      deleteExisting: true,
    });
    new ARecord(this, 'Alias', {
      zone: hostedZone,
      target: {
        aliasTarget: new CloudFrontTarget(dist),
      },
      deleteExisting: true,
    });
  }

}
