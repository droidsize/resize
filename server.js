//Getting the required packages
var express = require('express');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var logger = require('morgan');
var multer = require('multer');
var util = require('util');
var path = require('path');
var resizeController = require('./controllers/resize')
//Create our express application
var app = express();

//Use environment defined port or 3000
var port = process.env.PORT || 3000;

//Create our express router
var router = express.Router();

//View engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: true
}));

app.use(multer({
	dest: './public/uploads/'
}));

app.use(express.static(__dirname +'/public'));

//Create our resizeRoute
router.route('/resize')
	.post(resizeController.postResize)
	.get(resizeController.getResize);


//Register all our routes with /
app.use('/', router);

//Start the server
app.listen(port);
console.log('Server started at port: ' + port);

