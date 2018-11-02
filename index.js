const co = require('co');
const database = require('./database');
const server = require('./server');
const logger = require('./logger');

// Unhandled exception handler.
process.on('uncaughtException', (err) => {
    console.error(err);
});

co(function* main() {
    // Check environement variable.
    if (typeof process.env.SS_PORT === 'undefined') {
        logger.error('SS_PORT is not defined as environment variable');
    }

    if (typeof process.env.SS_MONGODB_URL === 'undefined') {
        logger.error('SS_MONGODB_URL is not defined as environment variable');
    }

    if (typeof process.env.SS_MONGODB_NAME === 'undefined') {
        logger.error('SS_MONGODB_NAME is not defined as environment variable');
    }

    if (typeof process.env.SS_SVN_READ_USER === 'undefined') {
        logger.error('SS_SVN_READ_USER is not defined as environment variable');
    }

    if (typeof process.env.SS_SVN_READ_PASS === 'undefined') {
        logger.error('SS_SVN_READ_PASS is not defined as environment variable');
    }

    if (typeof process.env.SS_SVN_BASE_REPO === 'undefined') {
        logger.error('SS_SVN_BASE_REPO is not defined as environment variable');
    }

    // Wait for database to connect.
    yield database.connect();
}).then(() => {
    // Run server.
    server.listen(process.env.SS_PORT);
    logger.log(`Server listening on port ${process.env.SS_PORT} ...`);
}).catch((err) => {
    logger.error(err);
});
