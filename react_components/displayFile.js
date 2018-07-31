const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');
const _ = require('lodash');
const CodeMirror = require('react-codemirror2').UnControlled;
const loading = require('./loading');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            file: [],
            loading: false
        };
    },
    getSvnFile: function (params) {
        this.setState({
            loading: true
        });

        let param = `/${params.commit}`;
        param += `/${params.filename}`;
        param += `/${params.line}`;

        request
            .get(`/api/getSvnFile${param}`)
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN file failed!');
                }

                if (res) {
                    this.setState({
                        file: res.body.file
                    });
                }

                this.setState({
                    loading: false
                });
            });
    },
    componentWillMount: function () {
        this.getSvnFile(this.props.match.params);
    },
    genFile: (file, line) => {
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
        if (this.state.loading === true) {
            return React.createElement(loading);
        }

        return React.createElement(
            'div',
            {
                className: 'filefull'
            },
            this.genFile(this.state.file, this.props.match.params.line)
        );
    }
});
