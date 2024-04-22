require("./utils/wx.js")

App({
	globalData: {
		isAuth: false,
		userInfo: null
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
			url: wx.$param.server['springboot'] + "/user/login",
			method: "post",
			data: {
				code
			},
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log('res', res)
			//储存至本地
			if (res.data['token']) {
				that.globalData.isAuth = true
				console.log("正在储存JWT_Token");
				wx.setStorageSync('JWT_Token', res.data['token'])
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
			url: wx.$param.server['springboot'] + "/user",
			method: "get",
			showErr: false
		}).then(res => {
			console.log('获取信息res', res)
			that.globalData.isAuth = true
			that.globalData.userInfo = res.data
			wx.setStorageSync('userInfo', res.data)
		}).catch(err => {
			console.log("err", err);
			that.globalData.isAuth = false
		})
	},
});