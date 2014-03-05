var io = require('socket.io').listen(8001);

var df = io.set('authorization',function (handshakeData, callback) {
    callback(null, true);
  })
  .on('connection', function (socket) {
    socket.emit('a message', {
        that: 'only'
      , '/': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/': 'will get'
    });
socket.on('bigson', function(data){
        console.log(data);
    });
  });

var chat = io
  .of('/chat')
  .authorization(function (handshakeData, callback) {
    callback(null, false);
  })
  .on('connection', function (socket) {
    socket.emit('a message', {
        that: 'only'
      , '/chat': 'will get'
    });
    chat.emit('a message', {
        everyone: 'in'
      , '/chat': 'will get'
    });
  });

var news = io
  .of('/news')
  .on('connection', function (socket) {
    socket.emit('item', { news: 'item' });
    socket.on('bigson', function(data){
        console.log(data);
    });
  });