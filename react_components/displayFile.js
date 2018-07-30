const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');
const Spinner = require('react-spinners');
const _ = require('lodash');
const CodeMirror = require('react-codemirror2').UnControlled;

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            file: [],
            loading: false
        };
    },
    getSvnFile: function () {
        this.setState({
            loading: true
        });

        let param = `/${this.props.commit}`;
        param += `/${this.props.filename}`;
        param += `/${this.props.line}`;

        request
            .get(`/api/getSvnFile2${param}`)
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
    componentWillMount: () => {
        console.log(this.props);

        if (this.props &&
            (this.props.commit !== '') &&
            (this.props.filename !== '') &&
            (this.props.line !== '')) {
            this.getSvnFile();
        } else {
            console.log('Bad props passed');
        }
    },
    genLoading: () => {
        return React.createElement('div', {
            className: 'loading'
        }, React.createElement(
            'div',
            {
                className: 'spinner'
            },
            React.createElement(
                'strong',
                {
                    className: 'loading-text'
                },
                'Fetching data on SVN server ...'
            ),
            React.createElement(
                Spinner.PacmanLoader,
                {
                    loading: this.state.loading
                }
            )
        ));
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
    render: () => {
        if (this.state.loading === true) {
            return this.genLoading();
        }

        return React.createElement(
            'div',
            {
                className: 'filefull'
            },
            this.genFile(this.state.file, 620)
        );
    }
});
