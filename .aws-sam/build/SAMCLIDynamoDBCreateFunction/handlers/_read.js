const { docClient } = require('./../_dynamo');

module.exports.readFromDB = async (event, TableName) => {
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