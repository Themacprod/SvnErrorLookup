import React from 'react';
import CreateReactClass from 'create-react-class';
import _ from 'lodash';
import { UnControlled as CodeMirror } from 'react-codemirror2';

module.exports = CreateReactClass({
    genFile: function (file, line) {
        if (file.length > 2 && line) {
            return React.createElement(CodeMirror, {
                value: _.flattenDeep(file),
                options: {
                    mode: 'clike',
                    theme: 'material',
                    lineNumbers: true,
                    readOnly: true
                },
                editorDidMount: function (editor) {
                    editor.setCursor({
                        line: line,
                        ch: 0
                    });
                }
            });
        }

        return null;
    },
    genTitle: function () {
        if (this.props.filename && this.props.revision) {
            return React.createElement(
                'em',
                {
                    className: 'filename'
                },
                `${this.props.filename}@${this.props.revision}`
            );
        }

        return null;
    },
    render: function () {
        return React.createElement(
            'div',
            {
                className: 'file'
            },
            this.genTitle(this.props.filename, this.props.revision),
            this.genFile(this.props.file, this.props.line)
        );
    }
});
