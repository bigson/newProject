var base = require('./base'),
	baseModal = new base(),
	crypto = require('crypto'),
	config = {
		modelName : 'customer'
	},
	CustomerSchema = new mongoose.Schema({
		username: { type: String, default: '' },
		password: { type: String, default: '' },
		email : { type: String, default: '' },
		salt: { type: String, default: '' },
  		timeCreate: {type: Number, default: ''},
		listSocketId : {type : Array, default: []},
		listIp : {type : Array, default: []}
		/*,
		listPreSupporter : {type : Array, default: []}*/
	});
CustomerSchema.methods = {
/* RESET
 * ------------------------------------------------
 * 			RESET
 *
 */
 	reset : function(callback){
 		this.model(config.modelName)
 			.update({listSocketId : {$not: {$size: 0}}},
 				{listSocketId : []},
 				{ multi: true }, function(err, num){
 				var stt = false;
				if (err) {
				} else {
					stt = true;
				}
				if(callback) callback(stt);
 			});
 	},

	// Lấy ra danh sách IP
	getIp : function(id, callback){
		this.model(config.modelName)
			.findById(id,{'listIp' : 1}, function(err, doc){
				// var code = 0;
				if(err || !doc){
					// doc = [];
					//_this.log('getSocketIdById', err);
					if(callback) callback([]);
				}else{
					if(callback) callback(doc);
				}
			});
	},

	getInfoByList : function(arrId, callback){
		this.model(config.modelName)
			.find({_id : {$in : arrId}}, function(err, doc){
				if(err || !doc){
					// doc = [];
					//_this.log('getSocketIdById', err);
					if(callback) callback([]);
				}else{
					if(callback) callback(doc);
				}
			});
	},

	getInfo : function(id, callback){
		this.model(config.modelName)
			.findById(id, function(err, doc){
				// console.log('m_customer getInfo',err, doc);
				var stt = false;
				if (err || !doc) {
					//_this.log('addSocketId', err);
				} else {
					// send the records
					stt = true;
				}
				if(callback) callback(stt, doc);
			});
	},
/*
 * ------------------------------------------------
 * 			PRE SUPPORTER
 *
 */
 	/*// Thêm vào id supporter đã chat vs customer
 	addPreSupporter : function(siteId, callback){
 		this.model(config.modelName)
			.findById(id,{'listSocketId' : 1}, function(err, doc){
				// var code = 0;
				if(err || !doc){
					// doc = [];
					//_this.log('getSocketIdById', err);
					if(callback) callback([]);
				}else{
					if(callback) callback(doc);
				}
			});
 	}*/

/* SOCKET
 * ------------------------------------------------
 *
 *
 */
	// Lấy ra socket ID của customer
	getSocketId : function(id, callback){
		this.model(config.modelName)
			.findById(id,{'listSocketId' : 1}, function(err, doc){
				// var code = 0;
				if(err || !doc){
					// doc = [];
					//_this.log('getSocketIdById', err);
					if(callback) callback([]);
				}else{
					if(callback) callback(doc);
				}
			});
	},

	getSocketIdByList : function(listCustomer, callback){
		this.model(config.modelName)
			.find({_id : {$in : listCustomer}},{'listSocketId' : 1}, function(err, doc){
				// var code = 0;
				if(err || !doc){
					// doc = [];
					//_this.log('getSocketIdById', err);
					if(callback) callback([]);
				}else{
					if(callback) callback(doc);
				}
			});
	},

	// Thêm mới socket ID
	addSocketId : function(id, socketId, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {listSocketId : socketId}},
			function(err, doc) {
				var stt = false;
				if (err || !doc) {
					//_this.log('addSocketId', err);
				} else {
					// send the records
					stt = true;
				}
				if(callback) callback(stt);
			});
	},

	// Xóa bỏ socket ID
	removeSocketId : function(id, socketId, callback){
		//{ $pull: { "items" : { id: 23 } } }
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$pull : {listSocketId : socketId}},
			function(err, doc) {
				var stt = false;
				if (err || !doc) {
					//_this.log('addSocketId', err);
				} else {
					// send the records
					stt = true;
				}
				if(callback) callback(stt, doc);
			});
	},

/* AUTH - CREATE NEW
 * ------------------------------------------------
 *
 *
 */
	// Kt đăng nhập
	authorize : function(id, username, password, callback){
		var _this = this;
		this.model(config.modelName)
			.findById(id,function(err, doc){
				var stt = false;
				if(err || !doc){
					//_this.log('auth', err);
				}else{
					if(username == doc.username && password == password){
						stt = true;
					}
				}
				callback(stt, doc);
			});
	},

	// Tạo mới
	createNew : function(username, email, password, callback){
		// console.log(username, email, password);
		var salt = this.makeSalt(), _password = this.encryptPassword(password.toString(), salt), _this = this;
		this.model(config.modelName)
			.create({
				username: username,
				email : email,
				password: _password,
				salt: salt,
		        timeCreate : (new Date().valueOf())
		    },function(err, doc){
		    	var stt = false;
				if(err || !doc){
					//_this.log('createNew', err);
				}else{
					stt = true;
				}
				if(callback) callback(stt, doc);
		    });
	},

	makeSalt : function () {
	    return Math.round((new Date().valueOf() * Math.random())) + '';
	},

	encryptPassword : function (password, salt) {
		if (!password) return '';
	    var encrypred;
	    try {
	      encrypred = crypto.createHmac('sha1', salt).update(password).digest('hex')
	      return encrypred;
	    } catch (err) {
	      return '';
	    }
	},

	log : function(fnName, err){
		console.error('Error: fn('+fnName+') in Modal(m_customer.js)'+(err)?err:'');
	}
}

module.exports =  new (db.model(config.modelName, CustomerSchema))();