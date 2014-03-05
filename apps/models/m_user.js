var base = require('./base'),
	baseModal = new base(),
	crypto = require('crypto'),
	config = {
		modelName : 'user',
	},
	UserSchema = new mongoose.Schema({
		siteId : { type: String, default: '', index: true },
		email:  { type: String, default: '' , index : true},
		password: { type: String, default: '' },
		name: { type: String, default: '' },
		avatar : { type: String, default: '' },
		salt: { type: String, default: '' },
  		timeCreate: {type: Number, default: ''},
  		listCustomer : {type : Array, default: []},
  		//listCurrentCustomer : {type : Array, default: []},
  		listSocketId : {type : Array, default: []},
		active : {type: Number, default: 1}
	});

UserSchema.methods = {
/* RESET
 * ------------------------------------------------
 * 			RESET
 *
 */
 	reset : function(callback){
 		this.model(config.modelName)
 			.update({$or : [
 					{listSocketId : {$not: {$size: 0}}},
 					{listCustomer : {$not: {$size: 0}}}
 				]},
 				{
 					listSocketId : [],
 					listCustomer : []
 				},
 				{ multi: true }, function(err, num){
 				var stt = false;
				if (err) {
				} else {
					stt = true;
				}
				if(callback) callback(stt);
 			});
 	},

/* CUSTOMER
 * ------------------------------------------------
 * 			CUSTOMER
 *
 */
 	// Thêm vào danh sách ng dùng đang hỗ trợ
	addCustomer : function(id, customer, callback){
		// var objArg = (online)? {listCustomer : {$push : customer}} : {listCustomer : {$push : customer}, listCustomerWaiting : {$push : customer}};
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {'listCustomer' : customer}} ,
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

	checkListCustomer : function(listId, customerId, callback){
		this.model(config.modelName)
			.findOne({$and : [
					{_id : {$in : listId}},
					{'listCustomer' : customerId}
				]}, function(err, doc){
					// console.log('m_user > checkListCustomer',err, doc);
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
	// Lấy ra socket ID của user
	removeCurrentCustomerByDoc : function(doc, callback){
		doc.listCurrentCustomer = [];
		doc.save(function(err){
			if(callback) callback();
		});
	},

	// Thêm vào socket ID
	addCurrentCustomer : function(id, customerId, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {'listCurrentCustomer' : customerId}},
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
*/
/* SOCKET ID
 * ------------------------------------------------
 * 			SOCKET ID
 *
 */
	// Lấy ra socket ID của user
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

	// Thêm vào socket ID
	addSocketId : function(id, socketId, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {'listSocketId' : socketId}},
			function(err, doc) {
				// console.log('m_user > addSocketId: ',err, doc);
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

	// Xóa bỏ socket ID khi user tắt
	removeSocketId : function(id, socketId, callback){
		// console.log('m_user > removeSocketId');
		//{ $pull: { "items" : { id: 23 } } }
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$pull : {'listSocketId' : socketId}},
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

/* SITE ID
 * ------------------------------------------------
 * 			SITE ID
 *
 */
	// Cập nhật site ID
	updateSiteId : function(id, siteId, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id,{siteId : siteId},
			function(err, doc){
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

	// getUserChat : function(id){
	// 	this.model(config.modelName)
	// 		.findById(id, function(err, doc){
	// 			var stt = false;
	// 			if(err || !doc){
	// 				// doc = [];
	// 			}else{

	// 			}
	// 			if(callback) callback(doc);
	// 		});
	// }

/* CHECK ACC ONLINE
 * ------------------------------------------------
 * 			CHECK ACC ONLINE
 *
 */
 	checkOnline : function(listId, callback){
 		this.model(config.modelName)
			.find({_id : {$in : listId}, listSocketId : {$not: {$size: 0}} },{_id : 1, name : 1, email: 1},function(err, doc){
				// var code = 0;
				// if(err || !doc){
				// 	//_this.log('checkAccExist', err);
				// }else{
				// 	code = 1;
				// }
				if(callback) callback(doc);
			});
 	},

/* AUTHORIZE - CREATE NEW
 * ------------------------------------------------
 * 			AUTHORIZE - CREATE NEW
 *
 */

 	// Lấy thông tin người dùng
	getInfo : function(id, callback){
		this.model(config.modelName)
			.findById(id,function(err, doc){
				var stt = false;
				if(err || !doc){
					//_this.log('auth', err);
				}else{
					stt = true;
				}
				if(callback) callback(stt, doc);
			});
	},


	// Xác thực người dùng
	authorize : function(email, password, encrypt, callback){
		var _this = this;
		this.model(config.modelName)
			.findOne({email : email},function(err, doc){
				var stt = false;
				if(err || !doc){
					//_this.log('auth', err);
				}else{
					if((encrypt && doc.password == password) || (!encrypt && _this.encryptPassword(password, doc.salt) == doc.password)){
						stt= true;
					}
				}
				if(callback) callback(stt, doc);
			});
	},

	// Kiểm tra tk đã tồn tại chưa(kt khi ng dùng đăng ký tk)
	checkAccExist : function(email, callback){
		// var _this = this;
		this.model(config.modelName)
			.findOne({email : email},function(err, doc){
				var stt = false;
				if(err || !doc){
					//_this.log('checkAccExist', err);
				}else{
					stt = true;
				}
				if(callback) callback(stt, doc);
			});
	},

	// Tạo mới tài khoản
	createNew : function(email, password, name, callback){
		var salt = this.makeSalt(), _password = this.encryptPassword(password.toString(), salt);
		this.model(config.modelName)
		.create({
	        email : email,
	        salt : salt,
	        password : _password,
	        name : name,
	        timeCreate : (new Date().valueOf())
	    },function(err, doc){
	    	if(err || !doc){
	    		//_this.log('createNew', err);
	    		if(callback) callback(false);
	    	}else{
	    		if(callback) callback(true, doc);
	    	}
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
		console.error('Error: fn('+fnName+') in Modal(m_user.js)'+(err)?err:'');
	}

};


module.exports = new (db.model(config.modelName, UserSchema))();