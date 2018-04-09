var React = require('react'),
    Spinner = require('react-spinners'),
    userInput = require('./userInput'),
    svnDisplay = require('./svnDisplay');

module.exports = React.createClass({
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
            return React.DOM.div({
                className: 'loading'
            }, React.createElement(Spinner.PacmanLoader, {
                loading: this.state.loading
            }));
        }

        return null;
    },
    render: function() {
        return React.DOM.div({
            className: 'main'
        },
            React.DOM.div(
                null,
                React.createElement(userInput, {
                    callback: this.inputCallback
                }),
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
