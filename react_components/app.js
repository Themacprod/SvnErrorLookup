/* global module:true */

"use strict";

var React = require("react"),
    main = require("./main");

module.exports = React.createClass({
    componentDidMount: function() {
        global.jQuery = require("jquery");
        require("../node_modules/react-bootstrap/lib");
    },
    render: function() {
        return React.DOM.div(
            {
                className: "app"
            },
            React.createElement(main)
        );
    }
});
