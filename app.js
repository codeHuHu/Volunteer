// app.js
App({
	onLaunch: function () {
		console.log('来啦')
		var that = this
		var openid
		if (!wx.cloud) {
			console.error('请使用 2.2.3 或以上的基础库以使用云能力');
		} else {
			wx.cloud.init({
				// env 参数说明：
				//   env 参数决定接下来小程序发起的云开发调用（wx.cloud.xxx）会默认请求到哪个云环境的资源
				//   此处请填入环境 ID, 环境 ID 可打开云控制台查看
				//   如不填则使用默认环境（第一个创建的环境）
				env: 'volunteer-2ge0hjpsa1879e88',
				traceUser: true,
			})
			if (wx.getStorageSync('openid')) {
				this.globalData.openid = wx.getStorageSync('openid')
			} else {
				wx.cloud.callFunction({
					name: 'getUserOpenid',
					success(res) {
						that.globalData.openid = res.result.openid
						wx.setStorageSync('openid', res.result.openid)
					}
				})
			}

			//openid不为空，获取当前用户的信息
			if (that.globalData.openid) {
				wx.cloud.callFunction({
					name: 'getUserInfo',
					data: {
						openid: that.globalData.openid
					},
					success(res) {
						// console.log(res.result);
						// console.log(res.result.data[0].username);
						that.globalData.Name = res.result.data[0].username;
						that.globalData.phone = res.result.data[0].phone;
						that.globalData.status = res.result.data[0].status;
						that.globalData.Id = res.result.data[0].idnumber;
					},
					fail(err) {
						console.log(err)
					}
				})
			}
			//只查自己的队伍
			wx.cloud.database().collection('TeamInfo')
				.where({
					_openid: that.globalData.openid
				})
				.get({
					success(res) {
						console.log(res)
						console.log(that.globalData.openid)
						var teams = []
						for (var l in res.data) {
							teams[l] = res.data[l].teamName
						}
						that.globalData.team = teams
					}
				})
		}
	},
	onshow: function () {

	},
	Z(num, length = 2) {
		return ("0000000000000000" + num).substr(-length);
	},
	globalData: {
		userinfo: null,
		openid: null,
		Name: '',
		avatar: null,
		islogin: false,
		team: [],
		phone: 0,
		status: 0,
	}
});