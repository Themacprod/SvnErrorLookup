const mongoClient = require('mongodb').MongoClient;
const logger = require('./logger');

module.exports.connect = () => {
    logger.log('Connecting to mongodb://192.168.152.132:27017 ...');

    const promise = mongoClient.connect(
        'mongodb://192.168.152.132:27017',
        { useNewUrlParser: true }
    );

    return promise.then((database) => {
        logger.log('Database connected.');

        const currentDb = database.db('SvnLookUp2');
        module.exports.instance = currentDb;

        module.exports.commits = currentDb.collection('commits');
        module.exports.branches = currentDb.collection('branches');
        module.exports.trees = currentDb.collection('trees');
        module.exports.full = currentDb.collection('full');
    });
};
