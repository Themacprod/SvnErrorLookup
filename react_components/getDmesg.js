const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');
const _ = require('lodash');
const loading = require('./loading');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            validLine: [],
            loading: false,
            radioId: 0
        };
    },
    filterDmesg: function (dmesg) {
        return _.filter(dmesg, (line) => {
            const codeLineStr = (/\(\d+(?!\d)\)/).exec(line);
            const svnCommitStr = (/\[\d+(?!\d)\]/).exec(line);
            const fileStr = (/\w+.cpp\b/).exec(line);

            if (codeLineStr && svnCommitStr && fileStr) {
                return true;
            }

            return false;
        });
    },
    getDmesg: function (params) {
        this.setState({
            loading: true
        });

        request
            .get(`/api/getDmesg/${params.ip}`)
            .end((err, res) => {
                if (err) {
                    console.error('Get dmesg failed!');
                }

                if (res) {
                    this.setState({
                        validLine: this.filterDmesg(res.body.dmesg)
                    });
                }

                this.setState({
                    loading: false
                });
            });
    },
    componentWillMount: function () {
        this.getDmesg(this.props.match.params);
    },
    genLine: function (line, key) {
        return React.createElement(
            'li',
            {
                className: 'list-group-item',
                key: key
            },
            line
        );
    },
    handleRadioClick: function (e) {
        this.setState({
            radioId: parseInt(e.target.id, 10)
        });
    },
    genInput: function (line, id) {
        let radioState = false;

        if (id === this.state.radioId) {
            radioState = true;
        }

        return React.createElement(
            'div',
            {
                key: id,
                id: id,
                className: 'input-group',
                onClick: this.handleRadioClick
            },
            React.createElement(
                'div',
                {
                    id: id,
                    className: 'input-group-prepend'
                },
                React.createElement(
                    'div',
                    {
                        id: id,
                        className: 'input-group-text'
                    },
                    React.createElement(
                        'input',
                        {
                            id: id,
                            type: 'radio',
                            checked: radioState
                        }
                    )
                )
            ),
            React.createElement(
                'input',
                {
                    id: id,
                    className: 'form-control form-control-lg',
                    type: 'text',
                    disabled: !radioState,
                    value: line
                }
            )
        );
    },
    handleButtonClick: function () {
        const line = this.state.validLine[this.state.radioId];
        const codeLineStr = (/\(\d+(?!\d)\)/).exec(line);
        const svnCommitStr = (/\[\d+(?!\d)\]/).exec(line);
        const fileStr = (/\w+.cpp\b/).exec(line);

        const codeLine = parseInt(codeLineStr[0].substring(1, codeLineStr[0].length - 1), 10);
        let revision = parseInt(svnCommitStr[0].substring(1, svnCommitStr[0].length - 1), 10);

        if (revision === 0) {
            revision = 'HEAD';
        }

        // Extract data from the selected line.
        let param = `/${revision}`;
        param += `/${fileStr[0]}`;
        param += `/${codeLine}`;

        window.location.href = `/getSvnFile${param}`;
    },
    render: function () {
        if (this.state.loading === true) {
            return React.createElement(loading);
        }

        if (this.state.validLine.length === 0) {
            return React.createElement(
                'div',
                null,
                `No valid message found on ${this.props.match.params.ip}`
            );
        }

        return React.createElement(
            'div',
            {
                className: 'dmesg-list'
            },
            React.createElement(
                'div',
                {
                    className: 'header'
                },
                'Select dmesg :'
            ),
            React.createElement(
                'ul',
                {
                    className: 'list-group'
                },
                _.map(this.state.validLine, this.genInput)
            ),
            React.createElement(
                'div',
                {
                    className: 'userbutton'
                },
                React.createElement(
                    'button',
                    {
                        className: 'btn btn-lg btn-outline-dark',
                        onClick: this.handleButtonClick
                    },
                    'Submit'
                )
            )
        );
    }
});
