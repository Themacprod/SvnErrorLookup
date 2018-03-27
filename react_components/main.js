"use strict";

var React = require("react"),
    QSVNSpawn = require("q-svn-spawn"),
    client = new QSVNSpawn({
        cwd: "svn://trantor.matrox.com/mgisoft/Mediaprocessor/SV2/Trunk",
        username: "mgisread",
        password: "mgisread"
    });

module.exports = React.createClass({
    handleInputChange: function(e) {
        const codeLine = (/\(\d+(?!\d)\)/).exec(e.target.value);
        const svnCommit = (/\[\d+(?!\d)\]/).exec(e.target.value);

        if (codeLine && svnCommit) {
            console.log(codeLine[0].substring(1, codeLine[0].length - 1));
            console.log(svnCommit[0].substring(1, svnCommit[0].length - 1));

            client.getInfo().done(function(data) {
                console.log("Repository url is %s", data.url);
            });
        }
    },
    render: function() {
        return React.DOM.div({
                className: "input"
            }, React.DOM.input({
                className: "form-control form-control-lg",
                type: "text",
                placeholder: "Enter line",
                onChange: this.handleInputChange
            }));
    }
});
