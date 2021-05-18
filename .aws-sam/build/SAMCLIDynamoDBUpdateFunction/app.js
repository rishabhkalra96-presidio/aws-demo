const { TableName } = require('./_dynamo');
const { readFromDB } = require('./handlers/_read');
const { createInDb } = require('./handlers/_create');
const { updateInDb } = require('./handlers/_update');
const { deleteFromDb } = require('./handlers/_delete');

exports.dynamoDBReadHandler = async (event, _context) => {
    return await readFromDB(event, TableName);
};

exports.dynamoDBCreateHandler = async (event, _context) => {
    return await createInDb(event, TableName);
};

exports.dynamoDBUpdateHandler = async (event, _context) => {
    return await updateInDb(event, TableName);
};

exports.dynamoDBDeleteHandler = async (event, _context) => {
    return await deleteFromDb(event, TableName);
};