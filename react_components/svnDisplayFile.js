const React = require('react');
const CreateReactClass = require('create-react-class');
const _ = require('lodash');
const CodeMirror = require('react-codemirror2').UnControlled;

module.exports = CreateReactClass({
    genFile: function (file, line) {
        if (file) {
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
                        // Center scroll to line.
                        const t = editor.charCoords({
                            line: line, ch: 0
                        }, 'local').top;
                        const middleHeight = editor.getScrollerElement().offsetHeight / 2;
                        editor.scrollTo(null, t - middleHeight - 5);

                        // Highlight the specified line.
                        editor.addLineClass(line - 1, 'background', 'line-selected');
                    }
                });
            }
        }

        return null;
    },
    render: function () {
        console.log('svnDisplayFile');
        console.log(this.props);
        return React.createElement(
            'div',
            {
                className: 'file'
            },
            this.genFile(this.props.file, parseInt(this.props.line, 10))
        );
    }
});
