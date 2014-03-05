var mongoose = require('mongoose'),
	UserSchema = new mongoose.Schema({
		idChat : { type: Number, default: '' },
		username:  { type: String, default: '' },
		password: { type: String, default: '' },
		name: { type: String, default: '' },
		salt: { type: String, default: '' },
  		authToken: { type: String, default: '' },
  		timeCreate: {type: Number, default: ''},
  		listSocketId : {type : Array, default: []}
	});

mongoose.connect('mongodb://localhost/bigson');
UserSchema.methods = {
	AddSocketId : function(_id, newSocketId, callback){
		this.model('test').findByIdAndUpdate(_id,
								{$push: { listSocketId: newSocketId}},
								function(err, doc){
									console.log(err, doc);
								});
	}
}

var db = mongoose.model('test', UserSchema);

var child = new db();
// console.log(db);
child.AddSocketId('5290c9938a5462c821000003', '3333333333', function(){});