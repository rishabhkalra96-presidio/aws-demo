const { docClient, itemExists } = require('./../_dynamo');

module.exports.updateInDb = async (event, TableName) => {
    try {
        const queryParams = event.queryStringParameters || {};
		const body = JSON.parse(event.body);
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