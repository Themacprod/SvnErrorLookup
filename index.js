const co = require('co');
const Cron = require('cron');
const svnDb = require('./svnDb');
const database = require('./database');
const server = require('./server');

// Unhandled exception handler.
process.on('uncaughtException', (err) => {
    console.error(err);
});

const initCronJobs = function () {
    const cacheJob = new Cron.CronJob({
        cronTime: '* * * * *',
        onTick: function () {
            svnDb.update();
        },
        start: false
    });

    cacheJob.start();
};

co(function* main() {
    // Check environement variable.
    if (typeof process.env.PORT === 'undefined') {
        console.error('PORT is not defined as environment variable');
    }

    if (typeof process.env.MONGODB_URL === 'undefined') {
        console.error('MONGODB_URL is not defined as environment variable');
    }

    if (typeof process.env.SVN_READ_USER === 'undefined') {
        console.error('SVN_READ_USER is not defined as environment variable');
    }

    if (typeof process.env.SVN_READ_PASS === 'undefined') {
        console.error('SVN_READ_PASS is not defined as environment variable');
    }

    if (typeof process.env.SVN_BASE_REPO === 'undefined') {
        console.error('SVN_REPO is not defined as environment variable');
    }

    if (typeof process.env.SVN_REPO === 'undefined') {
        console.error('SVN_REPO is not defined as environment variable');
    }

    if (typeof process.env.SVN_START_COMMIT === 'undefined') {
        console.error('SVN_START_COMMIT is not defined as environment variable');
    }

    // Wait for database to connect.
    yield database.connect();

    // Run server.
    const port = 5000;
    server.listen(port);
    console.log(`Server listening on port ${port} ...`);
}).then(() => {
    // Build / update SVN database.
    console.log('Check / update SVN database ...');
    initCronJobs();
}).catch((err) => {
    console.error(err);
});
