var ControlChatEmbed = function(){
};

ControlChatEmbed.prototype = {
	run : function(req, res){
		// console.log('run');
		this.benchmark = require("../libs/benchmark");
		this.benchmark.startBenchmark();
		//--
		this.site = (require("../models/m_site"));
		this.customer = require('../models/m_customer');
		this.supporter = require('../models/m_user');
		this.chat = require('../models/m_chat');
		this.req = req;
		this.res = res;
		this.config = req.config;
		this.data = {siteOnline : false, showLogin : true};
		this.thisUser = {};

		var siteId = this.req.params.siteId, _this = this;
		this.data.siteId = siteId;
		this.data.socketPath = this.config.socket.protocol +':'+ this.config.socket.domain+':'+this.config.socket.port;
		// check site exist
		this.checkSiteOnline(siteId, function(stt, site, listSupporterOnline){
			if(!stt){
				// lỗi site không tồn tại 404
				_this.res.redirect('/error');
			}else{
				_this.currentSite = site;
				if(listSupporterOnline.length > 0){
					_this.data.siteOnline = true;
					_this.listSupporterOnline = listSupporterOnline;
					// siteOnline
					// -- kiểm tra xem có thực hiện chat hay bắt đầu vào
					if(_this.req.body.start){
						_this.startChat(function(){
							_this.renderInterface();
						});
					}else{
						// Khi f5 trình duyệt - lần đâu vào hoặc mở trang mới thì kt
						_this.defaultCase(function(){
							_this.renderInterface();
						});
					}
				}else{
					// site Offline
					// -- thông báo chỉ cho phép gửi email không cho chat
					_this.data.siteOnline = false;
					_this.siteOffline(function(){
						_this.renderInterface();
					});
				}

			}
		});
	},

	startChat : function(callback){
		console.log('c_chatEmbed > startChat');
		var _this = this,
			body = this.req.body,
			username = (body.email) ? body.username : '',
			email = (body.email) ? body.email : '';

		this.data.username = username;
		this.data.email = email;

		// console.log(username, email, username != '' && this.validateEmail(email));
		if(username != '' && this.validateEmail(email)){
			this.customer.createNew(username, email, Math.random(),
			function(stt, doc){
				// console.log(stt, doc);
				if(!stt){
					_this.data.showLogin = true;
					// _this.renderInterface();
					// return;
				}else{
					// đăng ký thành công
					// console.log('luu cookie');
					_this.saveCookie(_this.res, {cuUsername : doc.username, cuPassword : doc.password, cuId : doc.id});
					// console.log(doc.id);
					_this.data.customerId = doc.id;
					_this.data.customerUsername = doc.username;
					_this.data.showLogin = false;
				}
				// xử lý chọn ng chat cho user này
				_this.processSiteOnline(function(){
					if(callback) callback();
				});
			});
		}else{
			// gửi username hoặc email bị sai
			if(callback) callback();
		}
	},

	defaultCase : function(callback){
		// console.log('defaultCase');
		var cookie = this.req.signedCookies,
			id = (cookie.cuId)? cookie.cuId : '';
			username = (cookie.cuUsername)? cookie.cuUsername : '';
			password = (cookie.cuPassword)? cookie.cuPassword : '';
			_this = this;

			this.data.username = username;
			// console.log('dc',username, password, id);
		if(id != '' && username != '' && password != ''){
			this.customer.authorize(id, username, password,
			function(stt, doc){
				if(stt){
					_this.data.customerId = doc.id;
					_this.data.customerUsername = doc.username;
					_this.data.showLogin = false;
				}else{
					_this.data.showLogin = true;
				}
				// xử lý chọn ng chat cho user này
				_this.processSiteOnline(function(){
					if(callback) callback();
				});
			});
		}else{
			if(callback) callback();
		}
	},

	checkSiteOnline : function(siteId, callback){
		// console.log('checkSiteOnline');
		var _this = this;
		// check site exist
		this.site.getInfo(siteId, function(stt, site){
			if(!stt){
				// Nếu k có site nào có id ntn thì return luôn
				if(callback) callback(false);
				return;
			}

			// kiểm tra xem có ai online không
			_this.supporter.checkOnline(site.listSupporter, function(listSupporterOnline){
				// xử lý default hoặc đăng ký
				callback(true, site, listSupporterOnline);
			});

		});
	},

	processSiteOnline : function(callback){
		console.log('processSiteOnline');
		var _this = this;

		// kiểm tra xem user đã chat vs supporter nào chưa
		var _listChatId = [];
		for (var i = 0; i < _this.listSupporterOnline.length; i++) {
			_listChatId.push(_this.listSupporterOnline[i].id);
		};

		this.supporter.checkListCustomer(_listChatId, _this.data.customerId, function(stt, supporter){
			if(stt){
				// đã chat vs ng này rồi
				_this.data.supporterId = supporter.id;
				callback();
			}else{
				// chưa chat vs ai cả
				var _supporterRandom = _this.listSupporterOnline[Math.round(Math.random() * (_this.listSupporterOnline.length-1))],
				supporter = _supporterRandom;
				_this.data.supporterId = supporter.id;
				// thêm khách hàng này vào danhh sách chat của supporter
				_this.supporter.addCustomer(supporter.id, _this.data.customerId, function(stt){
					if(!stt){
					}
					callback();
				});
			}
		});

		// code cũ
		// this.chat.findBylist(_listChatId, function(objChat){
		// 	if(!objChat){
		// 		// chưa chát vs những ng online bao h cả > chọn ngẫu nhiên những ng đang online
		// 		var _supporterRandom = _this.listSupporterOnline[Math.round(Math.random() * (_this.listSupporterOnline.length-1))],
		// 			supporter = _supporterRandom;
		// 	}else{
		// 		// đã chat vs ng này rồi
		// 		var supporter = objChat;
		// 	}
		// 	_this.data.supporterId = supporter.id;
		// 	// thêm khách hàng này vào danhh sách chat của supporter
		// 	_this.supporter.addCustomer(supporter.id, _this.data.customerId, function(stt){
		// 		if(!stt){
		// 		}
		// 		callback();
		// 	});

		// });
	},

	siteOffline : function(callback){
		console.log('siteOffline');
		var _this = this;
		// this.site.addCustomerWaitting(this.currentSite._id, this.data.customerId, function(stt){
		// 	if(!stt){
		// 	}
			if(callback) callback();
		// });
	},

	renderInterface : function(){
		this.res.render('v_chatEmbed.ect', this.data);
	},

	validateEmail : function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},

	saveCookie : function(res, obj){
		var d = new Date(), maxAge = 604800000;
		for(i in obj){
			this.res.cookie(i, obj[i], { domain: this.config.cookie.domain,/* secure: true,*/ path: '/', httpOnly: true, signed: true, maxAge : maxAge});
		}
	}
};

module.exports = ControlChatEmbed;