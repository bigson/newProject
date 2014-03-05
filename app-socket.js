/*
 *
 *		CREATE SERVER SOCKET IO
 *
 */

module.exports.listen = function(express, server, config){

	var appSocket = express(),
		serverSocket = server.createServer(appSocket),
		path = require('path'),
		parseSignedCookie = require('express/node_modules/connect').utils.parseSignedCookie,
		os = require('os'),
		io = require('socket.io').listen(serverSocket),
		cookie = require('express/node_modules/cookie'),
		mainSocketId,

		// khởi tạo hàng đợi
		kue = require('kue'),
		appKue = express(),
		serverKue = server.createServer(appKue),
		jobs = kue.createQueue(),

		// khởi tạo controller
		controlSocket = new (require('./apps/controllers/c_socket'))(jobs);

/*
 * -- KUE --
 */

	appKue.use(express.basicAuth(config.basicAuth.username, config.basicAuth.password));
	appKue.use(kue.app);
	serverKue.listen(3000);

	jobs.process('addMessage', function (job, done) {
	    // console.log("job process %d", job.id);
	    function next(i) {
	        // pretend we are doing some work
	        controlSocket.processNewChat(job.data, function (err) {
	            done();
	        });
	    }

	    next(0);
	});


/*
 * -- SOCKET --
 */

	serverSocket.listen(config.socket.port);//, config.socket.domain

	io.configure(function(){
		io.set('transports', [
			// 'flashsocket',
			// 'websocket',
			// 'htmlfile',
			'xhr-polling',
			'jsonp-polling'
			]);

	});

	io.sockets.on('connection', function (client) {
		mainSocketId = client.id;
	});


	function auth(message, state, callback){
		if(!state){
			io.sockets.sockets[mainSocketId].disconnect();
		}
		callback(message, state);
	}

	/*
	 * -----------------
	 * 		CUSTOMER
	 * -----------------
	 */

	io.of('/customer')
		.authorization(function (handshakeData, callback) {
			// XÁC THỰC CUSTOMER
			var _cookie = handshakeData.headers.cookie ? cookie.parse(handshakeData.headers.cookie) : {},
				username = (_cookie.cuUsername)? parseSignedCookie(_cookie.cuUsername, config.cookie.secret) : '',
				password = (_cookie.cuPassword)? parseSignedCookie(_cookie.cuPassword, config.cookie.secret) : '',
				id = (_cookie.cuId)? parseSignedCookie(_cookie.cuId, config.cookie.secret) : '',
				siteId = (handshakeData.query.site)? handshakeData.query.site : '',
				supporterId = (handshakeData.query.supporter)? handshakeData.query.supporter : '',
				_this = this;
			handshakeData.data = {};
			if(id != '' && username != '' && password != '' && siteId != ''){
				controlSocket.customerAuth(id, username, password, siteId,
				function(stt, customer){
					if(stt){
						handshakeData.data.customerId = customer.id;
						handshakeData.data.customerUsername = customer.username;
						handshakeData.data.siteId = siteId;

						if(supporterId == ''){
							// xử lý khi supporter offline. customer ở trạng thái chờ
						}else{
							// supporter online
							controlSocket.siteCheckSupporter(siteId, supporterId, function(obj){
								// console.log(obj);
								if(obj.code == 20){
									handshakeData.data.supporterId = supporterId;
									handshakeData.data.listSupporterSocketId = obj.data.listSocketId;
									auth(null, true, callback);
								}else{
									auth(obj.message, false, callback);
								}
							});
						}
					}else{
						auth('Tai khoan khong chinh xac', false, callback);
					}
				});
			}else{
				auth('Chua dang nhap - thieu tham so', false, callback);
			}
		}).on('connection',function (client){
			console.log('--- connect /customer ---');
			// thêm ms socket
			controlSocket.customerOnline(
				client.handshake.data.customerId,
				client.id,
				client.handshake.data.siteId,
				client.handshake.data.supporterId,
				function(stt){
					// console.log('client.id ',client.id);

					// gửi cho tất cả socket id supporter này
					for (var i = 0; i < client.handshake.data.listSupporterSocketId.length; i++) {
						io.of('/supporter').socket(client.handshake.data.listSupporterSocketId[i])
							.emit('c_customer_online', {customerId : client.handshake.data.customerId, customerUsername : client.handshake.data.customerUsername});
					};

					client.handshake.data.listSupporterSocketId = [];

					client.on('s_receive', function (data){
						// console.log(data);
						var objServer = {
											time : data.time,
											ip : client.handshake.address.address,
											message : data.message,
											supporterId : client.handshake.data.supporterId,
											customerId : client.handshake.data.customerId,
											fromId : client.handshake.data.customerId
										},
							objClient = {
											time : data.time,
											ip : client.handshake.address.address,
											message : data.message,
											customerId : client.handshake.data.customerId,
											fromId : client.handshake.data.customerId,
											fromUsername : client.handshake.data.customerUsername
										};

						controlSocket.newChat(objServer, function(obj){
							// console.log(obj);
							if(true || obj.code == 20){
								// gửi cho customer này nhưng có socket id #
								for (var i = 0; i < obj.data.customerListSocketId.length; i++) {
									if(obj.data.customerListSocketId[i] != client.id)
									io.of('/customer').socket(obj.data.customerListSocketId[i]).emit('c_receive', objClient);
								};

								// gửi cho tất supporter này
								for (var i = 0; i < obj.data.supporterListSocketId.length; i++) {
									io.of('/supporter').socket(obj.data.supporterListSocketId[i]).emit('c_receive', objClient);
								};

							}else{
								// có lỗi
								io.sockets.sockets[client.id].disconnect();
							}
						});
					});

					client.on('disconnect', function(data){
						console.log('--- disconnect /customer ---');
						// kt xem có thoát hoàn toàn k thì Gửi cho tất cả socketId của supporter
						controlSocket.customerOffline(client.handshake.data.customerId, client.id, client.handshake.data.supporterId,
							function(supporter_listSocketId, customerId, customerUsername){
								for (var i = 0; i < supporter_listSocketId.length; i++) {
									io.of('/supporter').socket(supporter_listSocketId[i])
										.emit('c_customer_offline', {customerId : customerId, customerUsername : customerUsername});
								};
							});
					});
				});
		});


	/*
	 * -----------------
	 * 		SUPPORTER
	 * -----------------
	 */

	io.of('/supporter')
		.authorization(function (handshakeData, callback) {
			var _cookie = handshakeData.headers.cookie ? cookie.parse(handshakeData.headers.cookie) : {},
				email = (_cookie.email)? parseSignedCookie(_cookie.email, config.cookie.secret) : '',
				password = (_cookie.password)? parseSignedCookie(_cookie.password, config.cookie.secret) : '';

			if(email != '' && password != ''){
				controlSocket.supporterAuth(email,password,
				function(obj){
					handshakeData.data = {};
					if(obj.code == 20){
						handshakeData.data.supporterId = obj.data.supporter.id;
						handshakeData.data.supporterName = obj.data.supporter.name;
						handshakeData.data.siteId = obj.data.site.id;
						handshakeData.data.listSocketIdCustomerWaitting = obj.data.listSocketIdCustomerWaitting;
						// handshakeData.data.
						console.log('-- dang nhap thanh cong 00');
						// callback('khong thanh cong', false);
						auth(null, true, callback);
					}else{
						auth(obj.message, false, callback);
					}
				});
			}else{
				auth('Chua dang nhap', false, callback);
			}
		}).on('connection',function (client){
			console.log('--- connect /supporter ---');
			controlSocket.supporterOnline(
				client.handshake.data.supporterId,
				client.id,
				client.handshake.data.listCustomerWaitting,
				function(){
					// console.log('AddSocketId da xong');
					// console.log('client.id ',client.id, client.handshake.data);

					// Gửi thông báo online cho list customer waitting
					for (var i = 0; i < client.handshake.data.listSocketIdCustomerWaitting.length; i++) {
						io.of('/customer').socket(client.handshake.data.listSocketIdCustomerWaitting[i])
							.emit('c_supporter_online', {supporterId : supporterId, supporterName : client.handshake.data.supporterName});
					};
					client.handshake.data.listSocketIdCustomerWaitting = [];

					client.on('s_receive', function (data){
						// console.log(data);
						var objServer = {
											time : data.time,
											ip : client.handshake.address.address,
											message : data.message,
											supporterId : client.handshake.data.supporterId,
											customerId : data.customerId,
											fromId : client.handshake.data.supporterId
										},
							objClient = {
											time : data.time,
											ip : client.handshake.address.address,
											message : data.message,
											customerId : data.customerId,
											fromId : client.handshake.data.supporterId,
											fromUsername : client.handshake.data.supporterName
										};

						controlSocket.newChat(objServer, function(obj){
							// console.log(obj);
							if(true || obj.code == 20){
								// gửi cho suppoter này nhưng có socket id #
								for (var i = 0; i < obj.data.supporterListSocketId.length; i++) {
									if(obj.data.supporterListSocketId[i] != client.id)
									io.of('/supporter').socket(obj.data.supporterListSocketId[i]).emit('c_receive', objClient);
								};

								// gửi cho tất customer này
								for (var i = 0; i < obj.data.customerListSocketId.length; i++) {
									io.of('/customer').socket(obj.data.customerListSocketId[i]).emit('c_receive', objClient);
								};

							}else{
								// có lỗi - chỉ ngắt trên server.
								io.sockets.sockets[client.id].disconnect();
							}
						});
					});

					client.on('disconnect', function(data){
						console.log('--- disconnect /supporter ---');
						// Gửi cho tất cả socketId của targetId
						controlSocket.supporterOffline(client.handshake.data.supporterId, client.id,
						function(listSocketIdCurrentCustomer, supporterId, supporterName){
							for (var i = 0; i < listSocketIdCurrentCustomer.length; i++) {
								io.of('/supporter').socket(listSocketIdCurrentCustomer[i])
									.emit('c_supporter_offline', {supporterId : supporterId, supporterName : supporterName});
							};
						});
					});

				});

		});


	/*
	 * -----------------
	 * 		SERVICE
	 * -----------------
	 */

	io.of('/staticserver')
		.authorization(function (handshakeData, callback) {
			console.log('authorization for /staticserver');
			// callback(null, true);
			var _cookie = handshakeData.headers.cookie ? cookie.parse(handshakeData.headers.cookie) : {},
				email = (_cookie.email)? parseSignedCookie(_cookie.email, config.cookie.secret) : '',
				password = (_cookie.password)? parseSignedCookie(_cookie.password, config.cookie.secret) : '';
			if(email != '' && password != ''){
				controlSocket.supporterAuth(email,password,
				function(obj){
					console.log(obj);
					if(obj.code == 20){
						// handshakeData.data.
						callback(null, true);
					}else{
						callback(obj.message, false);
					}
				});
			}else{
				callback('Chua dang nhap', false);
			}
		}).on('connection', function (socket) {
			console.log('connection for /staticserver');
			setInterval(function() {
				socket.emit('data', {process : process.memoryUsage(),
									os : { totalRam : os.totalmem(), freemem : os.freemem()},
									connect : Object.keys(io.sockets.sockets).length});
				// console.log(io);
	            // io.sockets.socket(arrListSocketId[i]).emit('c_receive', newData);
	        }, 1000);
		});

}