'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0 --type=[Name of project or type of objects] --size=[Size of image-array in iteration]')
	.default('type', 'default')
	.default('size', 5)
	.demand(['type', 'size'])
	.argv;

var Jimp = require('jimp');
var async = require('async');

var files = [];
var tasks = [];

var array_chunk = function(input, _size) {
	for(var x, i = 0, c = -1, l = input.length, n = []; i < l; i++){
		(x = i % _size) ? n[c][x] = input[i] : n[++c] = [input[i]];
	}
	return n;
};

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
	
	var files_chunked = array_chunk(files, argv.size);
	
	files_chunked.forEach(function(chunk, _i, _arr) {
		
		tasks.push(function(callback) {
			
			var chunk_item = 0;
			
			chunk.forEach(function(item, i, arr) {
				
				Jimp.read(item, function (err, image) {
					//var image = _image.clone();
					
					if(err) {
						
						callback(err, null);
						
					} else {
						
						image.grayscale();
						
						if(image.bitmap.width > 800) {
							image.resize(800, Jimp.AUTO);
						}
						
						image.quality(81);
						
						var new_file = azbn.uuid.v4()  + '.jpg';// + image.getExtension();
						
						image.write('./data/opencv/negatives/' + argv.type + '/' + new_file, function(_err){
							
							chunk_item++;
							
							if(chunk_item == argv.size) {
								
								azbn.echo(_i + ' / ' + files_chunked.length);
								callback(_err, null);
								
							}
							
						});
						
					}
					
				});
				
			});
		});
		
	});
	
	async.series(tasks, function (err, results) {
		
	});
	
});
