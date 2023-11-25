require("./utils/wx.js")

App({
	globalData: {
		isAuth: false,
		userInfo: {}
	},
	onLaunch: function () {
		wx.showLoading({
			title: '',
		})
		var that = this
		if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力');
		} else {
			wx.cloud.init({
				// env 参数说明：
				//   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
				//   此处请填入环境 ID, 环境 ID 可打开云控制台查看
				//   如不填则使用默认环境（第一个创建的环境）
				env: 'volunteer-4gaukcmqce212f11',
				traceUser: true,
			})
			this.getAuthStatus()
			setTimeout(() => {
				wx.hideLoading()
			}, 2000)
		}
	},
	onshow() {

	},
	getToken() {
		let that = this
		let loginInfo = wx.getStorageSync('loginInfo')

		let form = {
			username: loginInfo['phone'] ? loginInfo['phone'] : '',
			password: loginInfo['password'] ? loginInfo['password'] : ''
		}
		//去获取JWT_Token
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/login",
			method: "post",
			data: form,
			showErr: false
		}).then(res => {
			//储存至本地
			if (res['access_token'] && res['token_type']) {
				that.globalData.isAuth = true
				console.log("正在储存JWT_Token");
				wx.setStorageSync('JWT_Token', res['token_type'] + ' ' + res['access_token'])
				//获取用户信息
				that.getAuthStatus()
			}
		}).catch(err => {
			console.log('用户未注册');
		})
	},
	getAuthStatus() {
		let that = this

		//拿本地JWT_Token来获取用户信息
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/user/get",
			method: "get",
			showErr: false
		}).then(res => {
			let loginInfo = wx.getStorageSync('loginInfo')
			//判断是不是本人
			if (loginInfo && loginInfo['phone'] == res['phone']) {
				that.globalData.isAuth = true
				that.globalData.userInfo = res
				wx.setStorageSync('userInfo', res)
			} else {
				that.globalData.isAuth = false
				wx.removeStorageSync('userInfo')
				wx.removeStorageSync('JWT_Token')
			}
		}).catch(err => {
			that.globalData.isAuth = false
			wx.removeStorageSync('userInfo')
			console.log('token信息过期');
			//去获取Token
			that.getToken()
		})
	},
});