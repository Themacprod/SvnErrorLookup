"use strict";

var React = require("react");

module.exports = React.createClass({
    render: function() {
        return React.DOM.div(
                {
                    className: "input-group"
                },
                React.DOM.div(
                    {
                        className: "input-group-prepend"
                    },
                    React.DOM.span({
                        className: "input-group-text"
                    }, this.props.description)
                ),
                React.DOM.input({
                    className: "form-control",
                    type: "text",
                    placeholder: this.props.placeHolder,
                    value: this.props.value
                })
            );
    }
});
