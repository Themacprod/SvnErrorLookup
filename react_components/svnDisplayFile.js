"use strict";

var React = require("react"),
    _ = require("lodash");

module.exports = React.createClass({
    render: function() {
        const lineUp = this.props.line - this.props.range;
        const lineDown = this.props.line + this.props.range;
        var fileReduce = _.filter(this.props.file, function(line, idx) {
            return idx >= lineUp && idx <= lineDown;
        });

        return React.DOM.div({
                className: "file"
            }, _.map(fileReduce, _.bind(function(line, key) {
                return React.DOM.div(
                    {
                        className: "line",
                        key: key
                    }, React.DOM.div({
                        className: "idx"
                    }, String(key + this.props.line)),
                    React.DOM.div({
                        className: "content"
                    }, line)
                );
            }, this)));
    }
});
