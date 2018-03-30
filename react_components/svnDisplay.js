"use strict";

var React = require("react"),
    request = require("superagent");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            revision: "Unknown"
        };
    },
    componentDidMount: function() {
        request
            .post("/api/getSvnData/")
            .send({
                commit: this.props.commit,
                filename: this.props.filename,
                lineNumber: this.props.lineNumber
            })
            .end(function(err, res) {
                if (err) {
                    console.log("Get SVN data failed!");
                    return;
                }

                if (res) {
                    this.setState({
                        revision: res.body.revision
                    });
                }
            }.bind(this));
    },
    render: function() {
        return React.DOM.div({
                className: "svnDisplay"
            }, "Revision: " + this.state.revision);
    }
});
