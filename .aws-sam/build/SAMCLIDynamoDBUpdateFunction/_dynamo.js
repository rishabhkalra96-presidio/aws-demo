const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const TableName = 'first-dynamo-table-by-rk-2';

module.exports.TableName = TableName;
module.exports.docClient = docClient;

module.exports.itemExists = async (id=null, tableName = TableName) => {
	const param = {
		TableName: tableName,
		Key: {'id': id.toString()}
	};
	console.log('exists request is ', param);
	const item = await docClient.get(param).promise();
	console.log('recieved exis response as ', item);
	return item && item.Item && 'id' in item.Item;
}