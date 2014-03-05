var ControlError = function(){
};

ControlError.prototype = {
	run : function(req, res){
		this.benchmark = require("../libs/benchmark");
		this.benchmark.startBenchmark();
		//--
		this.user = (require("../models/m_user"));
		this.customer = (require("../models/m_customer"));
		this.site = (require("../models/m_site"));
		this.req = req;
		this.res = res;
		this.data = {};

		var _this = this;

		this.user.reset(function(stt){
			_this.customer.reset(function(stt){
				_this.site.reset(function(stt){
					_this.renderInterface();
				});
			});
		});
	},

	renderInterface : function(){
		this.benchmark.endBenchmark();
		this.data.benchmark = this.benchmark.benchmark;
		this.res.render('v_err.ect', this.data);
	}
};

module.exports = ControlError;