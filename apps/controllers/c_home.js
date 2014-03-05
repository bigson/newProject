module.exports = function(req, res) {
	var data = {title : 'anh sơn đẹp trai', content : 'thành công rồi'};
	data = {
		title : 'Hello, world!',
		id : 'main',
		links: [
			{ name : 'Google', url : 'http://google.com/' },
			{ name : 'Facebook', url : 'http://facebook.com/' },
			{ name : 'Twitter', url : 'http://twitter.com/' }
		],
		upperHelper : function (string) {
			return string.toUpperCase();
		}
	};
	res.render('page.ect', data);
}