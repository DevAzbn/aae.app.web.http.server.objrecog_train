'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0]')
	.default('r', 0)
	.default('g', 0)
	.default('b', 0)
	.default('a', 0)
	.argv;

var Jimp = require('jimp');

console.log(Jimp.rgbaToInt(
	argv.r,//azbn.randint(0, 255),
	argv.g,//azbn.randint(0, 255),
	argv.b,//azbn.randint(0, 255),
	argv.a//azbn.randint(0, 255)
));