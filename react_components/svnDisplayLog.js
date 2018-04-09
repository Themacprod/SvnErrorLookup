var React = require('react'),
    _ = require('lodash');

module.exports = React.createClass({
    listGroup: function(section, detail, classname) {
        return React.DOM.div(
            {
                className: classname
            },
            React.DOM.ul(
            {
                className: 'list-group'
            }, React.DOM.li({
                    className: 'list-group-item list-group-item-dark'
                }, section),
            React.DOM.li({
                    className: 'list-group-item'
                }, detail)
            )
        );
    },
    logDetail: function() {
        const lineWords = _.words(this.props.log[1]);
        return React.DOM.div(
            {
                className: 'detail'
            },
            this.listGroup('Revision', lineWords[1] || '', 'svnlogsmall'),
            this.listGroup('Author', lineWords[2] || '', 'svnlogsmall'),
            this.listGroup('Message', this.props.log[3] || '', 'svnlogbig')
        );
    },
    logMessage: function() {
        var logStr = _.filter(this.props.log, function(log, key) {
            return key >= 3 && key < this.props.log.length - 2;
        }.bind(this));

        return React.DOM.div(
            {
                className: 'message'
            },
            _.map(logStr, function(log, key) {
                return React.DOM.div({
                        key: key
                    }, log);
                })
        );
    },
    render: function() {
        return React.DOM.div(
            {
                className: 'svnLog'
            },
            this.logDetail(),
            this.logMessage()
        );
    }
});
