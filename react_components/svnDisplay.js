var React = require('react'),
    request = require('superagent'),
    _ = require('lodash'),
    svnLog = require('./svnDisplayLog'),
    svnDiff = require('./svnDisplayDiff');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            log: [],
            filePrev: [],
            fileCur: []
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
                    this.setState({
                        log: res.body.log
                    });

                    const prevRevision = _.words(res.body.log[1]);

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
        if (this.props !== this.oldProps) {
            this.oldProps = this.props;

            if (this.props.filename !== '' &&
                this.props.revision !== '') {
                    this.getSvnFullPath();
                }
        }

        return React.DOM.div(
            {
                className: 'svnDisplay'
            },
            React.createElement(svnLog, {
                log: this.state.log
            }),
            React.createElement(svnDiff, {
                filePrev: this.state.filePrev,
                fileCur: this.state.fileCur,
                line: this.props.line
            })
        );
    }
});
