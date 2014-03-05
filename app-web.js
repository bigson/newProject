var express = require('express'),
	app = express();
	server = require('http'),
	serverWeb = server.createServer(app),
	path = require('path'),
	config = require('./apps/config')('lan2'),
	// LOAD CONTROL
	home = require('./apps/controllers/c_home'),
	chatEmbed = require('./apps/controllers/c_chatEmbed'),
	dashboard = require('./apps/controllers/c_dashboard'),
	support = require('./apps/controllers/c_support'),
	login = require('./apps/controllers/c_login'),
	serverInfo = require('./apps/controllers/c_serverInfo'),
	reset = require('./apps/controllers/c_reset'),
	error = require('./apps/controllers/c_error'),

	// LOAD MODAL
	user = require("./apps/models/m_user"),

	// template engine
	ect = require('ect'),
	ectRenderer = ect({ watch: true, root: path.join( __dirname + '/apps/views'), gzip: true, ext : 'ect'}),
	// socket server
	socketIo = require('./app-socket').listen(express, server, config);

app.configure(function() {
	// set engine template
	app.engine('.ect', ectRenderer.render);

	// some environment variables
	app.set('views', __dirname + '/apps/views');
	app.use(express.favicon(__dirname + '/apps/public/img/favicon.ico'));
	app.use(express.logger('dev'));
	app.use(express.urlencoded());
	// app.use(express.json());
	// app.use(express.methodOverride());
	app.use(express.cookieParser(config.cookie.secret));
	app.use(express.session({secret: config.session.secret, key: config.session.key}));
	app.use('/static', express.static(path.join(__dirname, '/apps/public')));

});

// MIDWARE
	app.use(function(req, res, next){
		req.config = config;
		next();
	});
	// app.use(app.router);

// ROUTER
	var checkLogin = function(req, res, next){
			var cookie = req.signedCookies,
				email = (cookie.email)? cookie.email : '',
				password = (cookie.password)? cookie.password : '';
				urlLogin = '/login?url='+req.path;
			if(email != '' && password != ''){
				user.authorize(email,password, true,
				function(code, doc){
					if(code > 0){
						req.currentUser = doc;
						req.user = user;
						next();
					}else{
						res.redirect(urlLogin);
					}
				});
			}else{
				res.redirect(urlLogin);
			}
		};

	app.all('/home', function(req, res) {
		home(req, res);
	});
	app.all('/chatEmbed/:siteId', function(req, res) {
		(new chatEmbed()).run(req, res);
	});
	app.all('/dashboard',checkLogin, function(req, res) {
		(new dashboard()).run(req, res);
	});
	app.all('/support',checkLogin, function(req, res) {
		(new support()).run(req, res);
	});
	app.all('/login', function(req, res) {
		(new login()).run(req, res);
	});
	app.all('/server',express.basicAuth(config.basicAuth.username, config.basicAuth.password), function(req, res) {
		(new serverInfo()).run(req, res);
	});
	app.all('/reset',express.basicAuth(config.basicAuth.username, config.basicAuth.password), function(req, res) {
		(new reset()).run(req, res);
	});
	app.all('/error', function(req, res) {
		(new error()).run(req, res);
	});

// ERROR
	app.use(function(req, res, next) {
		res.status(404);
		// respond with html page
		if (req.accepts('html')) {
			res.render('v_err_404.ect');
			return;
		}

		// respond with json
		if (req.accepts('json')) {
			res.send({ error: 'Not found' });
			return;
		}

		// default to plain-text. send()
		res.type('txt').send('Not found');
	});

serverWeb.listen(config.web.port);//, config.web.domain