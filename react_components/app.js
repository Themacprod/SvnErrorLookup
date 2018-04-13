/* global module:true */

var React = require('react');
var CreateReactClass = require('create-react-class');
var main = require('./main');

module.exports = CreateReactClass({
    componentDidMount: function () {
        global.jQuery = require('jquery');
        require('codemirror/mode/clike/clike');
    },
    render: function () {
        return React.createElement(
            'div',
            {
                className: 'app'
            },
            React.createElement(main)
        );
    }
});
