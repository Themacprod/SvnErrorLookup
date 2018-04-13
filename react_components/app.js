/* global module:true */

const React = require('react');
const CreateReactClass = require('create-react-class');
const JQuery = require('jquery');
const main = require('./main');
const cLike = require('codemirror/mode/clike/clike');

module.exports = CreateReactClass({
    componentDidMount: function () {
        global.jQuery = JQuery;
        global.cLike = cLike;
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
