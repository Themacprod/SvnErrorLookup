const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');
const _ = require('lodash');
const svnDisplayFile = require('./svnDisplayFile');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
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
                    if (this.props.revision === 0 || this.props.revision === 'HEAD') {
                        this.getSvnFileHead(filePath);
                    } else {
                        this.getSvnFileCur(filePath, this.props.revision);
                    }
                }
            });
    },
    getSvnFileHead: function (filePath) {
        request
            .post('/api/getSvnHead/')
            .send({
                filename: filePath
            })
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN head revision failed!');
                    return;
                }

                if (res) {
                    this.getSvnFileCur(filePath, res.body.head);
                }
            });
    },
    getSvnFileCur: function (filePath, revision) {
        request
            .post('/api/getSvnFile/')
            .send({
                filename: filePath,
                revision: revision
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

        return React.createElement(svnDisplayFile, {
                filename: this.state.fullPath,
                file: this.state.fileCur,
                line: this.props.line,
                revision: this.props.revision
            }
        );
    }
});
