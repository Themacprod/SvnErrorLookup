/* global document:true */

var React = require('react'),
    CreateReactClass = require('create-react-class'),
    ReactDOM = require('react-dom'),
    CreateHistory = require('history'),
    ReactRouter = require('react-router-dom');

var Boot = CreateReactClass({
    render: function() {
        return React.createElement(
            ReactRouter.Router, {
                history: CreateHistory.createBrowserHistory()
            },
            React.createElement(ReactRouter.Route, {
                path: '/:lang',
                component: require('./app')
            })
        );
    }
});

ReactDOM.render(React.createElement(Boot), document.getElementById('container'));
