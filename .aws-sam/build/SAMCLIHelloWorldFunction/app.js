// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const aws = require('aws-sdk');

// async function getLoginCredentials(secretName) {
//     let client = new aws.SecretsManager()
//     let data = await client.getSecretValue({SecretId: secretName}).promise()
//     return data;
// }

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        const bucketName = 'sam-cli-resource-bucket-by-rk'

        aws.config.update({region: 'us-east-1'});
        s3 = new aws.S3();
        const result = await s3.getObject({Bucket: bucketName, Key: 'sample.json'}).promise()
        if (result) {
            let fileData;
                if (Buffer.isBuffer(result.Body)) {
                    fileData = JSON.parse(result.Body.toString())
                } else {
                    fileData = result.Body
                }
                return {
                    'statusCode': 200,
                    'body': {
                        "fileName": 'sample.json',
                        "contentType": result.ContentType,
                        "lastUpdated": result.LastModified,
                        "data": fileData
                    },
                }
            }
        return {
            ok: false, message: 'An Error occured, check the logs', status: 500
        }
    } catch (err) {
        console.log(err);
        return err;
    }
};