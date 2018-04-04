"use strict";

var React = require("react"),
    _ = require("lodash");

module.exports = React.createClass({
    render: function() {
        return React.DOM.div({
            className: "svnLog"
            }, _.map(this.props.log, function(log, key) {
                return React.DOM.div({
                        key: key
                    }, log);
                }));
    }
});
