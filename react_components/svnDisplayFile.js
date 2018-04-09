var React = require('react'),
    _ = require('lodash');

module.exports = React.createClass({
    reduceContent: function(content) {
        const lineUp = this.props.line - this.props.range;
        const lineDown = this.props.line + this.props.range;
        return _.filter(content, function(line, idx) {
            return idx >= lineUp && idx <= lineDown;
        });
    },
    render: function() {
        const highLightIdx = this.props.line - this.props.range;
        return React.DOM.div({
                className: 'file'
            }, _.map(this.reduceContent(this.props.file), _.bind(function(line, key) {
                const lineIdx = key + highLightIdx + 1;

                var highLight = 'line';
                if (lineIdx === this.props.line && this.props.highlight) {
                    highLight = 'line-highLight';
                }

                return React.DOM.div(
                    {
                        className: highLight,
                        key: key
                    }, React.DOM.div({
                        className: 'idx'
                    }, String(lineIdx)),
                    React.DOM.div({
                        className: 'content'
                    }, line)
                );
            }, this)));
    }
});
