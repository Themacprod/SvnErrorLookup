const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const svnData = require('./svnData');

const server = express();
const cacheMaxAge = process.env.NODE_ENV === 'development' ? 0 : 3600000;
const port = process.env.PORT || 5000;

// Server setup.

server.use(favicon(path.join(__dirname, 'public/img/favicon-32x32.png'), {
    maxAge: cacheMaxAge
}));

server.use(express.query());

server.use(bodyParser.json());

server.use(bodyParser.urlencoded({
    extended: false
}));

server.use(cookieParser());

server.use(express.static(path.join(__dirname, 'public'), {
    maxAge: cacheMaxAge
}));

server.post('/api/getSvnFullPath', svnData.getFullPath);

server.post('/api/getSvnLog', svnData.getLog);

server.post('/api/getSvnHead', svnData.getHead);

server.post('/api/getSvnFile', svnData.getFile);

server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

server.listen(port, () => {
    console.error(`Server listening on port ${port} ...`);
});

// Unhandled exception handler.
server.use((err, req, res) => {
    console.error(err);
    res.sendStatus(500);
});

module.exports = server;
