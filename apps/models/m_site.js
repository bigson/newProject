var base = require('./base'),
	baseModal = new base(),
	config = {
		modelName : 'site'
	},
	SiteSchema = new mongoose.Schema({
		adminId : String,
		timeCreate : {type: Number, default: ''},
		listSupporter : {type: Array, default: []},
		listDomain : {type: Array, default: []},
		listDomainFilter : {type: Array, default: []},
		// listCustomer : {type: Array, default: []},
		listCustomerWaitting : {type: Array, default: []},
		config : {},
		active : {type: Number, default: 1}
	});
SiteSchema.methods = {
/* RESET
 * ------------------------------------------------
 * 			RESET
 *
 */
 	reset : function(callback){
 		this.model(config.modelName)
 			.find({listCustomerWaiting : {$not: {$size: 0}}},
 				{listCustomerWaiting : []},
 				{ multi: true }, function(err, num){
 				var stt = false;
				if (err) {
				} else {
					stt = true;
				}
				if(callback) callback(stt);
 			});
 	},

/*
 * ------------------------------------------------
 * 			LIST CUSTOMER
 *
 */
	// Thêm vào danh sách ng dùng chờ để được hỗ trợ
	addCustomerWaitting : function(id, customer, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {'listCustomerWaiting' : customer}},
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

	// Xóa bỏ người dùng này khỏi danh sách được hỗ trợ
	removeCustomerWaitting : function(id, customer, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$pull : {'listCustomerWaiting' : customer}},
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
	removeAllCustomerWaittingByDoc : function(doc, callback){
		doc.listCustomerWaiting = [];
		doc.save(function(err){
			if(callback) callback();
		});
	},

/*
 * ------------------------------------------------
 * 			DOMAIN
 *
 */
	// Thêm domain site đã chạy
	addDomain : function(id, domain, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {'listDomain' : domain}},
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

	// Domain mà ng dùng chỉ muốn chạy
	addDomainFilter : function(id, domain, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$push : {'listDomainFilter' : domain}},
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

	// Xóa bỏ domain filter
	removeDomainFilter : function(id, domain, callback){
		this.model(config.modelName)
			.findByIdAndUpdate(id, {$pull : {'listDomain' : socketId}},
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

/*
 * ------------------------------------------------
 * 			DETAIL SITE
 *
 */
	// Get list supporter
	getSupporters : function(id, callback){
		this.model(config.modelName)
			.findById(id,{'listSupporter' : 1}, function(err, doc){
				if(err || !doc){
					if(callback) callback([]);
				}else{
					if(callback) callback(doc);
				}
			});
	},

	// Tạo mới site
	createNew : function(adId, callback){
		// var _this = this;
		this.model(config.modelName)
			.create({
		        adminId : adId,
		        listSupporter : [adId.toString()],
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

	// Lấy ra thông tin
	getInfo : function (id, callback) {
		// var _this = this;
		this.model(config.modelName)
			.findById(id, function(err, doc){
				var stt = false;
				if(err || !doc){
					//_this.log('getInfo', err);
				}else{
					stt = true;
				}
				if(callback) callback(stt, doc);
			});
	},

	log : function(fnName, err){
		console.error('Error: fn('+fnName+') in Modal(m_site.js)'+(err)?err:'');
	}
}

module.exports = new (db.model(config.modelName, SiteSchema))();