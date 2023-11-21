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
	onshow: function () {

	},
	getAuthStatus() {
		let that = this
		wx.cloud.callFunction({
			name: 'getUserOpenid',
			success(res) {
				console.log('从云函数获取openid', res.result.openid)
				//本地存储openid
				wx.setStorageSync('openid', res.result.openid)
				wx.cloud.callFunction({
					name: 'getUserInfo',
					data: {
						openid: res.result.openid
					},
					success(res) {
						console.log('获取成功')
						if (res.result.data.length == 1) {
							console.log('用户信息获取到了,配置globalData')
							//这个用于正常使用小程序的用户验证
							that.globalData.isAuth = true
							that.globalData.userInfo = res.result.data[0]
							try {
								wx.setStorageSync('userInfo', res.result.data[0]);
							} catch (e) {
								console.log('app配置storage:userInfo错误', e);
							}
							console.log(that.globalData)
						} else {
							console.log('用户还没注册,获得不到信息')
							try {
								wx.setStorageSync('userInfo', null);
							} catch (e) {
								console.log('app配置storage:userInfo错误', e);
							}
						}
					},
					fail(err) {
						console.log(err)
					}
				})
			}
		})

	},


});