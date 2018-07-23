const co = require('co');
const svnDb = require('./svnDb');

// Unhandled exception handler.
process.on('uncaughtException', (err) => {
    console.error(err);
});

co(function* () {
    // Wait for database to connect.
    yield require('./database').connect();

    // Build / update SVN database.
    svnDb.update();

    // Run server.
    const port = process.env.PORT || 5017;
    require('./server').listen(port);
    console.log(`Server listening on port ${port} ...`);
}).catch((err) => {
    console.error(err);
});
