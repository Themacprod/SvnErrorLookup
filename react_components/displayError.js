const React = require('react');
const CreateReactClass = require('create-react-class');

module.exports = CreateReactClass({
    handleButtonClick: function () {
        window.location.href = '/';
    },
    render: function () {
        let ret = '';
        ret += `Sorry, can't find entry for commit #${this.props.params.commit}`;
        ret += ` in file ${this.props.params.filename}`;
        ret += ` at line ${this.props.params.line}`;

        return React.createElement(
            'div',
            {
                className: 'displayerror'
            },
            React.createElement(
                'div',
                null,
                'Oops!'
            ),
            React.createElement(
                'div',
                null,
                ret
            ),
            React.createElement(
                'button',
                {
                    className: 'btn btn-lg btn-outline-dark',
                    onClick: this.handleButtonClick
                },
                'Take me home'
            )
        );
    }
});
