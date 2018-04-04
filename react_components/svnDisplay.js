"use strict";

var React = require("react"),
    request = require("superagent"),
    svnLog = require("./svnDisplayLog"),
    svnDiff = require("./svnDisplayDiff");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            log: ["Unknown"],
            fileCur: ["Unknown"]
        };
    },
    getSvnFullPath: function() {
        request
            .post("/api/getSvnFullPath/")
            .send({
                filename: this.props.filename,
                revision: this.props.revision
            })
            .end(function(err, res) {
                if (err) {
                    console.log("Get SVN full path failed!");
                    return;
                }

                if (res) {
                    this.getSvnLog(res.body.filePath);
                }
            }.bind(this));
    },
    getSvnLog: function(filePath) {
        request
            .post("/api/getSvnLog/")
            .send({
                filename: filePath,
                revision: this.props.revision
            })
            .end(function(err, res) {
                if (err) {
                    console.log("Get SVN log failed!");
                    return;
                }

                if (res) {
                    this.setState({
                        log: res.body.log
                    });
                    this.getSvnFiles(filePath);
                }
            }.bind(this));
    },
    getSvnFiles: function(filePath) {
        request
            .post("/api/getSvnFiles/")
            .send({
                filename: filePath,
                revision: this.props.revision
            })
            .end(function(err, res) {
                if (err) {
                    console.log("Get SVN log failed!");
                    return;
                }

                if (res) {
                    this.setState({
                        filePrev: res.body.fileprev,
                        fileCur: res.body.filecur
                    });
                }
            }.bind(this));
    },
    componentDidMount: function() {
        this.getSvnFullPath();
    },
    render: function() {
        return React.DOM.div(
            {
                className: "svnDisplay"
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
