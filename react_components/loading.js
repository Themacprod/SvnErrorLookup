const React = require('react');
const CreateReactClass = require('create-react-class');
const Spinner = require('react-spinners');

module.exports = CreateReactClass({
    render: function () {
        return React.createElement('div', {
            className: 'loading'
        }, React.createElement(
            'div',
            {
                className: 'loading-container'
            },
            React.createElement(
                'div',
                {
                    className: 'loading-text'
                },
                'Fetching data on SVN server ...'
            ),
            React.createElement(
                'div',
                {
                    className: 'spinner'
                },
                React.createElement(
                    Spinner.PacmanLoader,
                    {
                        loading: true
                    }
                )
            )
        ));
    }
});
