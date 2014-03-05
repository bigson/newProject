var controlerChat = function(){
	// console.log(mongoose);
	this.user = require("../models/m_user");
	this.chat = require("../models/m_chat");
	this.customer = require("../models/m_customer");
};

controlerChat.prototype = {
	loadHistory : function(customerId, suppporterId, limit, callback){
		var id = this.chat.getIdChat(customerId, suppporterId)
		this.chat.loadHistory(id, limit, callback);
	},

	newMessage : function(customerId, suppporterId, chatId, ip, time, offine, message, callback){
		var id = this.chat.getIdChat(customerId, suppporterId);
		this.chat.NewMessage(id, chatId, ip, time, offine, message, callback);
	},

	newChat : function(customerId, suppporterId, callback){
		var id = this.chat.getIdChat(customerId, suppporterId), _this = this;
		// thêm mới bảng chats
		this.chat.newChat(id, function(code){
			if(code > 0){
				_this.user.AddlistUsersChat({idChat : targetIdChat}, ownerIdChat,
				function(_code, _message, _doc){
					if(callback) callback(_code, _message, _doc);
				});
			}else{
				if(callback) callback(0,'co loi');
			}
		});
	}
};

module.exports = new controlerChat();