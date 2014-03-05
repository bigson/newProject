var base = require('./base'),
	baseModal = new base(),
	config = {
		modelName : 'chat'
	},
	ChatSchema = new mongoose.Schema({
		chatId:  { type: String, default: '', index: true },
		suppporterId : { type: String, default: ''},
		customerId : { type: String, default: ''},
		listMessage:[{
			time : Number,
			idUser : String,
			read : Number,
			message : String
		}]
	});
// Các thao tác vs bảng chat là realtime nên không thể lưu lại obj để thực hiện tiếp được
ChatSchema.methods = {
	// Lấy ra danh sách lịch sử
	loadHistory : function(id, limit, callback){
		this.model(config.modelName)
			.findOne({chatId : chatId }, {$slice : {listMessage : [limit, 10]}}, {listMessage : 1},
			function(err, doc){
				console.log('loadHistory', doc);
				if(err || !doc){
					callback([]);
				}else{
					callback(doc);
				}
			});
	},

	// Tạo mới đoạn chát
	newMessage : function(chatId, userChat, ip, time, offine, message, callback){
		this.model(config.modelName)
			.update({chatId : chatId}, {$push: { listMessage: {time: time, idUser : userChat, isRead : 1, message : message} } },
			function(err, doc){
				// console.log('newMessage',err, doc);
				var stt = false;
				if(err || !doc){

				}else{
					stt= true;
				}
				callback(stt, doc);
			});
	},

	// Tìm kiểm - kiểm tra xem customer đã chat vs supporter nào để load ra
	findBylist : function(arrId , callback){
		this.model(config.modelName)
			.find({chatId : {$in : arrId}},{suppporterId : 1}, function(err, doc){
				if(err || !doc){
					callback(null);
				}else{
					callback(doc[0]);
				}
			});
	},

	findByChatId : function(chatId, callback){
		this.model(config.modelName)
			.findOne({chatId : chatId}, function(err, doc){
				var stt = false
				if(err || !doc){

				}else{
					stt= true;
				}
				callback(stt, doc);
			});
	},

	// Tạo mới chat
	createNew : function(customerId, suppporterId, callback){
		var chatId = this.makeChatId(customerId, suppporterId);
		this.model(config.modelName)
		.create({
	       chatId : chatId,
	       customerId : customerId,
	       suppporterId : suppporterId
	    },function(err, doc){
	    	if(err || !doc){
	    		callback(false);
	    	}else{
	    		callback(true, doc);
	    	}
	    });
	},

	// Tạo ra id chuẩn cho chat
	makeChatId : function(customerId, suppporterId){
		return customerId > suppporterId ? suppporterId + '.' + customerId : customerId + '.' + suppporterId;
	},

	log : function(fnName, err){
		console.error('Error: fn('+fnName+') in Modal(m_chat.js)'+(err)?err:'');
	}
}

module.exports = new (db.model(config.modelName, ChatSchema))();