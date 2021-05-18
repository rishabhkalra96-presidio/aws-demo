const { docClient, itemExists } = require('./../_dynamo');

module.exports.createInDb = async (event, TableName) => {
    try {
		const body = JSON.parse(event.body)
		console.log('captured id and data as ', body.id, body.data)
		// check if the id exists, else create a new entry
		if (await itemExists(body.id, TableName)) {
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
		console.log('sending param as ', JSON.stringify(param));
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