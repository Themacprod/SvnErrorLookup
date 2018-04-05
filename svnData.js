var _ = require('lodash'),
    promiseSpawn = require('child-process-promise'),
    XMLHttpRequest = require('xhr2');

var getSvnBaseCmd = function() {
    var svnCmd = '';
    svnCmd += '--username ' + process.env.SVN_READ_USER + ' ';
    svnCmd += '--password ' + process.env.SVN_READ_PASS + ' ';
    svnCmd += '--non-interactive ';
    return svnCmd;
};

module.exports.getFullPath = function(req, res) {
    const svnRepo = process.env.SVN_REPO + '/ExternalDeviceLayer/Core';
    var svnCmd = 'svn list ' + svnRepo + ' ';

    svnCmd += getSvnBaseCmd();
    svnCmd += '--depth infinity --revision ' + req.body.revision;

    promiseSpawn.exec(svnCmd + ' | grep ' + req.body.filename)
    .then(function(result) {
        var files = _.compact(result.stdout.split(/\r?\n/));

        files = _.map(files, function(file) {
            return svnRepo + '/' + file;
        });

        var fileFilter = _.filter(files, function(file) {
            return file.indexOf('IocClientUm') === -1;
        });

        res.json({
            filePath: fileFilter
        });
    })
    .catch(function(err) {
        console.log('svn list err : ' + err);
        res.sendStatus(400);
    });
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
            'GET',
            String(filePath + '/?p=' + revision),
            true
        );

        xhr.withCredentials = true;

        /*
         * When using setRequestHeader, you must call it after calling open,
         * but before calling send
         */
        xhr.setRequestHeader(
            'Authorization',
            'Basic ' + Buffer.from(process.env.SVN_READ_USER + ':' + process.env.SVN_READ_PASS).toString('base64')
        );

        xhr.responseType = 'text';

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
                'ASSERT',
                'ABORT',
            ].indexOf(lines[line]) >= 0);
    });
};

module.exports.getLog = function(req, res) {
    var svnCmd = '';
    svnCmd += 'svn log -r ' + req.body.revision + ':0 --limit 1 ';
    svnCmd += req.body.filename + ' ';
    svnCmd += getSvnBaseCmd();

    promiseSpawn.exec(svnCmd)
    .then(function(result) {
        res.json({
            log: result.stdout.split(/\r?\n/)
        });
    })
    .catch(function(err) {
        console.log('getLog err : ' + err);
        res.sendStatus(400);
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
        console.log('getFiles err : ' + err);
        res.sendStatus(400);
    });
};
