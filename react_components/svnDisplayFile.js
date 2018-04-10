var React = require('react'),
    CreateReactClass = require('create-react-class'),
    _ = require('lodash'),
    CodeMirror = require('react-codemirror2').UnControlled;

module.exports = CreateReactClass({
    genFile: function(file, line) {
        if (file.length > 2 && line) {
            return React.createElement(CodeMirror, {
                value: _.flattenDeep(file),
                options: {
                    mode: 'clike',
                    theme: 'material',
                    lineNumbers: true,
                    readOnly: true
                },
                editorDidMount: function(editor) {
                    editor.setCursor({
                        line: line,
                        ch: 0
                    });
                }
            });
        }

        return null;
    },
    genTitle: function() {
        if (this.props.filename && this.props.revision) {
            return React.createElement(
                'div',
                {
                    className: 'filename'
                },
                this.props.filename + ' @ ' + this.props.revision
            );
        }

        return null;
    },
    render: function() {
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
