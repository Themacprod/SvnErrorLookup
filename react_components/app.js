/* global module:true */

const React = require('react');
const CreateReactClass = require('create-react-class');
const main = require('./main');

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
