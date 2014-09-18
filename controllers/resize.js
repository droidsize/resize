//Getting the required files
var multer = require('multer');
var util = require('util');
var fs = require('fs');
var path = require('path');
var easyimage = require('easyimage');
var gm = require('gm');
var path = require('path');
var random = require('./random');
var rmdir = require('rimraf');
var archiver = require('archiver');
var q = require('q');
var output_path = './public/uploads/output/';

//Creating routes for the resize
exports.getResize = function(req, res) {
  res.render('index', {
    title: "I love files"
  });
};

exports.postResize = function(req, res, next) {

  if (req.files && req.body.iconSize) {
    var session_folder = random.randomString(5);
    var iconSize = req.body.iconSize;
    var reqIconSizes = req.body.reqIconSizes;
    if (typeof reqIconSizes === 'undefined') {
      reqIconSizes = ['ldpi', 'mdpi', 'tvdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'];
    }
    console.log(reqIconSizes);
    console.log(util.inspect(req.files));

    if (typeof req.files.myFile.size === 0) {
      return next(new Error("Hey you need to select a file"));
    } else {
      var images = req.files.myFile;
      var session_path = output_path + session_folder;
      if (images instanceof Array) {
        for (image in images) {
          var filePath = images[image].path;
          console.log("req.files " + filePath);
          var name = images[image].originalname;
          resizeImage(filePath, name, session_folder, iconSize, reqIconSizes, computeRatio);
        }
        res.end("we got your files");
      } else {
        var filePath = images.path;
        console.log("req.files " + filePath);
        var name = images.originalname;
        resizeImage(filePath, name, session_folder, iconSize, reqIconSizes,
          computeRatio, function(response) {
            zipFile(response, session_path + "/", function(response) {
              if (response) {

              }
            });
            res.end("We got your files");
          });
      }
    }
  }
};

function resizeImage(path, name, session_folder, iconSize, reqIconSizes, computeRatio, callback) {
  //Getting the image dimensions
  var dimensions = {};
  var sizeRatios = computeRatio(iconSize);
  var zipFile_path;
  var session_path = output_path + session_folder;
  var drawables_path = session_path + "/drawables";
  var icons_path = drawables_path + "/drawable-";
  getImageDimensions(path, function(response) {
    if (response) {
      dimensions = response;
      console.log(dimensions);
      createDirectory(session_path, function(response) {
        if (response) {
          createDirectory(drawables_path, function(response) {
            if (response) {
              for (ratio in reqIconSizes) {
                //Creating a directory for current drawable resolution
                createDirectory(icons_path + reqIconSizes[ratio], function(response) {
                  if (response) {
                    //Getting the width
                    var width = parseFloat((dimensions
                      .width * sizeRatios[reqIconSizes[ratio]]).toFixed(2));
                    //Getting the height
                    var height = parseFloat((dimensions
                      .height * sizeRatios[reqIconSizes[ratio]]).toFixed(2));
                    console.log("Width: " + width, "Height: " + height);
                    gm(path)
                      .options({
                        imageMagick: true
                      })
                      .resize(width, height)
                      .noProfile()
                      .write(response + '/' + name, function(err) {
                        if (!err)
                          console.log('done');
                      });
                    console.log("Ratio " + ratio, "Total Length " + ((reqIconSizes.length) - 1));
                    if (ratio === ((reqIconSizes.length) - 1)) {
                      console.log("If value :" + ratio);
                      callback(drawables_path + "/");
                    }
                  }
                });
              }
            }
          });
        }
      });
    }
  });

}


function getImageDimensions(path, callback) {
  console.log("getImageDimensions function :" + path);
  var dimensions = new Object();

  easyimage.info(path).then(
    function(file) {
      console.log(file);
      dimensions.width = file.width;
      dimensions.height = file.height;
      console.log("getImageDimensions function :");
      console.log(dimensions);
      callback(dimensions);
    }, function(err) {
      console.log(err);
      callback(err);
    }
  );
}


function createDirectory(path, callback) {
  fs.mkdir(path, function(e) {
    if (!e || (e && e.code === 'EEXIST')) {
      console.log("Directory created " + path);
      callback(path);
    } else {
      console.log(e)
    }

  });
}


function zipFile(path, dest_path, callback) {
  var zip_path = dest_path + "drawables.zip";
  var output = fs.createWriteStream(zip_path);
  var zipArchive = archiver('zip');

  output.on('close', function() {
    console.log("done with the zip", zip_path);
  });

  zipArchive.pipe(output);
  zipArchive.bulk([{
    src: ['**/*'],
    cwd: path,
    expand: true
  }]);

  zipArchive.finalize(function(err, bytes) {
    if (err) {
      console.log(err);
    }
    console.log('zip done', bytes);
  });
  callback(zip_path);
}

function deleteFile(path) {
  fs.exists(path, function(exists) {
    if (exists) {
      fs.unlink(path, function(err) {
        if (err)
          throw err;
        console.log("Successfully deleted file");
      });
    }
  });
}

function computeRatio(iconSize) {
  /*
    For reference here is the scaling when mdpi 1dp = 1px
    ldpi | mdpi | tvdpi | hdpi | xhdpi | xxhdpi | xxxhdpi
    0.75 | 1    | 1.33  | 1.5  | 2     | 3      | 4
    0.56 | 0.75 | 1     | 1.12 | 1.5   | 2.25   | 3
    0.5  | 0.66 | 0.88  | 1    | 1.33  | 2      | 2.66
    0.38 | 0.5  | 0.66  | 0.75 | 1     | 1.5    | 2
    0.25 | 0.33 | 0.44  | 0.5  | 0.66  | 1      | 1.33
    0.19 | 0.25 | 0.33  | 0.38 | 0.5   | 0.75   | 1

    for more reference see
    http://stackoverflow.com/questions/11581649/about-android-image-size-and-assets-sizes
    */

  var requiredSizes = {};

  if (iconSize === 'mdpi') {
    requiredSizes.ldpi = 0.75;
    requiredSizes.mdpi = 1;
    requiredSizes.tvdpi = 1.33;
    requiredSizes.hdpi = 1.5;
    requiredSizes.xhdpi = 2;
    requiredSizes.xxhdpi = 3;
    requiredSizes.xxxhdpi = 4;
  } else if (iconSize === 'tvdpi') {
    requiredSizes.ldpi = 0.56;
    requiredSizes.mdpi = 0.75;
    requiredSizes.tvdpi = 1;
    requiredSizes.hdpi = 1.12;
    requiredSizes.xhdpi = 1.5;
    requiredSizes.xxhdpi = 2.25;
    requiredSizes.xxxhdpi = 3;
  } else if (iconSize === 'hdpi') {
    requiredSizes.ldpi = 0.5;
    requiredSizes.mdpi = 0.66;
    requiredSizes.tvdpi = 0.88;
    requiredSizes.hdpi = 1;
    requiredSizes.xhdpi = 1.33;
    requiredSizes.xxhdpi = 2;
    requiredSizes.xxxhdpi = 2.66;
  } else if (iconSize === 'xhdpi') {
    requiredSizes.ldpi = 0.38;
    requiredSizes.mdpi = 0.5;
    requiredSizes.tvdpi = 0.66;
    requiredSizes.hdpi = 0.75;
    requiredSizes.xhdpi = 1;
    requiredSizes.xxhdpi = 1.5;
    requiredSizes.xxxhdpi = 2;
  } else if (iconSize === 'xxhdpi') {
    requiredSizes.ldpi = 0.25;
    requiredSizes.mdpi = 0.33;
    requiredSizes.tvdpi = 0.44;
    requiredSizes.hdpi = 0.5;
    requiredSizes.xhdpi = 0.66;
    requiredSizes.xxhdpi = 1;
    requiredSizes.xxxhdpi = 1.33;
  } else if (iconSize === 'xxxhdpi') {
    requiredSizes.ldpi = 0.19;
    requiredSizes.mdpi = 0.25;
    requiredSizes.tvdpi = 0.33;
    requiredSizes.hdpi = 0.38;
    requiredSizes.xhdpi = 0.5;
    requiredSizes.xxhdpi = 0.75;
    requiredSizes.xxxhdpi = 1;
  }

  return requiredSizes;
}
