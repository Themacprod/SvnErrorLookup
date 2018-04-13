var _ = require('lodash'),
    promiseSpawn = require('child-process-promise'),
    XMLHttpRequest = require('xhr2');

var getSvnBaseCmd = function () {
    var svnCmd = '';
    svnCmd += `--username ${process.env.SVN_READ_USER} `;
    svnCmd += `--password ${process.env.SVN_READ_PASS} `;
    svnCmd += '--non-interactive ';
    return svnCmd;
};

/**
 * Return text file from SVN server from the passed in file input and at the specified SVN revision
 * @param {string} filePath SVN file path of the file to get.
 * @param {int} revision SVN revision of the file to fetch.
 * @returns {file} Found file.
 */
var getTextFile = function (filePath, revision) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();

        xhr.open(
            'GET',
            String(`${filePath}/?p=${revision}`),
            true
        );

        xhr.withCredentials = true;

        /*
         * When using setRequestHeader, you must call it after calling open,
         * but before calling send
         */
        const credential = Buffer.from(`${process.env.SVN_READ_USER}:${process.env.SVN_READ_PASS}`).toString('base64');
        xhr.setRequestHeader(
            'Authorization',
            `Basic ${credential}`
        );

        xhr.responseType = 'text';

        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function () {
            reject(xhr.statusText);
        };
        xhr.ontimeout = function () {
            reject(xhr.statusText);
        };
        xhr.onabort = function () {
            reject(xhr.statusText);
        };

        xhr.send();
    });
};

module.exports.getFullPath = function (req, res) {
    const svnRepo = `${process.env.SVN_REPO} + '/ExternalDeviceLayer/Core`;
    var svnCmd = `svn list ${svnRepo} `;

    svnCmd += getSvnBaseCmd();
    svnCmd += `--depth infinity --revision ${req.body.revision}`;

    promiseSpawn.exec(`${svnCmd} | grep ${req.body.filename}`)
        .then(function (result) {
            var files = _.compact(result.stdout.split(/\r?\n/));

            files = _.map(files, function (file) {
                return `${svnRepo}/${file}`;
            });

            res.json({
                filePath: _.filter(files, function (file) {
                    return file.indexOf('IocClientUm') === -1;
                })
            });
        })
        .catch(function (err) {
            console.error(`svn list err : ${err}`);
            res.sendStatus(400);
        });
};

module.exports.getLog = function (req, res) {
    var svnCmd = '';
    svnCmd += `svn log -r ${req.body.revision}:0 --limit 1 `;
    svnCmd += `${req.body.filename} `;
    svnCmd += getSvnBaseCmd();

    promiseSpawn.exec(svnCmd)
        .then(function (result) {
            res.json({
                log: result.stdout.split(/\r?\n/)
            });
        })
        .catch(function (err) {
            console.error(`getLog err : ${err}`);
            res.sendStatus(400);
        });
};

module.exports.getFile = function (req, res) {
    getTextFile(req.body.filename, req.body.revision)
        .then(function (result) {
            res.json({
                file: result.split(/\r?\n/)
            });
        })
        .catch(function (err) {
            console.error(`getFile err : ${err}`);
            res.sendStatus(400);
        });
};
