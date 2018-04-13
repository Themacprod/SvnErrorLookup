/* global document:true */

var React = require('react');
var CreateReactClass = require('create-react-class');
var ReactDOM = require('react-dom');

var Boot = CreateReactClass({
    render: function () {
        return React.createElement(require('./app'));
    }
});

ReactDOM.render(React.createElement(Boot), document.getElementById('container'));
