import {Bucket, BucketEncryption, RedirectProtocol} from '@aws-cdk/aws-s3';
import {Construct, SecretValue, Stack, StackProps} from '@aws-cdk/core';
import {HostedZone, RecordSet, RecordTarget, RecordType} from '@aws-cdk/aws-route53';

import {CloudFrontTarget} from '@aws-cdk/aws-route53-targets'
import {Artifact, Pipeline} from "@aws-cdk/aws-codepipeline";
import {CodeBuildAction, GitHubSourceAction, S3DeployAction} from "@aws-cdk/aws-codepipeline-actions";
import {BuildSpec, ComputeType, LinuxBuildImage, PipelineProject} from '@aws-cdk/aws-codebuild';
import {DnsValidatedCertificate} from "@aws-cdk/aws-certificatemanager";
import {CloudFrontWebDistribution, OriginAccessIdentity, ViewerCertificate} from "@aws-cdk/aws-cloudfront";
import { PolicyStatement } from '@aws-cdk/aws-iam';

export interface InfraStackProps extends StackProps {
    hostedZoneId: string;
}

export class InfraStack extends Stack {
    websiteBucket: Bucket;
    redirectBucket: Bucket;
    private buildArtifactBucket: Bucket;
    private buildSpec: any;
    private distribution: CloudFrontWebDistribution;
    private props: InfraStackProps;
    private oai: OriginAccessIdentity;

    constructor(scope: Construct, id: string, props: InfraStackProps) {
        super(scope, id, props);

        this.props = props;
        // The code that defines your stack goes here
        this.setupBucket();
        this.setupRoute53();
        this.setupBuildSpec();
        this.setupCodePipeline();
    }

    setupBucket() {

        this.buildArtifactBucket = new Bucket(this, 'build-artifact-bucket', {
            encryption: BucketEncryption.KMS_MANAGED,
            bucketName: 'ocf-build-artifact-bucket',
            publicReadAccess: false
        });


        this.websiteBucket = new Bucket(this, 'website-bucket', {
            bucketName: 'www.openconstructfoundation.org',
            blockPublicAccess:{
                blockPublicAcls: true,
                blockPublicPolicy: true,
                ignorePublicAcls: true,
                restrictPublicBuckets: true
            }
        });

        this.oai = new OriginAccessIdentity(this, 'oai', {});
    }

    setupRoute53() {
        let domainName = "openconstructfoundation.org";
        let SAN = `www.${domainName}`;

        const hostedZone = HostedZone.fromHostedZoneAttributes(this, 'zone', {
            hostedZoneId: this.props.hostedZoneId,
            zoneName: domainName
        });

        const cert = new DnsValidatedCertificate(this, 'cert', {
            hostedZone,
            domainName,
            subjectAlternativeNames: [SAN]
        });

        this.distribution = new CloudFrontWebDistribution(this, 'distribution', {
            viewerCertificate: ViewerCertificate.fromAcmCertificate(cert, {aliases: [domainName, SAN]}),

            originConfigs: [
                {
                    s3OriginSource: {
                        s3BucketSource: this.websiteBucket,
                        originAccessIdentity: this.oai
                    },
                    behaviors: [{isDefaultBehavior: true}]
                }
            ]
        });


        new RecordSet(this, 'website-dns-root', {
            recordType: RecordType.A,
            recordName: '@',
            zone: hostedZone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution))
        });
        new RecordSet(this, 'website-dns', {
            recordType: RecordType.A,
            recordName: 'www',
            zone: hostedZone,
            target: RecordTarget.fromAlias(new CloudFrontTarget(this.distribution))
        });
        //
        // new RecordSet(this, 'website-dns-root', {
        //     recordType: RecordType.A,
        //     recordName: '@',
        //     zone: hostedZone,
        //     target: RecordTarget.fromAlias(new BucketWebsiteTarget(this.redirectBucket))
        // });
        //
        // new RecordSet(this, 'website-dns', {
        //     recordType: RecordType.A,
        //     recordName: 'www',
        //     zone: hostedZone,
        //     target: RecordTarget.fromAlias(new BucketWebsiteTarget(this.websiteBucket))
        // });
    }

    private setupCodePipeline() {
        let sourceArtifact = new Artifact('source-code');
        let compiledSite = new Artifact("built-site");

        const project = new PipelineProject(this, `ocf-build-project`, {
            buildSpec: BuildSpec.fromSourceFilename("buildspec.yml"),
            environment: {
                buildImage: LinuxBuildImage.AMAZON_LINUX_2_2,
                computeType: ComputeType.SMALL,
                privileged: true
            }
        });

        const s3DeployAction = new S3DeployAction({
            actionName: 'copy-files',
            bucket: this.websiteBucket!,
            input: compiledSite,
            runOrder: 1
        });

        new Pipeline(this, "build-pipeline", {
            artifactBucket: this.buildArtifactBucket,
            pipelineName: 'ocf-build-pipeline',
            stages: [
                {
                    stageName: "pull", actions: [
                        new GitHubSourceAction({
                            owner: 'Open-Construct-Foundation',
                            repo: 'public-site',
                            output: sourceArtifact,
                            oauthToken: SecretValue.secretsManager('oauth-token'),
                            actionName: "pull-from-github"
                        })
                    ]
                },
                {
                    stageName: "build", actions: [
                        new CodeBuildAction({
                            actionName: 'build',
                            input: sourceArtifact,
                            outputs: [compiledSite],
                            project
                        })
                    ]
                },
                {
                    stageName: "deploy", actions: [
                        s3DeployAction
                    ]
                },
            ]
        });
    }

    private setupBuildSpec() {
        this.buildSpec = {
            version: '0.2',
            phases: {
                install: {
                    "runtime-versions": {
                        "nodejs": "12"
                    },
                    commands: [
                        `curl -O -L https://github.com/gohugoio/hugo/releases/download/v0.63.1/hugo_0.63.1_Linux-64bit.tar.gz`,
                        `tar -xvf hugo*.tar.gz hugo`,
                        `mv hugo /usr/local/bin`
                    ]
                },
                build: {
                    commands: [
                        'npm install',
                        `npm run build:prod`
                    ],
                },
            },
            artifacts: {
                files: ["**/*"],
                "base-directory": "dist"
            }
        }
    }


}
