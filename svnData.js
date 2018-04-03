"use strict";

var _ = require("lodash"),
    XMLHttpRequest = require("xhr2"),
    spawn = require("child_process"),
    promiseSpawn = require("child-process-promise");
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
        var request = new XMLHttpRequest();

        request.open(
            "GET",
            String(filePath + "/?p=" + revision),
            true
        );

        request.withCredentials = true;

        /*
         * When using setRequestHeader, you must call it after calling open,
         * but before calling send
         */
        request.setRequestHeader(
            "Authorization",
            "Basic " + Buffer.from("mgisread:mgisread").toString("base64")
        );
        request.send(null);

        request.responseType = "text";
        request.onreadystatechange = function() {
          if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
              resolve(request.responseText);
            } else {
              reject(Error(request.statusText));
            }
          }
        };
        request.onerror = function() {
          reject(Error("Network Error"));
        };
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
    cmd += svnRepo + "/" + fileName + " ";
    cmd += "--username mgisread ";
    cmd += "--password mgisread ";
    cmd += "--non-interactive ";

    return cmd;
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

    Promise.all([promiseGetLog]).then(function(values) {
        res.json({
            log: values[0]
        });
    });
};
