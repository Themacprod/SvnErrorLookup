var React = require('react'),
    CreateReactClass = require('create-react-class'),
    fileDisplay = require('./svnDisplayFile');

module.exports = CreateReactClass({
    render: function() {
        return React.createElement("div",
            {
                className: 'svnDiff'
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
