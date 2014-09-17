//Load required packages
var crypto = require('crypto');

 exports.randomString = function (digits) {	
			
	var chars = "abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789";

	var rnd = crypto.randomBytes(digits);
	var value = new Array(digits);
	var length = chars.length;

	for(var i = 0; i<digits; i++){
		value[i] = chars[rnd[i]% length]
	};

	return value.join('');
}

exports.randomBase64String = function (digits) {
	var value = crypto.randomBytes(digits).toString('base64');
	return value;
}