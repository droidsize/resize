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
    };

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
                        var filePath = images[image].path;
                        console.log("req.files "+filePath);
                        var name = images[image].originalname;
                        resizeImage(filePath, name, iconSize, computeRatio);
                    }
                    res.end("we got your files");
                }

                else {
                    var filePath = images.path;
                    console.log("req.files "+filePath);
                    var name = images.originalname;
                    resizeImage(filePath, name, iconSize, computeRatio);
                    res.end("We got your files");
                }
		      }	
	       }
        };

function resizeImage(path, name, iconSize, computeRatio) {
    //Getting the image dimensions
    var dimensions = {};
    var sizeRatios = computeRatio(iconSize);
    console.log(sizeRatios);
    easyimage.info(path).then(
        function(file) {
            console.log(file);
            dimensions.width = file.width;
            dimensions.height = file.height;
            console.log("getImageDimensions function :");
            console.log(dimensions);

            for(ratio in sizeRatios){
                var width = parseFloat((dimensions.width*sizeRatios[ratio]).toFixed(2));
                var height = parseFloat((dimensions.height*sizeRatios[ratio]).toFixed(2));
            gm(path)
                .options({imageMagick: true})
                .resize(width, height)
                .noProfile()
                .write('./public/uploads/output/'+sizeRatios[ratio].toString()+name, function(err){
                    if(!err)
                        console.log('done');
                    });
        }
            
        }, function (err){
            console.log(err);
            return err;
        }
    );    
    console.log(dimensions);
    
}


function getImageDimensions(path){
    console.log("getImageDimensions function :"+path);
    var dimensions = new Object();

    easyimage.info(path).then(
        function(file) {
            console.log(file);
            dimensions.width = file.width;
            dimensions.height = file.height;
            console.log("getImageDimensions function :");
            console.log(dimensions);
            return dimensions;
        }, function (err){
            console.log(err);
            return err;
        }
    );    
}

function computeRatio(iconSize){
    /*
    For reference here is the scaling when mdpi 1dp = 1px
    ldpi | mdpi | tvdpi | hdpi | xhdpi | xxhdpi | xxxhdpi
    0.75 | 1    | 1.33  | 1.5  | 2     | 3      | 4
    for more reference see 
    http://stackoverflow.com/questions/11581649/about-android-image-size-and-assets-sizes
    */

    var requiredSizes = [];

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
