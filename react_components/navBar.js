const React = require('react');
const CreateReactClass = require('create-react-class');

module.exports = CreateReactClass({
    render: function () {
        return React.createElement('nav', {
            className: 'nav'
        }, React.createElement(
            'a',
            {
                className: 'nav-link',
                href: '/'
            },
            'Home'
        ));
    }
});
