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
    // Wait for database to connect.
    yield database.connect();

    // Run server.
    const port = process.env.PORT || 5017;
    server.listen(port);
    console.log(`Server listening on port ${port} ...`);
}).then(() => {
    // Build / update SVN database.
    console.log('Build / update SVN database ...');
    initCronJobs();
}).catch((err) => {
    console.error(err);
});
