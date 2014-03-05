var ControlLogin = function(){
};

ControlLogin.prototype = {
	run : function(req, res){
		this.benchmark = require("../libs/benchmark");
		this.benchmark.startBenchmark();
		//--
		this.user = (require("../models/m_user"));
		this.req = req;
		this.res = res;
		this.config = req.config;
		this.data = {lg_email: '',rg_email : '', rg_fullname: '', rg_error : '', lg_error : ''};

		// console.log(req.config);

		if(this.req.body.login){
			// Người dùng đăng nhập
			this.login();
		}else if(this.req.body.register){
			// Người dùng đăng ký tk
			this.register();
		}else{
			// Khi f5 trình duyệt kt cookie có tồn tại hay không
			this.checkLogin();
		}
	},

	login : function(){
		var body = this.req.body,
			email = (body.email) ? body.email : '',
			password = (body.password) ? body.password : '',
			_this = this;
		this.user.authorize(email, password, false,
			function(stt, doc){
				if(stt){
					// dn thanh cong
					_this.saveCookie(_this.res,{email : doc.email, password : doc.password});
					_this.redirectLink();
				}else{
					// dn k thanh cong
					_this.data.lg_email = email;
					_this.data.lg_error = 'Tài khoản chưa chính xác';
					_this.renderInterface();
				}
			});
	},

	register : function(){
		var body = this.req.body,
			email = (body.email) ? body.email : '',
			fullname = (body.fullname) ? body.fullname : '',
			password = (body.password) ? body.password : '',
			confirmPassword = (body.confirmPassword) ? body.confirmPassword : '',
			_this = this;

		this.data.rg_fullname = fullname;
		this.data.rg_email = email;

		if(fullname == ''){
			this.data.rg_error = 'Tên không được bỏ trống!';
			this.renderInterface();
			return;
		}
		if(!this.validateEmail(email)){
			this.data.rg_error = 'Email nhập vào chưa chính xác!';
			this.renderInterface();
			return;
		}
		if(password != confirmPassword){
			this.data.rg_error = 'Mật khẩu nhập vào chưa chính xác!';
			this.renderInterface();
			return;
		}
		// kt tk đã tồn tại chưa
		this.user.checkAccExist(email,
			function(stt){
				if(stt){
					// thông báo tk đã tồn tại
					_this.data.rg_error = 'Tài khoản này đã có người sử dụng!';
					_this.renderInterface();
				}else{
					// tiến hành tạo tk
					_this.user.createNew(email, password, fullname,
						function(stt, doc){
							console.log(stt, doc);
							if(stt){
								// tạo tk thành công
								_this.saveCookie(_this.req, {email : doc.email, password : doc.password});
								_this.redirectLink();
							}else{
								// báo lỗi k tạo tk thành công được
								_this.data.rg_error = 'Server không thể tạo tài khoản của bạn!';
								_this.renderInterface();
							}
						});
				}
			});
	},

	checkLogin : function(){
		// console.log('check login');
		var cookie = this.req.signedCookies,
			email = (cookie.email)? cookie.email : '',
			password = (cookie.password)? cookie.password : '';
			_this = this;
		if(email != '' && password != ''){
			this.user.authorize(email,password, true,
			function(stt, doc){
				if(stt){
					_this.redirectLink();
				}else{
					_this.data.lg_email = email;
					_this.renderInterface();
				}
			});
		}else{
			this.renderInterface();
		}
	},

	redirectLink : function(){
		// đã có cookie trên máy và đăng nhập thành công thì kt url có link nào không
		//Nếu k thì redirect sang trang mặc định
		var link = (this.req.query.url)? this.req.query.url: '/dashboard';
		this.res.redirect(link);
	},

	saveCookie : function(res, obj){
		var maxAge = 604800000;
		for(i in obj){
			// console.log(i, obj[i], this.config.cookie.domain);
			this.res.cookie(i, obj[i], { domain: this.config.cookie.domain,/* secure: true,*/ path: '/', httpOnly: true, signed: true, maxAge : maxAge});
		}
	},

	validateEmail : function(email) {
		var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	},

	renderInterface : function(){
		this.benchmark.endBenchmark();
		this.data.benchmark = this.benchmark.benchmark;
		this.res.render('v_login.ect', this.data);
	}
};

module.exports = ControlLogin;