'use strict';

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

var azbn = new require(__dirname + '/../../../../../../system/bootstrap')({
	
});

var app = azbn.loadApp(module);

var argv = require('optimist')
	.usage('Usage: $0  --type=[Name of project or type of objects] --search=[Search text on images.yandex.ru] --to=[Copy images to dir: negatives || positives]')
	.default('search', 'лес')
	.default('type', 'default')
	.default('to', 'negatives')
	.demand(['search', 'type'])
	.argv;

var Jimp = require('jimp');

var urls = [];

azbn.mdl('web/http').r('GET', 'https://yandex.ru/images/touch/search?source=collections&text=' + encodeURIComponent(argv.search), {}, function(error, response, body){
	
	var $ = azbn.mdl('web/http').parse(body);
	//$('title').eq(0).html()
	
	//console.dir(body);
	
	$('.serp-item.i-bem').each(function(index){
		
		var item = $(this);
		var data = JSON.parse(item.attr('data-bem'))
		
		if(data['serp-item']) {
			
			var serp_item = data['serp-item'];
			
			if(serp_item && serp_item.img_href) {
				
				var url_data = serp_item.img_href;
				//console.log(url_data);
				
				Jimp.read(url_data, function (err, _image) {
					//var image = _image.clone();
					
					if(err) {
						
						console.log(err);
						
					} else {
						
						var image = _image.clone();
						
						image.grayscale();
						
						if(image.bitmap.width > 512) {
							image.resize(512, Jimp.AUTO);
						} else if(image.bitmap.height > 512) {
							image.resize(Jimp.AUTO, 512);
						}
						
						var new_file = '__' + azbn.uuid.v4()  + '.jpg';
						
						image.write('./data/src/' + argv.to + '/' + argv.type + '/' + new_file, function(_err){
							azbn.echo(new_file);
							//callback(_err, null);
						});
						
					}
				
				});
				
			}
			
		}
		
	})
	
	
	
	
});
