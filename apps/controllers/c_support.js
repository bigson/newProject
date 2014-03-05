var ControlDashboard = function(){
	};

ControlDashboard.prototype = {
	run : function(req, res){
		this.benchmark = (require("../libs/benchmark"));
		this.benchmark.startBenchmark();
		//--
		this.user = req.user;
		this.currentUser = req.currentUser;
		this.site = (require("../models/m_site"));
		this.customer = require('../models/m_customer');
		this.config = req.config;
		this.req = req;
		this.res = res;
		this.data = {};
		_this = this;
		var siteId = req.currentUser.siteId, _this = this;
		console.log(this.currentUser);

		this.data.supporterId = this.currentUser._id;
		this.data.siteId = siteId;
		this.data.supporterName = this.currentUser.name;
		this.data.socketPath = this.config.socket.protocol +':'+ this.config.socket.domain+':'+this.config.socket.port;

		this.site.getInfo(siteId, function(stt, site){
			if(!stt){
				// không có site nào ntn cả
				// thông báo trả về lỗi 404
				return;
			}

			if(site.listSupporter.indexOf(_this.currentUser._id) >= 0){
				_this.customer.getInfoByList(_this.currentUser.listCustomer, function(listCustomer){
					_this.data.listCustomer = listCustomer;
					_this.renderInterface();
				});

			}else{
				// không được quyền truy cập site này
				// access deny
			}
		});



	},

	renderInterface : function(){
		this.benchmark.endBenchmark();
		this.data.benchmark = this.benchmark.benchmark;
		this.res.render('v_support.ect', this.data);
	}
};

module.exports = ControlDashboard;