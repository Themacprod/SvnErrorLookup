"use strict";

var _ = require("lodash"),
    XMLHttpRequestPromise = require("xhr-promise"),
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

/**
 * Parse the array of file and return file(s) with an assert command in the specified line.
 * For exemple with LDevices.cpp file, this name is used in 2 places.
 * @param {array} filesName Array of SVN file path to check.
 * @param {int} revision SVN revision of the file to fetch.
 * @param {int} line Line number of the assert in the file.
 * @returns {file} Found file.
 */
var getValidFile = function(filesName, revision, line) {
    return _.find(filesName, function(fileName) {
        const fullFilePath = svnRepo + "/" + fileName;

        const fileContent = getTextFile(fullFilePath, revision);
        const lines = fileContent.split(/\r?\n/);
        // Seach for assert in the specified line.
        return (
            [
                "ASSERT",
                "ABORT"
            ].indexOf(lines[line]) >= 0);
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

module.exports.getData = function(req, res) {
    // Const filename = req.body.filename || "LDevices.cpp";
    const revision = req.body.commit || 150565;
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
    // const ret = getSvnLog(fileFound[0], commit).split(/\r?\n/);

    var promiseGetLog = new Promise(function(resolve, reject) {
        promiseSpawn.exec(getSvnLogStr(fileFound[0], revision))
        .then(function(result) {
            resolve(result.stdout.split(/\r?\n/));
        })
        .catch(function(err) {
            reject(err);
        });
    });

    var promiseGetFile = new Promise(function(resolve, reject) {
        getTextFile(fileFound[0], revision)
        .then(function(result) {
            resolve(result);
        });

        var xhrPromise = new XMLHttpRequestPromise();

        xhrPromise.send({
            method: "GET",
            url: String(fileFound[0] + "/?p=" + revision),
            data: null
        })
        .then(function(results) {
            if (results.status !== 200) {
                reject(results.status);
            }
            resolve(results.status);
        })
        .catch(function(e) {
            console.error("XHR error" + e);
            // ...
        });
    });

    Promise.all([
        promiseGetLog,
        promiseGetFile
    ]).then(function(values) {
        res.json({
            log: values[0],
            filePrev: values[1]
        });
    });
};
