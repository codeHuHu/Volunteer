require("./utils/wx.js")

App({
	globalData: {
		isAuth: false,
		userInfo: null
	},
	onLaunch() {
		this.getAuthStatus()
	},
	login(code) {
		let that = this
		//去获取JWT_Token
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/user/login",
			method: "post",
			data: { code },
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log('login的res', res)
			//储存至本地
			if (res.data['token']) {
				wx.setStorageSync('JWT_Token', res.data['token'])
				wx.hideLoading()
				wx.reLaunch({
					url: '/pages/HomeCenter/home/home',
				})
				that.getAuthStatus()
			}
		}).catch(err => {
			console.log('login的err', res)
		})

	},
	logout() {
		let that = this
		wx.showLoading()
		wx.removeStorageSync('JWT_Token')
		that.globalData.userInfo = { position: 0 }
		wx.reLaunch({
			url: '/pages/HomeCenter/home/home',
		})
		that.getAuthStatus()
		wx.hideLoading()
	},
	// 向后端获取用户信息
	getAuthStatus() {
		let that = this

		//拿本地JWT_Token来获取用户信息
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/user",
			method: "get",
			showErr: false
		}).then(res => {
			console.log('app.getAuthStatus获取信息res', res)
			// 全局
			that.globalData.isAuth = true
			that.globalData.userInfo = res.data
			// 本地
			wx.setStorageSync('userInfo', res.data)
		}).catch(err => {
			console.log("app.getAuthStatus获取信息err", err);
			that.globalData.isAuth = false
			that.globalData.userInfo = null
		})
	},
	getUserName() {
		let that = this
		if (that.globalData.userInfo != null) {
			return that.globalData.userInfo['name']
		}
		return '未登录';
	},
	getRole() {
		let that = this
		if (that.globalData.userInfo != null) {
			return that.globalData.userInfo['position']
		}
		return 0;
	}
});