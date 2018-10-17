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

                if (res) {
                    console.log(res.body.path);
                    this.setState({
                        path: res.body.path
                    });
                }
            });
    },
    render: function () {
        if (this.props.commit !== this.prevCommit) {
            this.prevCommit = this.props.commit;

            if (typeof this.props.commit === 'number') {
                const validCommit = (/^[0-9]{6}/).exec(this.props.commit);
                if (validCommit) {
                    this.getInfo(this.props.commit);
                } else {
                    this.setState({
                        path: ''
                    });
                }
            } else {
                this.setState({
                    path: ''
                });
            }
        }

        return React.createElement(
            'div',
            {
                className: 'commit-info'
            },
            this.state.path
        );
    }
});
