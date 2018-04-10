var React = require('react'),
    CreateReactClass = require('create-react-class'),
    request = require('superagent'),
    _ = require('lodash'),
    svnLog = require('./svnDisplayLog'),
    svnDisplayFile = require('./svnDisplayFile');

module.exports = CreateReactClass({
    getInitialState: function() {
        return {
            log: [],
            filePrev: [],
            fileCur: [],
            revPrev: 0
        };
    },
    getSvnFullPath: function() {
        request
            .post('/api/getSvnFullPath/')
            .send({
                filename: this.props.filename,
                revision: this.props.revision
            })
            .end(function(err, res) {
                if (err) {
                    console.log('Get SVN full path failed!');
                    return;
                }

                if (res) {
                    this.getSvnLog(res.body.filePath);
                }
            }.bind(this));
    },
    getSvnLog: function(filePath) {
        request
            .post('/api/getSvnLog/')
            .send({
                filename: filePath,
                revision: this.props.revision
            })
            .end(function(err, res) {
                if (err) {
                    console.log('Get SVN log failed!');
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
            }.bind(this));
    },
    getSvnFilePrev: function(filePath, revision) {
        request
            .post('/api/getSvnFile/')
            .send({
                filename: filePath,
                revision: revision
            })
            .end(function(err, res) {
                if (err) {
                    console.log('Get SVN previous file failed!');
                    return;
                }

                if (res) {
                    this.setState({
                        filePrev: res.body.file
                    });

                    this.getSvnFileCur(filePath);
                }
            }.bind(this));
    },
    getSvnFileCur: function(filePath) {
        request
            .post('/api/getSvnFile/')
            .send({
                filename: filePath,
                revision: this.props.revision
            })
            .end(function(err, res) {
                this.props.callBack();

                if (err) {
                    console.log('Get SVN current file failed!');
                    return;
                }

                if (res) {
                    this.setState({
                        fileCur: res.body.file
                    });
                }
            }.bind(this));
    },
    render: function() {
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
                curRevision: this.props.revision
            }),
            React.createElement('hr'),
            React.createElement(
                'div',
                {
                    className: 'svnDiff'
                },
                React.createElement(svnDisplayFile, {
                    filename: this.props.filename,
                    file: this.state.filePrev,
                    line: this.props.line,
                    revision: this.state.revPrev
                }),
                React.createElement(svnDisplayFile, {
                    filename: this.props.filename,
                    file: this.state.fileCur,
                    line: this.props.line,
                    revision: this.props.revision
                })
            )
        );
    }
});
