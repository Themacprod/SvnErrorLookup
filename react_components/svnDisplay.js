import React from 'react';
import CreateReactClass from 'create-react-class';
import request from 'superagent';
import _ from 'lodash';
import svnLog from './svnDisplayLog';
import svnDisplayFile from './svnDisplayFile';

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            log: [],
            filePrev: [],
            fileCur: [],
            fullPath: '',
            revPrev: 0
        };
    },
    getSvnFullPath: function () {
        request
            .post('/api/getSvnFullPath/')
            .send({
                filename: this.props.filename,
                revision: this.props.revision
            })
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN full path failed!');
                    return;
                }

                if (res) {
                    this.setState({
                        fullPath: res.body.filePath
                    });

                    this.getSvnLog(res.body.filePath);
                }
            });
    },
    getSvnLog: function (filePath) {
        request
            .post('/api/getSvnLog/')
            .send({
                filename: filePath,
                revision: this.props.revision
            })
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN log failed!');
                    return;
                }

                if (res) {
                    const prevRevision = _.words(res.body.log[1]);

                    this.setState({
                        log: res.body.log,
                        revPrev: prevRevision[1]
                    });

                    this.getSvnFilePrev(filePath, prevRevision[1]);
                }
            });
    },
    getSvnFilePrev: function (filePath, revision) {
        request
            .post('/api/getSvnFile/')
            .send({
                filename: filePath,
                revision: revision
            })
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN previous file failed!');
                    return;
                }

                if (res) {
                    this.setState({
                        filePrev: res.body.file
                    });

                    this.getSvnFileCur(filePath);
                }
            });
    },
    getSvnFileCur: function (filePath) {
        request
            .post('/api/getSvnFile/')
            .send({
                filename: filePath,
                revision: this.props.revision
            })
            .end((err, res) => {
                this.props.callBack();

                if (err) {
                    console.error('Get SVN current file failed!');
                    return;
                }

                if (res) {
                    this.setState({
                        fileCur: res.body.file
                    });
                }
            });
    },
    render: function () {
        if (this.props.filename !== this.oldFilename) {
            this.oldFilename = this.props.filename;

            if (this.props.filename !== '' &&
                this.props.revision !== '') {
                this.getSvnFullPath();
            }
        }

        return React.createElement(
            'div',
            {
                className: 'svnDisplay'
            },
            React.createElement(svnLog, {
                log: this.state.log,
                curRevision: this.props.revision,
                filename: this.props.filename
            }),
            React.createElement('hr'),
            React.createElement(
                'div',
                {
                    className: 'svnDiff'
                },
                React.createElement(svnDisplayFile, {
                    filename: this.state.fullPath,
                    file: this.state.filePrev,
                    line: this.props.line,
                    revision: this.state.revPrev
                }),
                React.createElement(svnDisplayFile, {
                    filename: this.state.fullPath,
                    file: this.state.fileCur,
                    line: this.props.line,
                    revision: this.props.revision
                })
            )
        );
    }
});
