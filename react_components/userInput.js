const React = require('react');
const CreateReactClass = require('create-react-class');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            btnState: ' disabled',
            revision: 0,
            filename: '',
            codeLine: 0,
            radioId: 'raw',
            ipValid: false,
            rawValid: false
        };
    },
    handleInputChange: function (e) {
        const codeLineStr = (/\(\d+(?!\d)\)/).exec(e.target.value);
        const svnCommitStr = (/\[\d+(?!\d)\]/).exec(e.target.value);
        const fileStr = (/\w+.cpp\b/).exec(e.target.value);

        let btnState = ' disabled';
        let rawValid = false;

        if (codeLineStr && svnCommitStr && fileStr) {
            const codeLine = parseInt(codeLineStr[0].substring(1, codeLineStr[0].length - 1), 10);
            let revision = parseInt(svnCommitStr[0].substring(1, svnCommitStr[0].length - 1), 10);

            if (revision === 0) {
                revision = 'HEAD';
            }

            btnState = 'btn btn-dark';
            rawValid = true;

            this.setState({
                revision: revision,
                filename: fileStr[0],
                codeLine: codeLine
            });
        }

        this.setState({
            btnState: btnState,
            rawValid: rawValid
        });
    },
    handleIpChange: function (e) {
        const ip = (/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/).exec(e.target.value);

        let btnState = ' disabled';
        let ipValid = false;

        if (ip) {
            btnState = 'btn btn-dark';
            ipValid = true;

            this.setState({
                ip: ip[0]
            });
        }

        this.setState({
            btnState: btnState,
            ipValid: ipValid
        });
    },
    handleButtonClick: function () {
        if (this.state.radioId === 'raw') {
            let param = `/${this.state.revision}`;
            param += `/${this.state.filename}`;
            param += `/${this.state.codeLine}`;
            window.location.href = `/getSvnFile${param}`;
        } else if (this.state.radioId === 'ip') {
            window.location.href = `/getDmesg/${this.state.ip}`;
        } else {
            console.error('Dont know how to handle');
        }
    },
    handleRadioClick: function (e) {
        let btnState = ' disabled';

        if ((e.target.id === 'raw') && (this.state.rawValid === true)) {
            btnState = 'btn btn-dark';
        }

        if ((e.target.id === 'ip') && (this.state.ipValid === true)) {
            btnState = 'btn btn-dark';
        }

        this.setState({
            radioId: e.target.id,
            btnState: btnState
        });
    },
    genInput: function (id, placeholder, callback, radioCallback) {
        let radioState = false;

        if (id === this.state.radioId) {
            radioState = true;
        }

        return React.createElement(
            'div',
            {
                id: id,
                className: 'input-group',
                onClick: radioCallback
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
                    placeholder: placeholder,
                    onChange: callback,
                    disabled: !radioState
                }
            )
        );
    },
    render: function () {
        return React.createElement(
            'div',
            {
                className: 'userinput'
            },
            this.genInput(
                'raw',
                'Enter line like \'[  638.620997] sv2[151862]: (Error) XDevFpgaBrg.cpp(620) Assertion failed\'',
                this.handleInputChange,
                this.handleRadioClick
            ),
            React.createElement(
                'div',
                {
                    className: 'septxt'
                },
                'or'
            ),
            this.genInput(
                'ip',
                'Enter IP \'192.168.152.154\'',
                this.handleIpChange,
                this.handleRadioClick
            ),
            React.createElement(
                'div',
                {
                    className: 'userbutton'
                },
                React.createElement(
                    'button',
                    {
                        className: `btn btn-lg btn-outline-dark${this.state.btnState}`,
                        onClick: this.handleButtonClick
                    },
                    'Submit'
                )
            )
        );
    }
});
