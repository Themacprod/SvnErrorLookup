const React = require('react');
const CreateReactClass = require('create-react-class');
const svnDisplayFile = require('./svnDisplayFile');

module.exports = CreateReactClass({
    render: function () {
        return React.createElement(
            'div',
            {
                className: 'svnDiff'
            },
            React.createElement(svnDisplayFile, {
                file: this.props.filePrev,
                line: this.props.line,
                revision: this.props.revPev
            }),
            React.createElement(svnDisplayFile, {
                file: this.props.fileCur,
                line: this.props.line,
                revision: this.props.revCur
            })
        );
    }
});
