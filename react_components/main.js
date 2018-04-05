var React = require('react'),
    userInput = require('./userInput'),
    svnDisplay = require('./svnDisplay');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            revision: 150565,
            filename: 'LDevices.cpp',
            line: 1414
        };
    },
    inputCallback: function(revision, filename, line) {
        this.setState({
            revision: revision,
            filename: filename,
            line: line
        });
    },
    render: function() {
        return React.DOM.div(
            null,
            React.createElement(userInput, {
                callback: this.inputCallback
            }),
            React.createElement(svnDisplay, {
                filename: this.state.filename,
                revision: this.state.revision,
                line: this.state.line
            })
        );
    }
});
