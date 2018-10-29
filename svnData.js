const _ = require('lodash');
const promiseSpawn = require('child-process-promise');
const XMLHttpRequest = require('xhr2');
const svnDb = require('./svnDb');
const logger = require('./logger');

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

Array.prototype.contains = function (obj) {
    return this.indexOf(obj) > -1;
};

const isValidFile = function (file) {
    return ['cpp', 'c', 'h', 'inl'].contains(file);
};

const getCommitRange = function (range) {
    let svnCmd = '';

    svnCmd += `svn log -r ${range.max}:${range.min} `;
    svnCmd += getSvnBaseCmd();
    // svnCmd += ` ${process.env.SVN_REPO}`;
    svnCmd += ' svn://trantor.matrox.com/mgisoft/Mediaprocessor/SV2';
    svnCmd += ' -q';

    return new Promise((resolve, reject) => {
        promiseSpawn.exec(svnCmd)
            .then((result) => {
                const commitsRaw = _.filter(result.stdout.split(/\r?\n/), line => line.indexOf('r') !== -1);

                const tmp = _.map(commitsRaw, (rawLine) => {
                    const regexpResult = (/r[0-9]+/).exec(rawLine);

                    if (regexpResult) {
                        return regexpResult[0].substring(1);
                    }

                    return null;
                });

                resolve(tmp);
            })
            .catch((err) => {
                logger.error(`getCommitRange err : ${err}`);
                reject(err);
            });
    });
};

const processArray = function (array, fn) {
    const results = [];
    return array.reduce((p, item) => {
        return p.then(() => {
            return fn(item).then((data) => {
                results.push(data);
                return results;
            });
        });
    }, Promise.resolve());
};

module.exports.getCommits = function getCommits(minRev, maxRev, callback) {
    if (typeof minRev !== 'number') {
        logger.error('Min revision should be a number!');
        return;
    }

    if (typeof maxRev !== 'number') {
        logger.error('Max revision should be a number!');
        return;
    }

    const diff = maxRev - minRev;

    if (diff !== 0) {
        const increment = 800;
        const commitRanges = [];

        for (let min = minRev; min < maxRev; min += increment) {
            let max = min + increment;

            if ((min + increment) > maxRev) {
                max = maxRev;
            }

            commitRanges.push({
                min: min,
                max: max
            });

            min += 1;
        }

        processArray(commitRanges, getCommitRange)
            .then((result) => {
                callback(_.flattenDeep(result));
            }, (reason) => {
                logger.error(`getCommits reason : ${reason}`);
                callback(reason);
            })
            .catch((err) => {
                logger.error(`getCommits err : ${err}`);
            });
    } else {
        logger.log('No commit to update');
        callback([]);
    }
};

const isFilesModified = function (revision) {
    if (typeof revision === 'undefined') {
        logger.error('isFilesModified | revision is undefined');
    }

    let svnCmd = '';
    svnCmd += `svn log -r ${revision}:0 --limit 1 `;
    svnCmd += getSvnBaseCmd();
    // svnCmd += ` ${process.env.SVN_REPO}/ExternalDeviceLayer/Core`;
    svnCmd += ' svn://trantor.matrox.com/mgisoft/Mediaprocessor/SV2';
    svnCmd += ' --verbose';

    return new Promise((resolve, reject) => {
        promiseSpawn.exec(svnCmd)
            .then((result) => {
                let addedLine = _.filter(result.stdout.split(/\r?\n/), (line) => {
                    return (/\/{3}A \//).exec(line);
                });

                addedLine = _.filter(addedLine, (line) => {
                    const lineSplit = line.toString().substring(5).split(' ');
                    const ext = lineSplit[0].split('.');
                    return isValidFile(ext[1]);
                });

                if (addedLine.length === 0) {
                    resolve(-1);
                } else {
                    logger.log(`Commit ${revision} has modifications`);
                    resolve(revision);
                }
            })
            .catch((err) => {
                logger.error(`isFilesModified err : ${err}`);
                reject();
            });
    });
};

module.exports.isFilesModified = isFilesModified;

module.exports.getHead = function getHead(callback) {
    // const svnCmd = `svn info ${process.env.SVN_REPO}`;

    const svnCmd = 'svn info svn://trantor.matrox.com/mgisoft/Mediaprocessor/SV2';
    const RevStr = 'Last Changed Rev: ';

    promiseSpawn.exec(`${svnCmd} | grep '${RevStr}'`)
        .then((result) => {
            callback(result.stdout.replace(RevStr, '').split(/\r?\n/));
        })
        .catch((err) => {
            logger.error(`svn info err : ${err}`);
            callback(null);
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
                                            let fullPath = 'http://trantor.matrox.com/mgisoft/Mediaprocessor/SV2/';
                                            fullPath += String(branchEntry.value);
                                            fullPath += 'ExternalDeviceLayer/'
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
                            let fullPath = 'http://trantor.matrox.com/mgisoft/Mediaprocessor/SV2/';
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

module.exports.getFilterTree = function getFilterTree(branch, revision) {
    let branchFixed = branch.replace('//', '/');

    if (branchFixed.charAt(0) === '/') {
        branchFixed = branchFixed.substr(1);
    }

    if (branchFixed.charAt(branchFixed.length - 1) === '/') {
        branchFixed = branchFixed.substring(0, branchFixed.length - 1);
    }

    let svnCmd = '';
    // svnCmd += `svn list ${svnRepo} `;

    svnCmd += `svn list "svn://trantor.matrox.com/mgisoft/Mediaprocessor/SV2/${branchFixed}/ExternalDeviceLayer@${revision}" `;
    svnCmd += getSvnBaseCmd();
    svnCmd += '--depth infinity';

    return new Promise((resolve) => {
        promiseSpawn.exec(svnCmd)
            .then((result) => {
                const files = _.compact(result.stdout.split(/\r?\n/));

                const filterTree = _.filter(files, (file) => {
                    const tmp = file.substring(file.length - 4);
                    const ext = tmp.split('.');
                    return isValidFile(ext[1]);
                });

                resolve(filterTree);
            })
            .catch((err) => {
                logger.error(`getFilterTree err : ${err}`);
                resolve(null);
            });
    });
};

// AppLayer
// Base
// BuildMachine
// buildruntime
// Common
// DeviceLayer
// Documentation
// DriverWindows
// ExternalDeviceLayer
// Firmware
// HwRegisters
// LiberatusLayer
// OglInterface
// OsUtil
// Tests
// Tools
// XmslLib
const isBaseFolder = function isBaseFolder(line) {
    const splitWords = line.split('/');
    const keywords = [
        'AppLayer',
        'Base',
        'BuildMachine',
        'buildruntime',
        'Common',
        'DeviceLayer',
        'Documentation',
        'DriverWindows',
        'ExternalDeviceLayer',
        'Firmware',
        'HwRegisters',
        'LiberatusLayer',
        'OglInterface',
        'OsUtil',
        'Tests',
        'Tools',
        'XmslLib',
    ];

    for (let wordsIdx = 0; wordsIdx < splitWords.length; wordsIdx += 1) {
        for (let keywordsIdx = 0; keywordsIdx < keywords.length; keywordsIdx += 1) {
            if (splitWords[wordsIdx] === keywords[keywordsIdx]) {
                return keywords[keywordsIdx];
            }
        }
    }

    return null;
};

module.exports.getBranchPath = function getBranchPath(revision) {
    let svnCmd = '';
    svnCmd += `svn log -r ${revision}:0 --limit 1 `;
    svnCmd += getSvnBaseCmd();
    svnCmd += ' svn://trantor.matrox.com/mgisoft/Mediaprocessor/SV2';
    svnCmd += ' --verbose';

    return new Promise((resolve) => {
        promiseSpawn.exec(svnCmd)
            .then((result) => {
                const tmp = _.find(result.stdout.split(/\r?\n/), (line) => {
                    let startStr = '';

                    startStr = '   M /Mediaprocessor/SV2/';
                    if (line.indexOf(startStr) !== -1) {
                        const lineStr = line.substr(startStr.length);
                        return isBaseFolder(lineStr);
                    }

                    startStr = '   D /Mediaprocessor/SV2/';
                    if (line.indexOf(startStr) !== -1) {
                        const lineStr = line.substr(startStr.length);
                        return isBaseFolder(lineStr);
                    }

                    startStr = '   A /Mediaprocessor/SV2/';
                    if (line.indexOf(startStr) !== -1) {
                        const lineStr = line.substr(startStr.length);
                        return isBaseFolder(lineStr);
                    }

                    return false;
                });

                if (tmp) {
                    let startStr = '   M /Mediaprocessor/SV2/';
                    if (tmp.indexOf(startStr) !== -1) {
                        const lineStr = tmp.substr(startStr.length);
                        const folderFound = isBaseFolder(lineStr);

                        if (folderFound) {
                            resolve(lineStr.substr(0, lineStr.indexOf(folderFound)));
                        }

                        resolve(null);
                    }

                    startStr = '   D /Mediaprocessor/SV2/';
                    if (tmp.indexOf(startStr) !== -1) {
                        const lineStr = tmp.substr(startStr.length);
                        const folderFound = isBaseFolder(lineStr);

                        if (folderFound) {
                            resolve(lineStr.substr(0, lineStr.indexOf(folderFound)));
                        }

                        resolve(null);
                    }

                    startStr = '   A /Mediaprocessor/SV2/';
                    if (tmp.indexOf(startStr) !== -1) {
                        const lineStr = tmp.substr(startStr.length);
                        const folderFound = isBaseFolder(lineStr);

                        if (folderFound) {
                            resolve(lineStr.substr(0, lineStr.indexOf(folderFound)));
                        }

                        resolve(null);
                    }

                    resolve(null);
                } else {
                    resolve(null);
                }
            })
            .catch((err) => {
                logger.error(`getBranchPath err : ${err}`);
                resolve(null);
            });
    });
};
