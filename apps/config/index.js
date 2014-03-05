var config = {
	local: {
		mode: 'local',
		session :
			{
				secret : 'buingocson',
				key : 'EXSSIID'
			},
		cookie :
			{
				secret : 'ckbuingocson',
				domain : '.schat.vn'
			},
		web :
			{
				protocol : 'http',
				domain : 'schat.vn',
				port : 80
			},
		socket :
			{
				protocol : 'http',
				domain :'io.schat.vn',
				port : 3001
			},
		database : {
			user : '',
			password : '',
			dbName : 'bigson',
			host : 'localhost',
			port : 27017
		},
		basicAuth : {
			username : 'bigson',
			password : 'admin'
		}
	},
	lan: {
		mode: 'lan',
		session :
			{
				secret : 'buingocson',
				key : 'EXSSIID'
			},
		cookie :
			{
				secret : 'ckbuingocson',
				domain : '192.168.1.102'
			},
		web :
			{
				protocol : 'http',
				domain : '192.168.1.102',
				port : 80
			},
		socket :
			{
				protocol : 'http',
				domain :'192.168.1.102',
				port : 3001
			},
		database : {
			user : 'admin',
			password : 'admin',
			dbName : 'bigson',
			host : 'widmore.mongohq.com',
			port : 10210
		},
		basicAuth : {
			username : 'bigson',
			password : 'admin'
		}
	}
}
module.exports = function(mode) {
	// console.log(mode);
	return config[mode] || config.local;
}