/* global module:true */

var React = require('react'),
    CreateReactClass = require('create-react-class'),
    main = require('./main');

module.exports = CreateReactClass({
    componentDidMount: function() {
        global.jQuery = require('jquery');
    },
    render: function() {
        return React.createElement(
            'div',
            {
                className: 'app'
            },
            React.createElement(main)
        );
    }
});
