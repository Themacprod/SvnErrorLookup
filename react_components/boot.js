/* global document:true */

const React = require('react');
const CreateReactClass = require('create-react-class');
const ReactDOM = require('react-dom');
const app = require('./app');

const Boot = CreateReactClass({
    render: function () {
        return React.createElement(app);
    }
});

ReactDOM.render(React.createElement(Boot), document.getElementById('container'));
