module.exports = function(){
	mongoose = require('mongoose');
	//mongoose.connect('mongodb://localhost/bigson');
	db = mongoose.createConnection('mongodb://localhost/bigson');
	// db = mongoose.createConnection('mongodb://admin:admin@widmore.mongohq.com:10010/bigson');
};

module.exports.prototype  = {
	extend: function(modalName, args) {
		var obj = {
			findById : function(_id, column, callback){
				this.collection().model(modalName)
					.findById(_id,column,
					function(err, doc){
						if(callback) callback(err, doc);
					});
			},

			findOne : function(conditions, column, callback){
				this.collection().model(modalName)
					.findOne(conditions,column,
					function(err, doc){
						callback(err, doc);
					});
			},

			find : function(conditions, column, callback){
				this.collection().model(modalName)
					.find(conditions,column,
					function(err, docs){
						callback(err, docs);
					});
			},

			create : function(conditions, callback){
				this.collection().model(modalName).create(conditions,
					function(err, doc){
						if(callback) callback(err, doc);
					});
			},

			updateById : function(_id, args, opts, callback){
				this.collection().model(modalName)
					.findByIdAndUpdate(_id, args, opts,
					function(err, doc){
						if(callback) callback(err, doc);
					});
			},

			update : function(conditions, args, opts, callback){
				this.collection().model(modalName)
					.update(conditions, args, opts,
					function(err, doc){
						if(callback) callback(err, doc);
					});
			},

			deleteById : function(_id, callback){
				this.collection().model(modalName)
					.findByIdAndRemove(_id, opts,
					function(err, doc){
						if(callback) callback(err, doc);
					});
			},

			delete : function(conditions, callback){
				this.collection().model(modalName)
					.remove(conditions, opts,
					function(err, doc){
						if(callback) callback(err, doc);
					});
			}
		};

		if(args)
		for (var arg in args){
			obj[arg] = args[arg];
		}

		return obj;
	}
}

// module.exports = new baseModal();