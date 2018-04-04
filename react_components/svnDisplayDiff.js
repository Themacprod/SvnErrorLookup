"use strict";

var React = require("react"),
    fileDisplay = require("./svnDisplayFile");

module.exports = React.createClass({
    render: function() {
        return React.DOM.div(
            {
                className: "svnDiff"
            },
            React.createElement(fileDisplay, {
                file: this.props.filePrev,
                line: this.props.line,
                highlight: false,
                range: 15
            }),
            React.createElement(fileDisplay, {
                file: this.props.fileCur,
                line: this.props.line,
                highlight: true,
                range: 15
            })
        );
    }
});
