const AWS = require('aws-sdk');

const ddb = new AWs.DynamoDB.DocumentClient();

const Api = require('./api');
/**
 * AWS Lambda Function Handler
 * @param event - contains information from the invoker, which the invoker
 * @param context - contains information about the invocation, function,
 * and execution environment
 * @param callback
 */
const image3 = 'https://i.imgur.com/ZkSLNYl.jpg';

exports.handler = (event, context, callback) => {
  Api.processRequest({url: image3})
    .then((res) => {
      const result = Api.parseResponse(res);
      callback(null, result);
    })
    .catch((err) => {
      errorResponse(err.message, context.awsRequestId, callback)
    });

};

function errorResponse(errorMessage, awsRequestId, callback) {
  callback(null, {
    statusCode: 500,
    body: JSON.stringify({
      Error: errorMessage,
      Reference: awsRequestId,
    }),
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  });
}
