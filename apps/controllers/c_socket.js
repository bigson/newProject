var ControlSocket = function(jobs){
	this.supporter = require('../models/m_user');
	this.customer = require('../models/m_customer');
	this.site = require('../models/m_site');
	this.chat = require('../models/m_chat');
	this.jobs = jobs;
};

ControlSocket.prototype = {

//	SITE
	siteCheckSupporter : function(siteId, supporterId, callback){
		this.supporter.getInfo(supporterId, function(stt, supporter){
			if(!stt){
				callback({code : 11, message : 'supporter khong ton tai'});
				return;
			}
			if(supporter.siteId != siteId){
				callback({code : 12, message : 'supporter khong co quyen'});
				return;
			}
			callback({code : 20,
					message : 'thanh cong - site ton tai - supporter ton tai',
					data : supporter});
		})
	},

// CHAT
	newChat : function(obj, callback){
		var _this = this;
		_this.supporter.getInfo(obj.supporterId,function(stt, supporter){
			if(!stt){
				// khong ton tai supporter nay
				callback({code : 11, message : 'supporter ID k chinh xac'});
				return;
			}
			_this.customer.getInfo(obj.customerId, function(stt, customer){
				if(!stt){
					// khong ton tại customer này
					callback({code : 12, message : 'customer ID k chinh xac'});
					return;
				}
				// thành công bắn vào hàng đợi
				obj.title = obj.message;
				obj.success = false;
				_this.jobs.create('addMessage',obj).save();

				callback({code : 20, message : '', data : {customerListSocketId : customer.listSocketId, supporterListSocketId : supporter.listSocketId}});
			});
		});
	},

	processNewChat : function(obj, callback){
		// console.log('c_socket > newChat', obj);
		var id = this.chat.makeChatId(obj.customerId, obj.supporterId);


		this.chat.newMessage(id, obj.fromId, obj.ip, obj.time, 1, obj.message,function(stt){
			if(stt){
				// obj.success = true;
				callback();
				// console.log('c_socket > newChat', '---- customer',customer, '---- supporter', supporter);
				// callback({code : 20, message : '', data : {customerListSocketId : customer.listSocketId, supporterListSocketId : supporter.listSocketId}});
			}else{
				// callback({code : 13, message : 'khong them dc message nay'});
				callback('Khong the luu duoc');
			}
		});
	},

// CUSTOMER
	customerAuth : function(id, username, password, siteId, callback){
		var _this = this;
		this.customer.authorize(id, username, password, function(stt, customer){
			// console.log('dang nhap customer ', stt, customer);
			if(stt){
				_this.site.getInfo(siteId, function(stt, site){
					if(!stt){
						// đăng nhập thành công và k tồn tại site này
						callback(false);
						return;
					}
					callback(true, customer);
				});
			}else{
				// không đăng nhập thành công
				callback(false);
			}
		});
	},

	customerOnline : function(customerId, socketId, siteId, supporterId, callback){
		var _this = this;
		// thêm socket id cho customerid
		this.customer.addSocketId(customerId, socketId,
			function(stt){
				if(!stt){

				}
				// kt xem đã tạo new chat chưa
				var chatId = _this.chat.makeChatId(customerId, supporterId);
				_this.chat.findByChatId(chatId, function(stt){
					if(!stt){
						_this.chat.createNew(customerId, supporterId, function(stt){
							callback(stt);
						});
					}else{
						callback(true);
					}
				});
				// kt xem site có supporter nào online không
				// _this.site.getInfo(siteId, function(stt, site){
				// 	if(!stt){

				// 	}
				// 	// tồn tại site này
				// 	var arrSupporter = site.listSupporter;
				// 	// kiểm tra xem có supporter nào đang online không

				// });
			});
	},

	customerOffline : function(customerId, socketId, supporterId, callback){
		var _this = this;
		this.customer.removeSocketId(customerId, socketId,
			function(stt, doc){
				if(!stt){
					return;
				}

				// kiểm tra ng dùng còn socket nào k
				if(doc.listSocketId.length == 0){
					// ng dùng thoát hoàn toàn
					// Lấy socket ID của supporter này
					_this.supporter.getInfo(supporterId, function(stt, supporter){
						callback(supporter.listSocketId, doc.id, doc.username);
					});
				}else{
					callback([]);
				}
			});
	},

// SUPPORTER
	supporterAuth : function(email, password, callback){
		var _this = this;
		// kiểm tra tk tồn tại hay k - kt site tồn tại hay k - kt xem có nằm trong danh sách hỗ trợ của site không
		this.supporter.authorize(email, password, true,
			function(stt, supporter){
				if(!stt){
					callback({code : 12, message : 'dang nhap khong thanh cong'});
					return;
				}
				_this.site.getInfo(supporter.siteId, function(stt, site){
					if(!stt){
						callback({code : 11, message :'Site khong ton tai'});
						return;
					}
					// trả về socket id của customer đang chờ
					// console.log('supporterAuth',site.listCustomerWaitting);
					_this.customerGetSocketIdByList(site.listCustomerWaitting,function(arrListSocketId){
						callback({code: 20,
							message : 'dang nhap thanh cong - site ton tai - co trong danh sach cua site nay',
							data : {site : site, supporter : supporter, listSocketIdCustomerWaitting : arrListSocketId}});
					});
				});
			});
	},

	supporterOffline : function(supporterId, socketId, callback){
		var _this = this;
		this.supporter.removeSocketId(supporterId, socketId,
			function(stt, doc){
				// console.log('c_socket > supporterOffline');
				if(!stt){
					return;
				}

				// kiểm tra ng dùng còn socket nào k
				if(doc.listSocketId.length == 0){
					// ng dùng thoát hoàn toàn
					// trả về socket ID của danh sách customer online
					_this.customerGetSocketIdByList(doc.listCustomer, function(listSocketId){
						callback(listSocketId, doc.id, doc.name);
					});
				}else{
					callback([]);
				}
			});
	},

	supporterOnline : function(supporterId, socketId, listCustomerWaitting, callback){
		var _this = this;
		_this.supporter.addSocketId(supporterId, socketId,function(stt, doc){
			// console.log('supporterId, socketId',supporterId, socketId);
			// console.log(stt, doc);
			if(!stt){
				callback(false);
				return;
			}
			callback(true);
		});

		/*this.supporter.getInfo(supporterId,function(stt, supporter){
			if(!stt){

			}
			// kiểm tra xem socket id này đã có trong list chưa
			if(supporter.listSocketId.indexOf(socketId) >= 0){
				// đã có trong list socket id
				_this.customerGetSocketIdByList(listCustomerWaitting, callback);
			}else{
				// chưa có trong list socket id
				_this.supporter.addSocketId(supporterId, socketId,function(stt){
					if(!stt){
						callback({code : 12, message :'khong them duoc socketId'});
						return;
					}

					_this.customerGetSocketIdByList(listCustomerWaitting, callback);
				});
			}
		});*/
	},

	customerGetSocketIdByList : function(arr, callback){
		// lấy socket id của customer online
		this.customer.getSocketIdByList(arr, function(arrListSocketId){
				// console.log('customerGetSocketIdByList', arrListSocketId);
				var _arrSocket = [];
				for (var i = 0; i < arrListSocketId.length; i++) {
					_arrSocket = _arrSocket.concat(arrListSocketId[i]);
				}
				callback(_arrSocket);
			});
	}

	// CHAT

}

module.exports = ControlSocket;