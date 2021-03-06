const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const favicon = require('serve-favicon');
const svnData = require('./svnData');
const sshCmd = require('./sshCmd');

const server = express();
const cacheMaxAge = process.env.NODE_ENV === 'development' ? 0 : 3600000;

// Server setup.

server.use(favicon(path.join(__dirname, 'public/img/favicon-32x32.png'), {
    maxAge: cacheMaxAge
}));

server.use(express.query());

server.use(bodyParser.json());

server.use(cookieParser());

server.use(express.static(path.join(__dirname, 'public'), {
    maxAge: cacheMaxAge
}));

server.get('/api/getSvnFile/:commit/:filename/:line', svnData.getFile);

server.get('/api/getDmesg/:ip', sshCmd.getDmesg);

server.get('/api/getInfo/:commit', svnData.getInfo);

server.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

// Unhandled exception handler.
server.use((err, req, res) => {
    console.error(err);
    res.sendStatus(500);
});

module.exports = server;
