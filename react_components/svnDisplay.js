const React = require('react');
const CreateReactClass = require('create-react-class');
const request = require('superagent');
const svnDisplayFile = require('./svnDisplayFile');

module.exports = CreateReactClass({
    getInitialState: function () {
        return {
            file: []
        };
    },
    getSvnFullPath: function () {
        request
            .post('/api/getSvnFullPath/')
            .send({
                filename: this.props.filename,
                revision: this.props.revision
            })
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN full path failed!');
                    this.props.callBack();
                }

                if (res) {
                    this.getSvnFile(res.body.fullpath[0]);
                }
            });
    },
    getSvnFile: function (filepath) {
        request
            .post('/api/getSvnFile/')
            .send({
                filepath: filepath,
                revision: this.props.revision
            })
            .end((err, res) => {
                if (err) {
                    console.error('Get SVN file failed!');
                }

                if (res) {
                    this.setState({
                        file: res.body.file
                    });
                }

                this.props.callBack();
            });
    },
    render: function () {
        if (this.props.filename !== this.oldFilename) {
            this.oldFilename = this.props.filename;

            if (this.props.filename !== '' &&
                this.props.revision !== '') {
                this.getSvnFullPath();
            }
        }

        return React.createElement(svnDisplayFile, {
            filename: this.props.filename,
            file: this.state.file,
            line: this.props.line,
            revision: this.props.revision
        });
    }
});
