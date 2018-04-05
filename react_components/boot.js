/* global document:true */

var React = require('react'),
    ReactDOM = require('react-dom'),
    ReactRouter = require('react-router');

var Boot = React.createClass({
    render: function() {
        return React.createElement(
            ReactRouter.Router, {
                history: ReactRouter.browserHistory
            },
            React.createElement(ReactRouter.Route, {
                path: '/:lang',
                component: require('./app')
            })
        );
    }
});

ReactDOM.render(React.createElement(Boot), document.getElementById('container'));
