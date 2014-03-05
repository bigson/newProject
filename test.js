var redis = require('redis');
var reconn = redis.createClient();

for (var i = 0; i < 10000000; i++) {
	reconn.set('test:' + i, 'djkhfjd');
}