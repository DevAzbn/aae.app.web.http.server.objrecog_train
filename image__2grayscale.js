'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0 --type=[Name of project or type of objects]')
	.default('type', 'default')
	.demand(['type'])
	.argv;

var Jimp = require('jimp');
var async = require('async');

var files = [];
var tasks = [];

azbn.mdl('fs/tree').walk('./data/src/negatives/' + argv.type + '/', function(file, stat){
	
	if (stat && stat.isDirectory()) {
		
	} else if(stat) {
		
		var _file = file.toLowerCase();

		if(
			_file.match(new RegExp('(.png)|(.jpg)|(.jpeg)$', 'ig'))
		) {
			
			//console.log(file);
			
			files.push(file);

		}
		
	}
			
}, function(err, results){
	
	//console.log(files);
	files.forEach(function(item, i, arr) {
		
		tasks.push(function(callback) {
			Jimp.read(item, function (err, image) {
				//var image = _image.clone();
				
				if(err) {
					
					callback(err, null);
					
				} else {
					
					image.grayscale();
					
					if(image.bitmap.width > 960) {
						image.resize(960, Jimp.AUTO);
					}
					
					image.quality(81);
					
					/*
					image.resize(Jimp.AUTO, 250);     // resize the height to 250 and scale the width accordingly
					image.resize(250, Jimp.AUTO);
					*/
					
					//console.dir(image);
					
					var new_file = azbn.uuid.v4()  + '.' + image.getExtension();
					
					image.write('./data/opencv/negatives/' + argv.type + '/' + new_file, function(_err){
						azbn.echo(new_file);
						callback(_err, null);
					});
					
				}
		
			});
			
		});
		
	});
	
	async.series(tasks, function (err, results) {
		
	});
	
});
