var ControlDashboard = function(){};

ControlDashboard.prototype = {
	run : function(req, res){
		this.benchmark = (require("../libs/benchmark"));
		this.benchmark.startBenchmark();
		//--
		this.user = req.user;
		this.currentUser = req.currentUser;
		this.site = (require("../models/m_site"));
		this.req = req;
		this.res = res;
		this.data = {};
		var _this = this;

		console.log(this.currentUser);
		if(this.currentUser.siteId == ''){
			// chưa có siteId thì tạo
			this.site.createNew(this.currentUser._id,
				function(stt, site){
					// console.log(code, site);
					if(stt){
						// tạo thành công
						_this.data.siteId = site._id;
						_this.user.updateSiteId(_this.currentUser._id, _this.data.siteId, function(err, doc){
							_this.renderInterface();
						});
					}else{
						// có lỗi
						_this.renderInterface();
					}
				});
		}else{
			// đã có
			_this.data.siteId = _this.currentUser.siteId;
			_this.renderInterface();
		}
	},

	renderInterface : function(){
		this.benchmark.endBenchmark();
		this.data.benchmark = this.benchmark.benchmark;
		this.res.render('v_dashboard.ect', this.data);
	}
}

module.exports = ControlDashboard;