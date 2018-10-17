const Ssh2Client = require('ssh2').Client;

module.exports.getDmesg = function getDmesg(req, res) {
    const conn = new Ssh2Client();
    conn.on('ready', () => {
        conn.exec('dmesg', (err, stream) => {
            if (err) {
                res.sendStatus(400);
                throw err;
            }
            stream.on('close', () => {
                conn.end();
            }).on('data', (data) => {
                res.json({
                    dmesg: data.toString().split(/\r?\n/)
                });
            }).stderr.on('data', (data) => {
                console.error(data);
            });
        });
    }).connect({
        host: req.params.ip,
        port: 22,
        username: 'root',
        password: ''
    });
};
