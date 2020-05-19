const AWS = require('aws-sdk');
const cloudfront = new AWS.CloudFront();

exports.handler = async(event) => {
    // Extract the Job ID
    console.log('event:', event);
    const job_id = event['CodePipeline.job']['id'];

    // Extract the Job Data
    const job_data = event['CodePipeline.job']['data'];
    console.log('job_data:', job_data);
    const distribution_id = job_data.actionConfiguration.configuration.UserParameters.replace(/"/g, '');

    console.log('invalidating distribution:', distribution_id);
    await cloudfront.createInvalidation({
        DistributionId: distribution_id,
        InvalidationBatch: {
            CallerReference: `invalidate-after-s3-${new Date().getTime()}`,
            Paths: {
                Quantity: 1,
                Items: ['/*']
            }
        }
    }).promise();

    var codepipeline = new AWS.CodePipeline();
    await codepipeline.putJobSuccessResult({
        jobId: job_id
    }).promise();

    return {
        statusCode: 200,
        body: ''
    };
};
