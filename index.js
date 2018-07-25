const co = require('co');
const svnDb = require('./svnDb');
const database = require('./database');
const server = require('./server');

// Unhandled exception handler.
process.on('uncaughtException', (err) => {
    console.error(err);
});

co(function* main() {
    // Wait for database to connect.
    yield database.connect();

    // Build / update SVN database.
    svnDb.update();

    // Run server.
    const port = process.env.PORT || 5017;
    server.listen(port);
    console.log(`Server listening on port ${port} ...`);
}).catch((err) => {
    console.error(err);
});
