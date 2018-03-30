"use strict";

var svnUltimate = require("node-svn-ultimate");
const svnRepo = "https://trantor.matrox.com/mgisoft/Mediaprocessor/SV2/Trunk";

module.exports.getData = function(req, res) {
	svnUltimate.util.getRevision(svnRepo, function(err, data) {
		if (err) {
            console.log(err);
            return;
		}

		res.json({
            revision: data
        });
	});
};
