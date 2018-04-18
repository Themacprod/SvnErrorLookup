const React = require('react');
const CreateReactClass = require('create-react-class');
const _ = require('lodash');
const CodeMirror = require('react-codemirror2').UnControlled;

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
                    const t = editor.charCoords({line: line, ch: 0}, "local").top; 
                    const middleHeight = editor.getScrollerElement().offsetHeight / 2; 
                    editor.scrollTo(null, t - middleHeight - 5); 
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
