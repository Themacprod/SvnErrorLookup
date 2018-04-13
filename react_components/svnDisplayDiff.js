import React from 'react';
import CreateReactClass from 'create-react-class';
import svnDisplayFile from './svnDisplayFile';

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
