const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            path: ''
        };
    },
    getInfo: function (commit) {
        request
            .get(`/api/getInfo/${commit}`)
            .end((err, res) => {
                if (err) {
                    this.setState({
                        path: `Can't find branch for commit ${commit}`
                    });
                }
                if (res.body) {
                    this.setState({
                        path: res.body.path
                    });
                }
            });
    },
    handleBranchInputChange: function (e) {
        const validCommit = (/^[0-9]{6}/).exec(e.target.value);
        if (validCommit) {
            this.getInfo(validCommit[0]);
        } else {
            this.setState({
                path: ''
            });
        }
    },
    render: function () {
        return React.createElement(
            'div',
            {
                className: 'branchinput'
            },
            React.createElement(
                'input',
                {
                    id: 'branch',
                    className: 'form-control form-control-lg',
                    type: 'text',
                    placeholder: 'Enter commit number for info like 151862',
                    onChange: this.handleBranchInputChange
                }
            ),
            React.createElement(
                'div',
                {
                    className: 'commit-info'
                },
                this.state.path
            )
        );
    }
});
