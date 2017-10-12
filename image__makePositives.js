'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0 --type=[Name of project or type of objects] --copies=[Max copies for image]')
	.default('deg', 21)
	.default('copies', 10)
	.default('type', 'default')
	.demand([
		'type',
	])
	.argv;

var Jimp = require('jimp');
var async = require('async');

var files = [];
var tasks = [];
var result_files = [];

azbn.mdl('fs/tree').walk('./data/src/positives/' + argv.type + '/', function(file, stat){
	
	if (stat && stat.isDirectory()) {
		
	} else if(stat) {
		
		var _file = file.toLowerCase();

		if(
			_file.match(new RegExp('(.png)|(.jpg)|(.jpeg)|(.bmp)$', 'ig'))
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
				
				if(err) {
					
					callback(err, null);
					
				} else {
					
					//image.grayscale();
					
					var _counter = 0;
					
					console.log('----------');
					console.log(item);
					
					for(var j = 0; j < argv.copies; j++) {
						
						//console.log(azbn.randint(-30, 30));
						
						(function(_image, _j){
								
								image.background(Jimp.rgbaToInt(
									0,//azbn.randint(0, 255),
									0,//azbn.randint(0, 255),
									0,//azbn.randint(0, 255),
									255,//azbn.randint(0, 255)
								));
								
								_image.rotate(azbn.randint(-argv.deg, argv.deg));
								
								var new_file = azbn.uuid.v4()  + '.bmp';
								
								result_files.push([
									argv.type + '/' + new_file,
									1,
									0,
									0,
									_image.bitmap.width,
									_image.bitmap.height,
								].join(' '));
								
								_image.write('./data/opencv/positives/' + argv.type + '/' + new_file, function(_err){
									
									_counter++;
									
									azbn.echo(new_file);
									
									if(_counter == argv.copies) {
										
										console.log('----------');
										
										callback(_err, null);
										
									}
									
								});
								
						})(image.clone(), j);
						
					}
					
				}
			
			});
			
		});
	
	});
	
	tasks.push(function(callback) {
		
		app.saveFile('opencv/positives/' + argv.type + '.txt', result_files.join('\n'));
		
		callback(null, null);
		
	});
	
	async.series(tasks, function (err, results) {
		
	});
	
});
