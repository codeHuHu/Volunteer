App({
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
			//从storage获取openid
			var tmp = wx.getStorageSync('openid')
			if (tmp) {
				console.log('从storage获取openid:')
				this.globalData.openid = tmp
			} else {
				//从云函数获取openid
				wx.cloud.callFunction({
					name: 'getUserOpenid',
					success(res) {
						console.log('从云函数获取openid', res.result.openid)
						wx.cloud.callFunction({
							name: 'getUserInfo',
							data: {
								openid: res.result.openid
							},
							success(res) {
								console.log('openid不为空,获取当前用户的信息', res)

								if (res.result.data.length) {
									console.log('用户注册信息获取到了,正在配置globalData')
									that.globalData.name = res.result.data[0].userName;
									that.globalData.phone = res.result.data[0].phone;
									that.globalData.position = res.result.data[0].position;
									that.globalData.Id = res.result.data[0].idnumber;
									that.globalData.aliPay = res.result.data[0].aliPay;
									that.globalData.school = res.result.data[0].school;
									that.globalData.grade = res.result.data[0].grade;
									that.globalData.college = res.result.data[0].college;
									that.globalData.year = res.result.data[0].year;

									that.globalData.islogin = res.result.data[0].islogin;
									try {
										wx.setStorageSync('user_status', [that.globalData.openid, that.globalData.islogin]);
									} catch (e) {
										console.log('app配置storage:status错误', e);
									}
								} else {
									console.log('用户还没注册,获得不到信息')
								}
							},
							fail(err) {
								console.log(err)
							}
						})
						that.globalData.openid = res.result.openid
						wx.setStorageSync('openid', res.result.openid)
					}
				})
			}
			//openid不为空，获取当前用户的信息
			if (tmp) {
				wx.cloud.callFunction({
					name: 'getUserInfo',
					data: {
						openid: tmp
					},
					success(res) {

						console.log('openid不为空,获取当前用户的信息', res)

						if (res.result.data.length) {
							console.log('用户注册信息获取到了,正在配置globalData')
							that.globalData.name = res.result.data[0].userName;
							that.globalData.phone = res.result.data[0].phone;
							that.globalData.position = res.result.data[0].position;
							that.globalData.id = res.result.data[0].idNumber;
							that.globalData.aliPay = res.result.data[0].aliPay;
							that.globalData.school = res.result.data[0].school;
							that.globalData.grade = res.result.data[0].grade;
							that.globalData.college = res.result.data[0].college;
							that.globalData.year = res.result.data[0].year;

							that.globalData.isLogin = res.result.data[0].isLogin;
							try {
								wx.setStorageSync('user_status', [that.globalData.openid, that.globalData.isLogin]);
							} catch (e) {
								console.log('app配置storage:status错误', e);
							}
						} else {
							console.log('用户还没注册,获得不到信息')
						}

					},
					fail(err) {
						console.log(err)
					}
				})
			}
			setTimeout(() => {
				wx.hideLoading()
			}, 1000)
		}
	},
	onshow: function () {

	},

	globalData: {
		openid: null,
		name: '',
		isLogin: false,
		phone: 0,
		aliPay: '',
		school: '',
		grade: '',
		year: '',
		college: '',
		position: '',	//pos为0表示普通志愿者，1表示队长，2表示管理员
	}
});