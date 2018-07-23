const _ = require('lodash');
const promiseSpawn = require('child-process-promise');
const XMLHttpRequest = require('xhr2');
const svnDb = require('./svnDb');

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

Array.prototype.contains = function(obj) {
    return this.indexOf(obj) > -1;
};

const isValidFile = function (file) {
    return ['cpp', 'c', 'h', 'inl'].contains(file);
};

module.exports.getList = function getList(revision, callback) {
    const svnRepo = `${process.env.SVN_REPO}/ExternalDeviceLayer/Core`;
    let svnCmd = `svn list ${svnRepo} `;

    svnCmd += getSvnBaseCmd();
    svnCmd += `--depth infinity --revision ${getRevision(revision)}`;

    setTimeout(() => {
        promiseSpawn.exec(`${svnCmd}`)
            .then((result) => {
                let files = _.compact(result.stdout.split(/\r?\n/));

                files = _.map(files, file => `${svnRepo}/${file}`);

                callback(_.filter(files, (file) => {
                    const tmp = file.substring(svnRepo.length - 1);
                    const ext = tmp.split('.');
                    return isValidFile(ext[1]);
                }));
            })
            .catch((err) => {
                console.error(`svn list err : ${err}`);
                callback(null);
            });
    }, 5000)
};

module.exports.getFullPath = function getFullPath(req, res) {
    svnDb.getList(req.body.revision, req.body.filename)
        .then((list) => {
            res.json({
                fullpath: list
            });
        })
        .catch((err) => {
            console.error(`getFullPath err : ${err}`);
            res.sendStatus(400);
        });
};

const getCommitRange = function (range) {
    let svnCmd = '';

    svnCmd += `svn log -r ${range.max}:${range.min} `;
    svnCmd += getSvnBaseCmd();
    svnCmd += ` ${process.env.SVN_REPO}/ExternalDeviceLayer/Core`;
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
                console.error(`getCommitRange err : ${err}`);
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
    const diff = maxRev - minRev;

    if (diff !== 0) {
        const increment = 800;
        const commitRanges = [];

        for (let min = parseInt(minRev, 10); parseInt(min, 10) < parseInt(maxRev, 10); min += increment) {
            let max = parseInt(min, 10) + increment;

            if ((parseInt(min, 10) + increment) > parseInt(maxRev, 10)) {
                max = parseInt(maxRev, 10);
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
                console.error(`getCommits reason : ${reason}`);
                callback(reason);
            })
            .catch((err) => {
                console.error(`getCommits err : ${err}`);
            });
    } else {
        console.log('No commit to update');
        callback([]);
    }
};

const log = function (data) {
    const date = new Date();

    console.log(`${date.toString()} | ${data}`);
};

module.exports.isFilesModified = function isFilesModified(revision) {
    let svnCmd = '';
    svnCmd += `svn log -r ${revision}:0 --limit 1 `;
    svnCmd += getSvnBaseCmd();
    svnCmd += ` ${process.env.SVN_REPO}/ExternalDeviceLayer/Core`;
    svnCmd += ' --verbose';

    return new Promise((resolve, reject) => {
        promiseSpawn.exec(svnCmd)
            .then((result) => {
                let addedLine = _.filter(result.stdout.split(/\r?\n/), (line) => {
                    return (/   A \//).exec(line);
                });

                addedLine = _.filter(addedLine, (line) => {
                    const lineSplit = line.toString().substring(5).split(' ');
                    const ext = lineSplit[0].split('.');
                    return isValidFile(ext[1]);
                });

                if (addedLine.length === 0) {
                    resolve(-1);
                } else {
                    log(`Commit ${revision} has modifications`);
                    resolve(revision);
                }
            })
            .catch((err) => {
                console.error(`isFilesModified err : ${err}`);
                reject();
            });
    });
};

module.exports.reduceCommits = function reduceCommits(commitList, callback) {
    processArray(_.sortBy(commitList), isFilesModified)
        .then((result) => {
            const commitWithModif = _.filter(_.flattenDeep(result), (revision) => {
                return revision !== -1;
            });

            let commitListTmp = commitList;
            let commitWithModifTmp = commitWithModif;

            const reduceList = [];

            let stopLooking = false;

            while (!stopLooking) {
                if (commitWithModifTmp.length !== 0) {
                    const maxCommit = _.maxBy(commitList);
                    const minCommit = _.maxBy(commitWithModif);
                
                    reduceList.push({
                        max: maxCommit,
                        min: minCommit
                    });

                    console.log(`[${maxCommit}:${minCommit}]`);

                    commitListTmp = _.filter(commitListTmp, (commit) => {
                        return parseInt(commit, 10) < minCommit;
                    });

                    commitWithModifTmp = _.filter(commitWithModifTmp, (commit) => {
                        return parseInt(commit, 10) < minCommit;
                    });
                } else {
                    reduceList.push({
                        max: _.maxBy(commitListTmp),
                        min: _.minBy(commitListTmp)
                    });

                    console.log(`[${_.maxBy(commitListTmp)}:${_.minBy(commitListTmp)}]`);

                    stopLooking = true;
                }
            }

            callback(reduceList);
        }, (reason) => {
            console.error(`reduceCommits reason : ${reason}`);
            callback(reason);
        })
        .catch((err) => {
            console.error(`reduceCommits err : ${err}`);
        });
};

module.exports.getHead = function getHead(callback) {
    const svnRepo = `${process.env.SVN_REPO}/ExternalDeviceLayer/Core`;
    const svnCmd = `svn info ${svnRepo}`;

    const RevStr = 'Last Changed Rev: ';
    promiseSpawn.exec(`${svnCmd} | grep '${RevStr}'`)
        .then((result) => {
            callback(result.stdout.replace(RevStr, '').split(/\r?\n/));
        })
        .catch((err) => {
            console.error(`svn info err : ${err}`);
            callback(null);
        });
};

module.exports.getFile = function getFile(req, res) {
    getTextFile(req.body.filepath, req.body.revision)
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

module.exports.getTest = function getTest(req) {
    console.log(req.query);
};

module.exports.getFile2 = function getFile2(req, res) {
    console.log(req.params);
    svnDb.getList(req.params.commit, req.params.filename)
        .then((list) => {
            res.json({
                fullpath: list
            });
        })
        .catch((err) => {
            console.error(`getFullPath err : ${err}`);
            res.sendStatus(400);
        });
};
