var React = require('react'),
    CreateReactClass = require('create-react-class'),
    Spinner = require('react-spinners'),
    userInput = require('./userInput'),
    svnDisplay = require('./svnDisplay');

module.exports = CreateReactClass({
    getInitialState: function() {
        return {
            revision: '',
            filename: '',
            line: '',
            loading: false
        };
    },
    inputCallback: function(revision, filename, line) {
        this.setState({
            revision: revision,
            filename: filename,
            line: line,
            loading: true
        });
    },
    svnQueryCallback: function() {
        this.setState({
            loading: false
        });
    },
    createLoading: function() {
        if (this.state.loading === true) {
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
        }

        return null;
    },
    render: function() {
        return React.createElement(
            'div',
            {
                className: 'main'
            },
            React.createElement(
                'div',
                null,
                React.createElement(userInput, {
                    callback: this.inputCallback
                }),
                React.createElement('hr'),
                React.createElement(svnDisplay, {
                    filename: this.state.filename,
                    revision: this.state.revision,
                    line: this.state.line,
                    callBack: this.svnQueryCallback
                })
            ),
            this.createLoading()
        );
    }
});
