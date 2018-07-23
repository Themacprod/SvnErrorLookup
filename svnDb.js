var database = require("./database");
var svnData = require("./svnData");
var _ = require('lodash');

const getLatestPromise = function() {
    return new Promise(function (resolve, reject) {
        database.commits
            .find({
            })
            .sort({
                maxcommit: -1
            })
            .limit(1)
            .toArray(function(err, docs) {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            });
        });
};

const getHeadPromise = function() {
    return new Promise(function (resolve) {
        svnData.getHead( function(headCommit) {
            resolve(headCommit);
        });
    });
};

const getCommitPromise = function(lastCommitStored, headCommit) {
    return new Promise(function (resolve) {
        svnData.getCommits(
            lastCommitStored,
            headCommit,
            function(commitList) {
                resolve(commitList);
            }
        )
    })
};

const updateEntryInDB = function(id, oldMax, newMax, min) {
    database.commits.updateOne({
            _id: id
        }, {
            $set: {
                maxcommit: newMax
            }
        }, {
            upsert: true
        })
        .then(result => {
            console.log(`Updated range from [${oldMax}:${min}] to [${newMax}:${min}] in the DB`);
            return result;
        });
};

const updateReduceInDb = function(revision, modified) {
    if (modified !== -1) {
        database.modifications.updateOne({
            name: 'reduce'
        }, {
            $addToSet: {revisions: revision }
        }, {
            upsert: true
        })
        .then(result => {
            console.log(`Added ${revision} in the DB`);
            return result;
        });
    } else {
        database.modifications.updateOne({
            name: 'reduce'
        }, {
            $set: {maxcommit: revision}
        }, {
            upsert: true
        })
        .then(result => {
            console.log(`Updated max revision to ${revision} in the DB`);
            return result;
        });
    }
};

const getReduceMaxPromise = function() {
    return new Promise(function (resolve, reject) {
        database.modifications
            .find({
                name: 'reduce'
            })
            .limit(1)
            .toArray(function(err, docs) {
                if (err) {
                    reject(err);
                } else {
                    resolve(docs);
                }
            });
        });
};

const insertEntryInDB = function(min, max, list) {
    database.commits.insertOne({
        maxcommit: max,
        mincommit: min,
        list: list
    }, function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log(`Added [${max}:${min}] in the database`);
        }
    });
};

const isFilesModified = function(revision, timeout) {
    return new Promise(function(resolve) {
        setTimeout(() => {
            resolve(svnData.isFilesModified(revision));
        }, timeout);
    });
}

const log = function(data) {
    let date = new Date();

    console.log(`${date.toString()} | ${data}`);
};

const buildReduce = function(modifList, fullList) {
    let commitListTmp = fullList;
    let commitWithModifTmp = modifList;

    let reduceList = [];

    let stopLooking = false;

    while (!stopLooking) {
        if (commitWithModifTmp.length !== 0) {
            let maxCommit = _.maxBy(commitListTmp);
            let minCommit = _.maxBy(commitWithModifTmp);
        
            reduceList.push({
                max: maxCommit,
                min: minCommit
            });

            console.log(`[${maxCommit}:${minCommit}]`);

            commitListTmp = _.filter(commitListTmp, function(commit) {
                return parseInt(commit) < minCommit;
            });

            commitWithModifTmp = _.filter(commitWithModifTmp, function(commit) {
                return parseInt(commit) < minCommit;
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

    return reduceList;
};

async function updateASync () {
    let ret = await getLatestPromise();

    let lastCommitStored = 105523;
    let mincommitDb = 105523

    if (ret.length !== 0) {
        lastCommitStored = ret[0].maxcommit;
        log(`Last commit stored : ${lastCommitStored}`);

        mincommitDb = ret[0].mincommit;
    } else {
        log(`No commit stored, used default min : ${lastCommitStored}`);
    }

    const headCommitRaw = await getHeadPromise();
    const headCommit = headCommitRaw[0];
    log(`Head commit : ${headCommit}`);
    
    const diff = headCommit - lastCommitStored;
    log(`Number of commit to update = ${diff}`);

    let commitList = [];

    if (diff > 0) {
        log(`Getting commit list between [${headCommit} and ${lastCommitStored}] ... `);
        commitList = await getCommitPromise(
            lastCommitStored,
            headCommit
        );
    }

    let commitListFull = commitList;

    log(`Commit list size = ${commitList.length}`);

    //
    // Build modified commit list.
    //
    let commitWithModif = [];

    // Get recude data stored in the DB to avoid svn log command.
    const reduceEntry = await getReduceMaxPromise();

    if (reduceEntry.length !== 0) {
        commitWithModif.push(reduceEntry[0].revisions);

        commitList = _.filter(commitList, function(commit) {
            return commit > reduceEntry[0].maxcommit;
        });
    }

    for (let i = 0; i < commitList.length; i += 1) {
        let isModified = await isFilesModified(commitList[i], 1250);

        if (isModified !== -1) {
            commitWithModif.push(commitList[i]);
        }

        updateReduceInDb(commitList[i], isModified);
    }

    log(`commitWithModif list`);
    commitWithModif = _.flattenDeep(commitWithModif);

    // Build reduce list.
    let reduce = [];
    
    if (commitListFull.length !== 0) {
        log(`Build reduce list`);
        reduce = buildReduce(commitWithModif, commitListFull);
    }

    for (let i = 0; i < reduce.length; i += 1) {
        svnData.getList(reduce[i].min, function(list) {
            // Check if lastest database entry needs to be updated
            if (reduce[i].min === mincommitDb) {
                updateEntryInDB(
                    ret[0]._id,
                    ret[0].maxcommit,
                    reduce[i].max,
                    reduce[i].min
                );
            } else {
                insertEntryInDB(
                    reduce[i].min,
                    reduce[i].max,
                    list
                );
            }
        });
    }
};

module.exports.update = function() {
    updateASync();
};

module.exports.getList = function(revision, filename) {
    return new Promise(function (resolve, reject) {
        database.commits
            .find({
                $and : [
                    {'mincommit': {$lte: revision.toString()}},
                    {'maxcommit': {$gte: revision.toString()}}
                ]
            })
            .limit(1)
            .toArray(function(err, docs) {
                if (err) {
                    reject(err);
                } else {
                    resolve(_.filter(docs[0].list, _.bind(function(file) {
                        return file.indexOf(filename) !== -1;
                    }, this)));
                }
            });
        });
};


