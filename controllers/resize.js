//Getting the required files
var multer = require('multer');
var util = require('util');
var fs = require('fs');
var path = require('path');
var easyimage = require('easyimage');
var gm = require('gm');
var path = require('path');

//Creating routes for the resize 
exports.getResize = function(req, res){
        res.render('index', {title: "I love files"});
    }

exports.postResize = function(req, res, next) {
    var iconSize = req.body.iconSize;
    var reqIconSizes = req.body.reqIconSizes;
    console.log(reqIconSizes);

	if(req.files){
		console.log(util.inspect(req.files));
		//console.log(util.inspect(req.body));

		if(typeof req.files.myFile.size === 0){
			return next(new Error("Hey you need to select a file"));
		}	

		else {  
                var images = req.files.myFile;
				if(images instanceof Array){
                    for(image in images){
                        var filePath = image.path;
                        var name = image.originalname;
                        var dimensions = getImageDimensions(filePath);
                        console.log(dimensions);
                        var sizeRatios = computeRatio(iconSize);
                        console.log(sizeRatios);
                        for(ratio in sizeRatios){
                            resizeImage(path, name, dimensions.width, dimensions.height, ratio);
                        }
                    }
                }

                else {
                    var filePath = images.path;
                    var name = images.originalname;
                    var dimensions = getImageDimensions(filePath);
                    var sizeRatios = computeRatio(iconSize);
                    for(ratio in sizeRatios){
                        resizeImage(path, name, dimensions.width, dimensions.height, ratio);
                    }
                }
                res.end("We got your files");
		      }	
	       }
        }

function getImageDimensions(path){
    var dimensions = new Object();
    easyimage.info(path).then(
        function(file) {
            console.log(file);
            dimensions.width = file.width;
            dimensions.height = file.height;
        }, function (err){
            console.log(err);
        }
    );
    return dimensions;
}


function resizeImage(path, name, width, height, ratio) {
    gm(path)
        .options({imageMagick: true})
        .resize(width/2, height/2)
        .noProfile()
        .write('./public/uploads/output/'+ratio.toString()+name, function(err){
            if(!err)
                console.log('done')
        });
}

function computeRatio(iconSize){
    /*
    For reference here is the scaling when mdpi 1dp = 1px
    ldpi | mdpi | tvdpi | hdpi | xhdpi | xxhdpi | xxxhdpi
    0.75 | 1    | 1.33  | 1.5  | 2     | 3      | 4
    for more reference see 
    http://stackoverflow.com/questions/11581649/about-android-image-size-and-assets-sizes
    */

    var requiredSizes = new Array();

    if(iconSize === 'mdpi'){
        requiredSizes = [0.75, 1.33, 1.5, 2, 3, 4];
    }

    else if(iconSize === 'tvdpi'){
        requiredSizes = [0.38, 0.75, 1.12, 1.5, 2.25, 3];
    }

    else if(iconSize === 'hdpi'){
        requiredSizes = [0.33, 0.66, 0.88, 1.33, 2, 2.66];
    }

    else if(iconSize === 'xhdpi'){
        requiredSizes = [0.25, 0.66, 0.88, 1.33, 2, 2.66];   
    }

    else if(iconSize === 'xxhdpi'){
        requiredSizes = [0.16, 0.33, 0.88, 1.33, 2, 2.66];  
    }

    else if(iconSize === 'xxxhdpi'){
        requiredSizes = [0.12, 0.25, 0.33, 0.38, 0.5, 0.75];
    }

    return requiredSizes;
}
