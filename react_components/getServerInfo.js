const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');
const loading = require('./loading');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            path: '',
            loading: false
        };
    },
    getInfo: function (params) {
        this.setState({
            loading: true
        });

        request
            .get(`/api/getInfo/${params.commit}`)
            .end((err, res) => {
                if (err) {
                    console.error('Get info failed!');
                }

                if (res) {
                    this.setState({
                        path: res.body.path
                    });
                }

                this.setState({
                    loading: false
                });
            });
    },
    render: function () {
        this.getInfo(this.props.match.params);

        if (this.state.loading === true) {
            return React.createElement(loading);
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
