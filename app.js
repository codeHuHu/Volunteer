require("./utils/wx.js")

App({
	globalData: {
		isAuth: false,
		userInfo: {}
	},
	onLaunch() {
		this.getAuthStatus()
	},
	onshow() {

	},
	login(code) {
		let that = this

		//去获取JWT_Token
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/phoneLogin/" + code,
			method: "get",
		}).then(res => {
			console.log('phoneLogin res', res)
			//储存至本地
			if (res['access_token'] && res['token_type']) {
				that.globalData.isAuth = true
				console.log("正在储存JWT_Token");
				wx.setStorageSync('JWT_Token', res['token_type'] + ' ' + res['access_token'])
				wx.hideLoading()
				wx.reLaunch({
					url: '/pages/HomeCenter/home/home',
				})
				that.getAuthStatus()
			}
		}).catch(err => {
			console.log('用户未登录');
		})

	},
	logout() {
		let that = this
		wx.showLoading()
		wx.removeStorageSync('JWT_Token')
		that.globalData.userInfo = {}
		wx.reLaunch({
			url: '/pages/HomeCenter/home/home',
		})
		that.getAuthStatus()
		wx.hideLoading()
	},
	getAuthStatus() {
		let that = this

		//拿本地JWT_Token来获取用户信息
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/user/get",
			method: "get",
			showErr: false
		}).then(res => {
			that.globalData.isAuth = true
			that.globalData.userInfo = res
			wx.setStorageSync('userInfo', res)
		}).catch(err => {
			console.log('token信息过期');
			that.globalData.isAuth = false
		})
	},
});