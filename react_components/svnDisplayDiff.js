var React = require('react'),
    CreateReactClass = require('create-react-class'),
    _ = require('lodash'),
    CodeMirror = require('react-codemirror2').UnControlled;

module.exports = CreateReactClass({
    getInitialState: function() {
        return {
            codePrev: null
        };
    },
    genFile: function(file, line) {
        if (file.length > 2 && line) {
            return React.createElement(CodeMirror, {
                value: _.flattenDeep(file),
                options: {
                    mode: 'clike',
                    theme: 'material',
                    lineNumbers: true
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
    render: function() {
        return React.createElement(
            'div',
            {
                className: 'svnDiff'
            },
            React.createElement(
                'div',
                {
                    className: 'file'
                },
                this.genFile(this.props.filePrev, this.props.line)
            ),
            React.createElement(
                'div',
                {
                    className: 'file'
                },
                this.genFile(this.props.fileCur, this.props.line)
            )
        );
    }
});
