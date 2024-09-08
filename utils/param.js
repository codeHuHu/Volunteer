var param = {
	//启动模式 debug verify prod
	"mode": "verify",
	// 服务器地址列表
	"server": {
		"springboot":"http://127.0.0.1:8900/user",
		//"springboot":"https://api.hejianhui.online/testVolunteer"
		//"springboot":"https://api.hejianhui.asia/testVolunteer" //已过期
		//"springboot":"https://api.lkc-xiaomihu.asia/testVolunteer"

	},
}


module.exports = {
	param: param
}