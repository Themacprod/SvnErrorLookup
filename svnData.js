"use strict";

var _ = require("lodash"),
    XMLHttpRequest = require("xhr2"),
    spawn = require("child_process");
const svnRepo = "https://trantor.matrox.com/mgisoft/Mediaprocessor/SV2/Trunk";

var buildCmd = function(baseCmd) {
    var cmd = "svn " + baseCmd + " " + svnRepo + " ";

    cmd += "--username mgisread ";
    cmd += "--password mgisread ";
    cmd += "--non-interactive ";
    return cmd;
};

var findFilePath = function(filename, commit) {
    var stdout = "";
    spawn.exec(buildCmd("list") + "--depth infinity --revision " + commit + " | grep " + filename, function(error, stderr) {
        if (error) {
            console.log(error);
        }

        if (stderr) {
            console.log(stderr);
        }
    });

    return stdout;
};

var getTextFile = function(file, revision, callback) {
    const fullPath = svnRepo + "/" + file + "/?p=" + revision;
    var request = new XMLHttpRequest();
    request.open(
        "GET",
        String(fullPath),
        true
    );
    request.withCredentials = true;
    request.setRequestHeader(
        "Authorization",
        "Basic " + Buffer.from("mgisread:mgisread").toString("base64")
    );

    request.send(null);

    request.onreadystatechange = function() {
        if (request.readyState === 4 && request.status === 200) {
            const type = request.getResponseHeader("Content-Type");
            if (type.indexOf("text") !== 1) {
                callback(request.responseText);
            }
        }
    };
};

var getValidFile = function(files, revision, line) {
    return _.find(files, function(file) {
        getTextFile(file, revision, function(data) {
            const lines = data.split(/\r?\n/);
            // Seach for assert in the specified line.
            return (
                [
                    "ASSERT",
                    "ABORT"
                ].indexOf(lines[line]) >= 0);
        });
    });
};

var getSvnLog = function(file, revision, callback) {
    var cmd = "";
    cmd += "svn log -r " + revision + ":0 --limit 1 ";
    cmd += svnRepo + "/" + file + " ";
    cmd += "--username mgisread ";
    cmd += "--password mgisread ";
    cmd += "--non-interactive ";

    var svnLog = spawn.exec(cmd);

    svnLog.stdout.on("data", function(data) {
        callback(data.toString());
    });

    svnLog.stderr.on("data", function(data) {
        console.log("stderr: " + data.toString());
    });

    svnLog.on("exit", function(code) {
        console.log("child process exited with code: " + code.toString());
    });
};

module.exports.getData = function(req, res) {
    // Const filename = req.body.filename || "LDevices.cpp";
    const commit = req.body.commit || 150565;
    const lineNumber = req.body.linenumber || 1414;

    // const fileFound = findFilePath(filename, commit);
    const fileFound = [
        "ExternalDeviceLayer/Core/XLiberatus/Core/LDevices.cpp",
        "ExternalDeviceLayer/Core/XLiberatus/IocClientUm/LDevices.cpp"
    ];

    if (!fileFound) {
        res.sendStatus(400);
    }

    // If the filename is present in 2 places (like LDevices)
//    if (fileFound.length >= 2) {
//        getValidFile(fileFound, commit, lineNumber);
//    }

    getSvnLog(fileFound[0], commit, function(log) {
        res.json({
            log: log.split(/\r?\n/)
        });
    });
};
