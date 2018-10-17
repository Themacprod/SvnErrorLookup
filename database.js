const mongoClient = require('mongodb').MongoClient;

module.exports.connect = () => {
    console.log('Connecting to mongodb://192.168.152.132:27017 ...');

    const promise = mongoClient.connect(
        'mongodb://192.168.152.132:27017',
        { useNewUrlParser: true }
    );

    return promise.then((database) => {
        console.log('Database connected.');

        const currentDb = database.db('SvnLookUp2');
        module.exports.instance = currentDb;

        module.exports.commits = currentDb.collection('commits');
        module.exports.branches = currentDb.collection('branches');
        module.exports.trees = currentDb.collection('trees');
        module.exports.full = currentDb.collection('full');
    });
};
