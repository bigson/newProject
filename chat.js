var util = require('util');
console.log(util.inspect(process.memoryUsage()));

return;

var express = require('express'),

	app = express();
	server = require('http'),
	io = require('socket.io').listen(app, { log: false });

// RUN SERVER CHAT
server.createServer(app).listen(config.port, function() {
	console.log(
		'Successfully connected to couchDB://' + config.couchdb.host + ':' + config.couchdb.port,
		'\nExpress server listening on port ' + config.port
	);
});

io.sockets.on('connection', function (socket) {
	var a = setInterval(function(){
		socket.emit('responseChat', { msg : 'anh sơn đẹp trai' });
	},1000);
    //console.log(socket);
    socket.emit('success', { data : 'true' });
    socket.on('chat', function (data) {
        console.log(data);
    });
});


/*
 *
 * -- CONNECT COUCHDB --
 * with agentkeepalive
 */

var agentkeepalive = require('agentkeepalive');
var myagent = new agentkeepalive({
    maxSockets: 50
    , maxKeepAliveRequests: 0
    , maxKeepAliveTime: 30000
});

var nano = require('nano')({
    "url"              : "http://bigson:bigson@localhost:5984/"
    , "request_defaults" : { "agent" : myagent }
}), db = nano.db.use('test');

/*
db.insert({ crazy: true, db : 'la sao day' }, 'insert', function(err, body) {
    if (!err)
        console.log(body);

        console.log(err);
});*/

db.get('insert', { db: false }, function(err, body) {
    console.log(err);
    console.log(body);
});

db.head('insert', function(err, _, headers) {
  if (!err)
    console.log(headers);
});