"use strict";

var React = require("react"),
    _ = require("lodash"),
    request = require("superagent");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            log: ["Unknown"]
        };
    },
    componentDidMount: function() {
        request
            .post("/api/getSvnData/")
            .send({
                commit: this.props.commit,
                filename: this.props.filename,
                linenumber: this.props.lineNumber
            })
            .end(function(err, res) {
                if (err) {
                    console.log("Get SVN data failed!");
                    return;
                }

                if (res) {
                    this.setState({
                        log: res.body.log
                    });
                }
            }.bind(this));
    },
    render: function() {
        return React.DOM.div({
            className: "svnDisplay"
        }, _.map(this.state.log, function(log, key) {
            console.log(log);
            return React.DOM.div({
                    key: key
                }, log);
            }));
    }
});
