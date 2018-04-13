var React = require('react'),
    CreateReactClass = require('create-react-class');

module.exports = CreateReactClass({
    handleInputChange: function (e) {
        const codeLineStr = (/\(\d+(?!\d)\)/).exec(e.target.value);
        const svnCommitStr = (/\[\d+(?!\d)\]/).exec(e.target.value);
        const fileStr = (/\w+.cpp\b/).exec(e.target.value);

        if (codeLineStr && svnCommitStr && fileStr) {
            const codeLine = parseInt(codeLineStr[0].substring(1, codeLineStr[0].length - 1), 10);
            const revision = parseInt(svnCommitStr[0].substring(1, svnCommitStr[0].length - 1), 10);

            this.props.callback(revision, fileStr[0], codeLine);
        }
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
            )
        );
    }
});
