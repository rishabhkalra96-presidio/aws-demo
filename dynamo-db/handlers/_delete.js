const { docClient, itemExists } = require('./../_dynamo');

module.exports.deleteFromDb = async (event, TableName) => {
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