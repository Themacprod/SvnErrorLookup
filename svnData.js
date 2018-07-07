const _ = require('lodash');
const promiseSpawn = require('child-process-promise');
const XMLHttpRequest = require('xhr2');

const getSvnBaseCmd = function () {
    let svnCmd = '';
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
const getTextFile = function (filePath, revision) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open(
            'GET',
            `${filePath}/?p=${revision}`,
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

        xhr.onload = function onLoad() {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response);
            } else {
                reject(xhr.statusText);
            }
        };
        xhr.onerror = function onError() {
            reject(xhr.statusText);
        };
        xhr.ontimeout = function onTimeout() {
            reject(xhr.statusText);
        };
        xhr.onabort = function onAbort() {
            reject(xhr.statusText);
        };

        xhr.send();
    });
};

const getRevision = function (revision) {
    if (revision === 0) {
        return 'HEAD';
    }

    return revision;
};

module.exports.getFullPath = function getFullPath(req, res) {
    const svnRepo = `${process.env.SVN_REPO}/ExternalDeviceLayer/Core`;
    let svnCmd = `svn list ${svnRepo} `;

    svnCmd += getSvnBaseCmd();
    svnCmd += `--depth infinity --revision ${getRevision(req.body.revision)}`;

    promiseSpawn.exec(`${svnCmd} | grep ${req.body.filename}`)
        .then((result) => {
            let files = _.compact(result.stdout.split(/\r?\n/));

            files = _.map(files, file => `${svnRepo}/${file}`);

            res.json({
                filePath: _.filter(files, file => file.indexOf('IocClientUm') === -1)
            });
        })
        .catch((err) => {
            console.error(`svn list err : ${err}`);
            res.sendStatus(400);
        });
};

module.exports.getLog = function getLog(req, res) {
    let svnCmd = '';
    svnCmd += `svn log -r ${getRevision(req.body.revision)}:0 --limit 1 `;
    svnCmd += `${req.body.filename} `;
    svnCmd += getSvnBaseCmd();

    promiseSpawn.exec(svnCmd)
        .then((result) => {
            res.json({
                log: result.stdout.split(/\r?\n/)
            });
        })
        .catch((err) => {
            console.error(`getLog err : ${err}`);
            res.sendStatus(400);
        });
};

module.exports.getHead = function getHead(req, res) {
    const svnCmd = `svn info ${req.body.filename}`;

    promiseSpawn.exec(`${svnCmd} | grep Revision`)
        .then((result) => {
            const head = result.stdout.replace('Revision: ', '');

            if (head) {
                res.json({
                    head: head
                });
            } else {
                res.sendStatus(400);
            }
        })
        .catch((err) => {
            console.error(`svn info err : ${err}`);
            res.sendStatus(400);
        });
};

module.exports.getFile = function getFile(req, res) {
    getTextFile(req.body.filename, req.body.revision)
        .then((result) => {
            res.json({
                file: result.split(/\r?\n/)
            });
        })
        .catch((err) => {
            console.error(`getFile err : ${err}`);
            res.sendStatus(400);
        });
};
