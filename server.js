"use strict";

var path = require("path"),
	express = require("express"),
	bodyParser = require("body-parser"),
	cookieParser = require("cookie-parser"),
	favicon = require("serve-favicon"),
	server = express(),
	cacheMaxAge = process.env.NODE_ENV === "development" ? 0 : 3600000,
	port = process.env.PORT || 5000,
	svnData = require("./svnData");

// Server setup.

server.use(favicon(path.join(__dirname, "public/img/favicon-32x32.png"), {
	maxAge: cacheMaxAge
}));

server.use(express.query());

server.use(bodyParser.json());

server.use(bodyParser.urlencoded({
	extended: false
}));

server.use(cookieParser());

server.use(express.static(path.join(__dirname, "public"), {
	maxAge: cacheMaxAge
}));

server.post("/api/getSvnFullPath", svnData.getFullPath);

server.post("/api/getSvnLog", svnData.getLog);

server.post("/api/getSvnFiles", svnData.getFiles);

server.get("*", function(req, res) {
	res.sendFile(path.join(__dirname, "/public/index.html"));
});

server.listen(port, function() {
	console.log("Server listening on port " + port + " ...");
});

// Unhandled exception handler.
server.use(function(err, req, res) {
	console.log(err);
	res.sendStatus(500);
});

module.exports = server;
