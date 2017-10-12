'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

/*
opencv_createsamples.exe -info ./positives/.txt -vec vector.vec -w 20 -h 20
opencv_traincascade.exe -data ./cascades -vec vector.vec -bg ./negatives.txt -numStages 16 -minhitrate 0.925 -maxFalseAlarmRate 0.5 -numPos __80%__ -numNeg 1024 -w 20 -h 20 -mode ALL -precalcValBufSize 1024 -precalcIdxBufSize 1024
#rem -nonsym
*/

var path = require('path');
var os = require('os');

var is_windows = false;
if(os.platform() == 'win32') {
	is_windows = true;
}

var argv = require('optimist')
	.usage('Usage: $0 --opencv=[Dir of opencv binaries] --type=[Name of project or type of objects] --w=[int] --h=[int] --pos_count=[Count of positive-items, int] --stages=[Count of stages]')
	.default('type', 'default')
	.default('stages', 10)
	.default('w', '20')
	.default('h', '20')
	//.default('pos_count', '8')
	.default('opencv', 'c:/OpenCV/build/x64/vc14/bin')
	.demand([
		'type',
		'stages',
		'w',
		'h',
		'opencv',
		'pos_count',
	])
	.argv;

var files__negative = [];

azbn.mdl('fs/tree').walk('./data/opencv/negatives/' + argv.type, function(file, stat){
	
	if (stat && stat.isDirectory()) {
		
	} else if(stat) {
		
		var _file = file.toLowerCase();
		
		if(
			_file.match(new RegExp('(.jpg)|(.jpeg)|(.bmp)$', 'ig'))
		) {
			
			//console.log(file);
			
			var file_arr = [];
			
			//file_arr = file.split(['opencv', 'education', 'process', 'negatives', ''].join(path.sep));
			
			//files__negative.push(file_arr[1]);
			
			files__negative.push(file);
			
		}
		
	}
			
}, function(err, results){
	
	//console.log(files);
	
	azbn.echo('Count of negatives: ' + files__negative.length);
	
	app.saveFile('opencv/negatives/' + argv.type + '.txt', files__negative.join('\n'));
	
	
	var cmd__result = [
		[
			is_windows ? argv.opencv + '/' + 'opencv_createsamples.exe' : 'opencv_createsamples',
			'-info',
			'./positives/' + argv.type + '.txt',
			'-vec',
			'./vectors/' + argv.type + '.vec',
			'-w',
			argv.w,
			'-h',
			argv.h,
			'-num',
			argv.pos_count,
			'-bgcolor',
			0,
			'-bgthresh',
			0,
		],
		[
			is_windows ? argv.opencv + '/' + 'opencv_traincascade.exe' : 'opencv_traincascade',
			'-data',
			'./cascades/' + argv.type + '/',
			'-vec',
			'./vectors/' + argv.type + '.vec',
			'-bg',
			'./negatives/' + argv.type + '.txt',
			'-numStages',
			argv.stages,
			'-minHitRate 0.925',
			'-maxFalseAlarmRate 0.4',
			'-numPos',
			parseInt(parseFloat(argv.pos_count / argv.stages)),
			'-numNeg',
			files__negative.length,
			'-w',
			argv.w,
			'-h',
			argv.h,
			//'-mode ALL',
			'-featureType LBP',
			'-precalcValBufSize 2048',
			'-precalcIdxBufSize 2048',
			'-acceptanceRatioBreakValue -1',
			'-numThreads 4',
		],
		[],
	];
	
	for(var i in cmd__result) {
		
		cmd__result[i] = cmd__result[i].join(' '); 
		
	}
	
	app.saveFile('opencv/' + argv.type + (is_windows ? '.bat' : '.sh'), cmd__result.join('\n'));
	
});
