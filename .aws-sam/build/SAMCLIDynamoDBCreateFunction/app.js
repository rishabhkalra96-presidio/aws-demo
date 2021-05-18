// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
const aws = require('aws-sdk');
const docClient = new aws.DynamoDB.DocumentClient({apiVersion: '2012-08-10'});
const TableName = 'first-dynamo-table-by-rk-2';

async function itemExists(id=null, tableName = TableName) {
	const param = {TableName: tableName, Key: {'id': id.toString()}};
	console.log('exists request is ', param);
	const item = await docClient.get(param).promise();
	console.log('recieved exis response as ', item);
	return item && item.Item && 'id' in item.Item;
}

exports.dynamoDBReadHandler = async (event, context) => {
    try {
		let fetchAllRecords = false;
		let recordId;
		let result;
		let response = {
			body: '', statusCode: 400,
		};
		let params = {
			TableName,
		}
		// read the specific id or get all records
		const queryParams = event.queryStringParameters || {};
		
		fetchAllRecords = !(('docId' in queryParams) && (+queryParams.docId >= 0));
		
		if (!fetchAllRecords) {
			recordId = queryParams.docId;
			params['Key'] = {
				'id': recordId
			}
			result = await docClient.get(params).promise();	
		} else {
			params['Limit'] = 100;
			result = await docClient.scan(params).promise();
		}
        if (result) {
		const body = JSON.stringify({ok: true, data: 'Items' in result ? result.Items : ('Item' in result ? result.Item : {})});

		response.statusCode = 200;
		response.body = body;
		} 
		return response;
    } catch (err) {
        console.log('catched error while reading resources', err);
        return err;
    }
};

exports.dynamoDBCreateHandler = async (event, context) => {
    try {
		const body = JSON.parse(event.body)
		console.log('captured id and data as ', body.id, body.data)
		// check if the id exists, else create a new entry
		if (await itemExists(body.id)) {
		return {
		statusCode: 400, body: JSON.stringify({error: 'item already exists with id ' + body.id})
		};
		}
		// create a new entry
		const param = {
		TableName, Item: {
			'id': body.id,
			'extraInfo': {}
		}
		}
		if (body.data) {
		param.Item.extraInfo = body.data
		}
		const result = await docClient.put(param).promise();
		console.log('result after creation recieved as ', result);
		if (result) {
		return {
				statusCode: 200, body: 'Record added successfully!!!'
			}
		}
    } catch (err) {
        console.log('catched error while creating item', err);
        return err;
    }
};

exports.dynamoDBUpdateHandler = async (event, context) => {
    try {
        const queryParams = event.queryStringParameters || {};
		const body = JSON.parse(event.body);
		let response;
		let newData;
		const docIdToUpdate = parseInt(queryParams.docId);
		if (isNaN(docIdToUpdate)) {
		return {
		statusCode: 400, body: JSON.stringify({error: 'docId malformed in query params, its mandatory!'})}
		}
		// check if it exists, then delete
		if (!await itemExists(docIdToUpdate)) {
			return {
			statusCode: 400, body: JSON.stringify({error: 'docId does not exists in the table'})};
		} else {
			// update
			let overwriteExisting = !body.merge;
			if (overwriteExisting) {
				newData = body.data || {};
			} else {
			console.log('merge with exisitng data');
			const existingData = await docClient.get({TableName, Key: {'id': docIdToUpdate.toString()}}).promise();
			console.log('recieved exising data from db as ', existingData);
			if (existingData) {
				newData = {...existingData.Item.extraInfo, ...body.data};
			}
			console.log('new merged data to update is ', newData);
			}
		}
		const updateParam = {
			TableName,
			Key: { 
					'id': docIdToUpdate.toString(),
					},
					UpdateExpression: `set extraInfo = :newDataObj`,
					ExpressionAttributeValues: {
						":newDataObj": newData
					}
				}
		console.log('sending update request as ', updateParam);
		await docClient.update(updateParam).promise();
		return {
			statusCode: 200,
			body: JSON.stringify({message: 'item updated successfully', newData})
			};
    } catch (err) {
        console.log('catched error while reading resources', err);
        return err;
    }
};

exports.dynamoDBDeleteHandler = async (event, context) => {
    try {
        const queryParams = event.queryStringParameters || {};
		const docIdToDelete = parseInt(queryParams.docId);
		if (isNaN(docIdToDelete)) {
		return {
		statusCode: 400, body: JSON.stringify({error: 'docId malformed in query params, its mandatory!'})}
		}
		// check if it exists, then delete
		if (!await itemExists(docIdToDelete)) {
			return {
			statusCode: 400, body: JSON.stringify({error: 'docId does not exists in the table'})}
		} else {
			const param = {
			TableName, Key: {'id': docIdToDelete.toString(),
			}
			};
			await docClient.delete(param).promise();
			return {
			statusCode: 200, body: 'item deleted successfully!!!'};
		}
    } catch (err) {
        console.log('catched error while deleting item from table', err);
        return err;
    }
};