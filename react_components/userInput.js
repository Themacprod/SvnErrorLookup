"use strict";

var React = require("react"),
    rawInput = require("./rawInput"),
    manualInput = require("./manualInput");

module.exports = React.createClass({
    getInitialState: function() {
        return {
            commit: "",
            filename: "",
            lineNumber: ""
        };
    },
    rawInputCallback: function(commit, filename, lineNumber) {
        this.setState({
            commit: commit,
            filename: filename,
            lineNumber: lineNumber
        });
    },
    render: function() {
        return React.DOM.div(
            {
                className: "userinput"
            },
            React.createElement(rawInput, {
                callback: this.rawInputCallback
            }),
            React.createElement(manualInput, {
                description: "Commit #",
                placeHolder: "Enter manually commit #",
                value: this.state.commit
            }),
            React.createElement(manualInput, {
                description: "Filename",
                placeHolder: "Enter filename",
                value: this.state.filename
            }),
            React.createElement(manualInput, {
                description: "Line #",
                placeHolder: "Enter line number",
                value: this.state.lineNumber
            })
        );
    }
});
