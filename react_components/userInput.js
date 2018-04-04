"use strict";

var React = require("react");

module.exports = React.createClass({
    handleInputChange: function(e) {
        const codeLineStr = (/\(\d+(?!\d)\)/).exec(e.target.value);
        const svnCommitStr = (/\[\d+(?!\d)\]/).exec(e.target.value);
        const fileStr = (/\w+.cpp\b/).exec(e.target.value);

        if (codeLineStr && svnCommitStr) {
            const codeLine = codeLineStr[0].substring(1, codeLineStr[0].length - 1);
            const svnCommit = svnCommitStr[0].substring(1, svnCommitStr[0].length - 1);

            this.props.callback(svnCommit, fileStr, codeLine);
        }
    },
    render: function() {
        return React.DOM.div(
            {
                className: "userinput"
            },
            React.DOM.input({
                className: "form-control form-control-lg",
                type: "text",
                placeholder: "Enter line",
                onChange: this.handleInputChange
            })
        );
    }
});
