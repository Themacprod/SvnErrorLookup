/* global module:true */

import React from 'react';
import CreateReactClass from 'create-react-class';
import main from './main';

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
