var base = require('./apps/models/base'),
	baseModal = new base(),
	crypto = require('crypto'),
	config = {
		modelUser : 'user',
		modelExtUser : 'extuser'
	},
	UserSchema = new mongoose.Schema({
		idChat : { type: Number, default: '', index: true },
		username:  { type: String, default: '' },
		password: { type: String, default: '' },
		name: { type: String, default: '' },
		salt: { type: String, default: '' },
  		authToken: { type: String, default: '' },
  		timeCreate: {type: Number, default: ''},
  		online: {type: Boolean, default: false}
	}),
	UserExtSchema = new mongoose.Schema({
		_id : { _id: String},
		idChat : { type: Number, default: '', index: true },
  		listSocketId : {type : Array, default: []},
		listUsersChat : {type: Array, default: []}
	});
	console.log(base.extend, baseModal.extend);

	UserSchema.methods = {
		newUser : function(username, password, callback){
			var _this = this,
				date = new Date(),
				components = [
				    date.getYear(),
				    date.getMonth(),
				    date.getDate(),
				    date.getHours(),
				    date.getMinutes(),
				    date.getSeconds(),
				    date.getMilliseconds(),
				    Math.round(Math.random()*10),
				    Math.round(Math.random()*10),
				    Math.round(Math.random()*10)
				];
			// INSERT VÀO DB
			this.model(config.modelUser).create(
			{
				idChat : 100000001,
		        username : username,
		        salt : _this.makeSalt(),
		        password : _this.encryptPassword(password),
		        timeCreate : (new Date().valueOf())
		    },function (err, doc) {
		    	// console.log(err, doc);
				if(callback) callback(err, doc);
			});
		},

		authenticate : function (plainText) {
		    return this.encryptPassword(plainText) === this.password;
		},

		makeSalt : function () {
		    return Math.round((new Date().valueOf() * Math.random())) + '';
		},

		encryptPassword : function (password) {
			if (!password) return '';
		    var encrypred;
		    try {
		      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex')
		      return encrypred;
		    } catch (err) {
		      return '';
		    }
		}
	}

var user = new (db.model(config.modelUser, UserSchema)),
	userExt = new (db.model(config.modelExtUser, UserExtSchema));
user.newUser('bigson','bigson',
function(_err, _doc){
	if(_err || !_doc){
		if(callback) callback(false, 'Loi khong the them user nay', null);
	}else{
		UserExtSchema.create({
			_id : _doc.id,
			idChat : _doc.idChat
		},function(__err, __doc){
			if(__err || !__doc){
				if(callback) callback(false, 'Loi khong the them user nay(2)', _doc);
			}else{
				if(callback) callback(true, 'Them moi thanh cong', _doc);
			}
		});
	}
});