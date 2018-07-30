const React = require('react');
const CreateReactClass = require('create-react-class');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            btnState: ' disabled',
            revision: 0,
            filename: '',
            codeLine: 0
        };
    },
    handleInputChange: function (e) {
        const codeLineStr = (/\(\d+(?!\d)\)/).exec(e.target.value);
        const svnCommitStr = (/\[\d+(?!\d)\]/).exec(e.target.value);
        const fileStr = (/\w+.cpp\b/).exec(e.target.value);

        if (codeLineStr && svnCommitStr && fileStr) {
            const codeLine = parseInt(codeLineStr[0].substring(1, codeLineStr[0].length - 1), 10);
            let revision = parseInt(svnCommitStr[0].substring(1, svnCommitStr[0].length - 1), 10);

            if (revision === 0) {
                revision = 'HEAD';
            }

            console.log(this);

            this.setState({
                btnState: 'btn btn-dark',
                revision: revision,
                filename: fileStr[0],
                codeLine: codeLine
            });
        }
    },
    handleButtonClick: function () {
        let param = `/${this.state.revision}`;
        param += `/${this.state.filename}`;
        param += `/${this.state.codeLine}`;
        window.location.href = `/getSvnFile${param}`;
    },
    render: function () {
        return React.createElement(
            'div',
            {
                className: 'userinput'
            },
            React.createElement(
                'input',
                {
                    className: 'form-control form-control-lg',
                    type: 'text',
                    placeholder: 'Enter line like \'[  638.620997] sv2[151862]: (Error) XDevFpgaBrg.cpp(620) Assertion failed\'',
                    onChange: this.handleInputChange
                }
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
