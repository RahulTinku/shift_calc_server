var secret;
exports.setSecret = function (user, password) {
	secret = user + password;
	return secret;
}

exports.getSecret = function () {
	return secret;
}