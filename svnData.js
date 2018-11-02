const _ = require('lodash');
const XMLHttpRequest = require('xhr2');
const svnDb = require('./svnDb');
const logger = require('./logger');

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
        const credential = Buffer.from(`${process.env.SS_SVN_READ_USER}:${process.env.SS_SVN_READ_PASS}`).toString('base64');
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

module.exports.getFile = function getFile(req, res) {
    svnDb.getCommit(Number(req.params.commit))
        .then((commitEntry) => {
            if (commitEntry) {
                svnDb.getTree(commitEntry.tree)
                    .then((treeEntry) => {
                        if (treeEntry) {
                            const fileFound = _.filter(treeEntry.value, _.bind((file) => {
                                return file.indexOf(req.params.filename) !== -1;
                            }, this));

                            if (fileFound) {
                                svnDb.getBranch(commitEntry.branch)
                                    .then((branchEntry) => {
                                        if (branchEntry) {
                                            // Build full path.
                                            let fullPath = '';
                                            fullPath += `http:${process.env.SS_SVN_BASE_REPO}/`;
                                            fullPath += String(branchEntry.value);
                                            fullPath += 'ExternalDeviceLayer/';
                                            fullPath += String(fileFound);
                                            getTextFile(fullPath, req.params.commit)
                                                .then((result2) => {
                                                    res.json({
                                                        file: result2.split(/\r?\n/)
                                                    });
                                                })
                                                .catch((err) => {
                                                    logger.error(`getTextFile err : ${err}`);
                                                    res.sendStatus(400);
                                                });
                                        } else {
                                            logger.error(`Cant find branch ID ${commitEntry.branch}`);
                                            res.sendStatus(400);
                                        }
                                    })
                                    .catch((err2) => {
                                        logger.error(`getBranch err : ${err2}`);
                                        res.sendStatus(400);
                                    });
                            } else {
                                logger.error(`Cant find filename  ${req.params.filename}`);
                                res.sendStatus(400);
                            }
                        } else {
                            logger.error(`Cant find tree entry for commit ${req.params.commit}`);
                            res.sendStatus(400);
                        }
                    })
                    .catch((err3) => {
                        logger.error(`getTree err : ${err3}`);
                        res.sendStatus(400);
                    });
            } else {
                logger.error(`Cant find entry for commit ${req.params.commit}`);
                res.sendStatus(400);
            }
        })
        .catch((err4) => {
            logger.error(`getCommit err : ${err4}`);
            res.sendStatus(400);
        });
};

module.exports.getInfo = function getInfo(req, res) {
    svnDb.getCommit(Number(req.params.commit))
        .then((commitEntry) => {
            if (commitEntry) {
                svnDb.getBranch(commitEntry.branch)
                    .then((branchEntry) => {
                        if (branchEntry) {
                            // Build full path.
                            let fullPath = '';
                            fullPath += `http:${process.env.SS_SVN_BASE_REPO}/`;
                            fullPath += String(branchEntry.value);

                            res.json({
                                path: fullPath
                            });
                        } else {
                            logger.error(`Cant find branch ID ${commitEntry.branch}`);
                            res.sendStatus(400);
                        }
                    })
                    .catch((err1) => {
                        logger.error(`getBranch err : ${err1}`);
                        res.sendStatus(400);
                    });
            } else {
                logger.error(`Cant find entry for commit ${req.params.commit}`);
                res.sendStatus(400);
            }
        })
        .catch((err2) => {
            logger.error(`getInfo err : ${err2}`);
            res.sendStatus(400);
        });
};
