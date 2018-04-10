var React = require('react'),
    CreateReactClass = require('create-react-class'),
    svnDisplayFile = require('./svnDisplayFile');

module.exports = CreateReactClass({
    render: function() {
        return React.createElement(
            'div',
            {
                className: 'svnDiff'
            },
            React.createElement(svnDisplayFile, {
                file: this.props.filePrev,
                line: this.props.line
            }),
            React.createElement(svnDisplayFile, {
                file: this.props.fileCur,
                line: this.props.line
            })
        );
    }
});
