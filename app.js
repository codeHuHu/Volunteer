require("./utils/wx.js")

App({
	globalData: {
		isAuth: false,
		userInfo: {}
	},
	onLaunch() {
	},
	onshow() {

	},
	getToken() {
		let that = this
		wx.setStorageSync('loginInfo', {
			phone: "18319093956",
			password: "123456"
		})

		let loginInfo = wx.getStorageSync('loginInfo')

		let form = {
			username: loginInfo['phone'],
			password: loginInfo['password']
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