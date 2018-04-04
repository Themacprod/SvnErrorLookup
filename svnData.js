"use strict";

var _ = require("lodash"),
    spawn = require("child_process"),
    promiseSpawn = require("child-process-promise"),
    XMLHttpRequest = require("xhr2");
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

/**
 * Parse the array of file and return file(s) with an assert command in the specified line.
 * For exemple with LDevices.cpp file, this name is used in 2 places.
 * @param {array} files Array of SVN file path to check.
 * @param {int} revision SVN revision of the file to fetch.
 * @param {int} line Line number of the assert in the file.
 * @returns {file} Found file.
 */
var getValidFile = function(files, revision, line) {
    return _.filter(files, function(file) {
        const fileContent = getTextFile(file, revision);
        const lines = fileContent.split(/\r?\n/);
        // Seach for assert in the specified line.
        return (
            [
                "ASSERT",
                "ABORT"
            ].indexOf(lines[line]) >= 0);
    });
};

module.exports.getFullPath = function(req, res) {
    // const filename = req.body.filename || "LDevices.cpp";

    // const fileFound = findFilePath(filename, commit);
    const fileFound = [
        "ExternalDeviceLayer/Core/XLiberatus/Core/LDevices.cpp",
        "ExternalDeviceLayer/Core/XLiberatus/IocClientUm/LDevices.cpp"
    ];

    if (!fileFound) {
        res.sendStatus(400);
    }

    res.json({
        filePath: svnRepo + "/" + fileFound[0]
    });
};

var getSvnLogStr = function(fileName, revision) {
    var cmd = "";
    cmd += "svn log -r " + revision + ":0 --limit 1 ";
    cmd += fileName + " ";
    cmd += "--username mgisread ";
    cmd += "--password mgisread ";
    cmd += "--non-interactive ";

    return cmd;
};

/**
 * Return text file from SVN server from the passed in file input and at the specified SVN revision
 * @param {string} filePath SVN file path of the file to get.
 * @param {int} revision SVN revision of the file to fetch.
 * @returns {file} Found file.
 */
var getTextFile = function(filePath, revision) {
    return new Promise(function(resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open(
            "GET",
            String(filePath + "/?p=" + revision),
            true
        );

        xhr.withCredentials = true;

        /*
         * When using setRequestHeader, you must call it after calling open,
         * but before calling send
         */
        xhr.setRequestHeader(
            "Authorization",
            "Basic " + Buffer.from("mgisread:mgisread").toString("base64")
        );

        xhr.responseType = "text";

        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function() {
            reject(xhr.statusText);
        };
        xhr.ontimeout = function() {
            reject(xhr.statusText);
        };
        xhr.onabort = function() {
            reject(xhr.statusText);
        };

        xhr.send();
    });
};

module.exports.getLog = function(req, res) {
    promiseSpawn.exec(getSvnLogStr(req.body.filename, req.body.revision))
    .then(function(result) {
        res.json({
            log: result.stdout.split(/\r?\n/)
        });
    });
};

module.exports.getFiles = function(req, res) {
    getTextFile(req.body.filename, req.body.revision)
    .then(function(result) {
        res.json({
            fileprev: result.split(/\r?\n/),
            filecur: result.split(/\r?\n/)
        });
    })
    .catch(function(err) {
        console.log("err : " + err);
        res.sendStatus(400);
    });
};
