"use strict";

var React = require("react"),
    userInput = require("./userInput"),
    svnDisplay = require("./svnDisplay");

module.exports = React.createClass({
    render: function() {
        return React.DOM.div(
            null,
            React.createElement(userInput),
            React.createElement(svnDisplay, {
                filename: "LDevices.cpp",
                revision: 150565,
                line: 1414
            })
        );
    }
});
