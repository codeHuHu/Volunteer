var param = {
	//启动模式 debug verify prod
	"mode": "verify",
	// 服务器地址列表
	"server": {
		"fastapi": "https://fastapi.hejianhui.asia/volunteer",
		//"fastapi": "http://127.0.0.1:8005",
		"springboot":"http://127.0.0.1:8900/user",
		//"springboot":"https://fastapi.hejianhui.asia/testVolunteer"
	},
}


module.exports = {
	param: param
}