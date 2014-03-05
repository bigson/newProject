var ControlServerInfo = function(){
};

ControlServerInfo.prototype = {
	run : function(req, res){
		this.benchmark = (require("../libs/benchmark"));
		this.benchmark.startBenchmark();
		//--
		this.user = req.user;
		this.currentUser = req.currentUser;
		this.req = req;
		this.res = res;
		this.data = {};
		_this = this;
		this.data.os = require('os');
		this.config = req.config;
		this.data.socketPath = this.config.socket.protocol +':'+ this.config.socket.domain+':'+this.config.socket.port;
		this.RenderInterface();
	},

	RenderInterface : function(){
		this.benchmark.endBenchmark();
		this.data.benchmark = this.benchmark.benchmark;
		this.res.render('v_serverInfo.ect', this.data);
	}
};

module.exports = ControlServerInfo;