var React = require('react'),
    CreateReactClass = require('create-react-class'),
    _ = require('lodash');

module.exports = CreateReactClass({
    listGroup: function(section, detail, classname) {
        return React.createElement(
            'div',
            {
                className: classname
            },
            React.createElement(
            'ul',
            {
                className: 'list-group'
            }, React.createElement('li', {
                    className: 'list-group-item list-group-item-dark'
                }, section),
                React.createElement('li', {
                    className: 'list-group-item'
                }, detail)
            )
        );
    },
    logDetail: function() {
        const lineWords = _.words(this.props.log[1]);
        return React.createElement(
            'div',
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

        return React.createElement(
            'div',
            {
                className: 'message'
            },
            _.map(logStr, function(log, key) {
                return React.createElement('div', {
                        key: key
                    }, log);
                })
        );
    },
    render: function() {
        return React.createElement(
            'div',
            {
                className: 'svnLog'
            },
            React.createElement(
                'h4',
                {
                    className: 'svnLog'
                },
                'Last changes since revision ' + this.props.curRevision + ' :'
            ),
            this.logDetail(),
            this.logMessage()
        );
    }
});
