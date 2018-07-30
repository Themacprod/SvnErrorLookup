/* global module:true */

const React = require('react');
const CreateReactClass = require('create-react-class');
const JQuery = require('jquery');
const History = require('history');
const ReactRouter = require('react-router-dom');
const userInput = require('./userInput');
const displayFile = require('./svnDisplayFile');
const cLike = require('codemirror/mode/clike/clike');

// https://reacttraining.com/react-router/web/api/Switch

module.exports = CreateReactClass({
    componentDidMount: function () {
        global.jQuery = JQuery;
        global.cLike = cLike;
    },
    render: function () {
        return React.createElement(
            ReactRouter.Router, {
                history: History.createBrowserHistory()
            },
            React.createElement(
                'div',
                {
                    className: 'app'
                },
                React.createElement(ReactRouter.Route, {
                    path: '/',
                    exact: true,
                    component: userInput
                }),
                React.createElement(ReactRouter.Route, {
                    path: '/getSvnFile/:commit/:filename/:line',
                    component: displayFile
                })
            )
        );
    }
});
