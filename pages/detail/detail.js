const app = getApp()
let loading = false;
const db = wx.cloud.database()

Page({
	data: {
		//志愿者是否参加了此次志愿
		//ifJoin: 0,
		//志愿者是否在组织志愿的队伍中
		//ifInTeam: 0,
		//该活动是否截止报名
		//ifEnd: 0,
		hours: '',
		minutes: '',

		deadtime: '',
		serviceTime: '',
		actions: []

	},
	onLoad: function (options) {
		var that = this
		that.data.id = options.id
		db.collection('ActivityInfo').doc(that.data.id).get({
			success(res) {
				// 时间戳的转换
				that.adjustTimeStamp(res)

				//检测活动的报名成功状态
				let t = res.data
				if (t.inJoin == t.inNum && t.outJoin == t.outNum) {
					that.setData({
						ifFull: 1
					})
				}

				// 如果名单里有该志愿者,改变报名按钮状态
				for (var i in t.joinMembers) {
					if (t.joinMembers[i] == app.globalData.openid) {
						that.setData({
							ifJoin: 1,
						})
						break
					}
				}
				//如果在此小队里(看以后能不能改进一下)
				if (t.teamName) {
					db.collection('TeamInfo')
						.where({
							teamName: t.teamName
						})
						.get()
						.then(Response => {
							var teamMembers = Response.data[0]['teamMembers']
							for (var i in teamMembers) {
								if (teamMembers[i].openid == app.globalData.openid) {
									that.setData({
										ifInTeam: 1
									})
									break
								}
							}
						})
				}
			}
		})
	},

	onReady() {

	},

	onShow() {

	},

	onHide() {

	},

	onUnload() {

	},

	onPullDownRefresh() {

	},

	onReachBottom() {

	},
	adjustTimeStamp(res) {
		//app.Z()函数在app.js,作用是固定长度补零
		//报名截止时间	报名截止日期
		let t = new Date(res.data.deadtimestamp);
		const formattedTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		const formattedDate = `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`;
		//活动日期 服务开始时间 服务结束时间
		t = new Date(res.data.serviceStamp);
		const serviceDate = `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`;
		const serviceSTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		t = new Date(res.data.serviceEstamp);
		const serviceETime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		//服务时长
		t = res.data.serviceEstamp - res.data.serviceStamp
		const thours = Math.floor(t / (1000 * 60 * 60));
		const tminutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
		this.setData({
			actions: res.data,
			deadTime: formattedDate + ' ' + formattedTime,
			serviceTime: serviceDate + ' ' + serviceSTime + '-' + serviceETime,
			hours: thours,
			minutes: tminutes,
			ifEnd: res.data.deadtimestamp - new Date().getTime() <= 0 ? 1 : 0,
			isPintuan: res.data.ispintuan
		})
	},
	Join() {
		var that = this
		//先更新一下,查看是否满人了
		db.collection('ActivityInfo').doc(that.data.id)
			.get()
			.then(res => {
				that.setData({
					actions: res.data,
				})
				var ifInTeam = that.data.ifInTeam
				//在队里
				if (ifInTeam) {
					if (that.data.actions.inJoin >= that.data.actions.inNum) {
						that.setShow("error", "人数已满");
						return
					}
				} else {
					if (that.data.actions.outJoin >= that.data.actions.outNum) {
						that.setShow("error", "人数已满");
						return
					}
				}
				//如果没满人,就去新增人数
				wx.cloud.callFunction({
						name: 'updateJoinActivity',
						data: {
							collectionName: 'ActivityInfo',
							docName: that.data.id,
							//操作变量
							inJoinAdd: ifInTeam ? 1 : 0,
							outJoinAdd: ifInTeam ? 0 : 1,
						}
					})
					.then(res => {
						//更改按钮状态
						that.setData({
							ifJoin: 1
						})
						//将该活动id加入到userInfo
						db.collection('UserInfo').where({
							_openid: app.globalData.openid,
							//myActivity: db.command.not(db.command.elemMatch(db.command.eq(that.data.id)))
						}).update({
							data: {
								myActivity: db.command.push(that.data.id)
							}
						})
						wx.hideLoading()
						that.setShow("success", `成功参与${this.data.actions.ispintuan?'拼团':'报名'}`);
						//修改完毕,再次获取数据库
						db.collection('ActivityInfo').doc(that.data.id)
							.get()
							.then(res => {
								that.setData({
									actions: res.data
								})
								//检测活动的报名成功状态
								let t = res.data
								if (t.inJoin == t.inNum && t.outJoin == t.outNum) {
									that.setData({
										ifFull: 1
									})
								}
							})
					})
			})
	},
	unJoin() {
		var that = this
		//(非云函数)先获取数据库
		db.collection('ActivityInfo').doc(this.data.id)
			.get()
			.then(res => {
				this.setData({
					actions: res.data
				})
				// 比较安全地在名单中清除该志愿者
				var tmpList = res.data.joinMembers
				var result = []
				for (var i in tmpList) {
					if (tmpList[i] != app.globalData.openid) {
						result.push(tmpList[i])
					}

				}
				//加入两个错误判断
				if (res.data.inNum < 0 || res.data.outNum < 0) {
					this.setShow("error", "系统异常");
					return
				}
				if (res.data.inNum < res.data.inJoin || res.data.outNum < res.data.outJoin) {
					this.setShow("error", "系统异常");
					return
				}
				//(云函数)人数自减1,赋值新的名单
				var ifInTeam = that.data.ifInTeam
				wx.cloud.callFunction({
						name: 'updateJoinActivity',
						data: {
							collectionName: 'ActivityInfo',
							docName: that.data.id,
							//操作变量
							//根据上面i和j的差来决定要减少多少
							inJoinAdd: ifInTeam ? -1 : 0,
							outJoinAdd: ifInTeam ? 0 : -1,
							newJoinMembers: result
						}
					})
					.then(res => {
						//更改按钮状态
						that.setData({
							ifJoin: 0
						})

						//在userInfo中删除此活动id

						db.collection('UserInfo').where({
							_openid: app.globalData.openid
						}).get({
							success(res) {
								var myActivityList = []
								var myActivity = res.data[0].myActivity
								for (var l in myActivity) {
									if (myActivity[l] != that.data.id) {
										myActivityList.push(myActivity[l])
									}
								}
								db.collection('UserInfo')
									.where({
										_openid: app.globalData.openid
									}).update({
										data: {
											myActivity: myActivityList
										}
									})
									.then(res => {
										wx.hideLoading()
										that.setShow("success", "取消成功");
									})

								//(非云函数)修改完毕,再次获取数据库
								db.collection('ActivityInfo').doc(that.data.id)
									.get()
									.then(res => {
										that.setData({
											actions: res.data
										})
									})
							}
						})
					})
			})
	},
	showModal(e) {
		var tmp = e.currentTarget.dataset.target
		//报名窗口
		if (tmp == 'toJoin') {
			//先判断是否满人
			//在队里
			if (this.data.ifInTeam) {
				if (this.data.actions.inJoin >= this.data.actions.inNum) {
					this.setShow("error", "人数已满");
					return
				}
			} else {
				if (this.data.actions.outJoin >= this.data.actions.outNum) {
					this.setShow("error", "人数已满");
					return
				}
			}
		} else if (tmp == 'toPintuan') {
			wx.showLoading()
			//先判断是否满人
			//在队里
			if (this.data.ifInTeam) {
				if (this.data.actions.inJoin >= this.data.actions.inNum) {
					this.setShow("error", "人数已满");
					return
				}
			} else {
				if (this.data.actions.outJoin >= this.data.actions.outNum) {
					this.setShow("error", "人数已满");
					return
				}
			}
			this.setData({
				ifJoin: 1
			})
			this.Join()
			return
		}
		this.setData({
			modalName: tmp
		})
	},
	hideModal(e) {
		var a = e.currentTarget.dataset.target
		if (a == 'join') {
			wx.showLoading()
			this.setData({
				ifJoin: 1
			})
			this.Join()
		} else if (a == 'unjoin') {
			wx.showLoading()
			this.setData({
				ifJoin: 0
			})
			this.unJoin()
		}
		this.setData({
			modalName: null
		})
	},
	toggle(e) {
		var anmiaton = e.currentTarget.dataset.class;
		var that = this;
		that.setData({
			animation: anmiaton
		})
		setTimeout(function () {
			that.setData({
				animation: ''
			})
		}, 1000)
	},
	previewImage(e) {
		console.log(e)
		wx.previewImage({
			urls: this.data.actions.qr_code ? this.data.actions.qr_code : ['/images/私密.png'],
			current: e.currentTarget.dataset.index
		})
	},
	onShareAppMessage(event) {
		console.log(event)
		return {
			title: 'Volunteer',
			//imageUrl: this.data.actions.images[0],
			path: 'pages/detail/detail?id=' + this.data.id
		}
	},

	/**
	 * 轻提示展示
	 * @param {*} status 
	 * @param {*} message 
	 * @param {*} time 
	 * @param {*} fun 
	 */
	setShow(status, message, time = 2000, fun = false) {
		if (loading) {
			return
		}
		loading = true;
		try {
			this.setData({
				status,
				message,
				time,
				show: true,
			})
			setTimeout(() => {
				this.setData({
					show: false,
				})
				loading = false;
				// 触发回调函数
				if (fun) {
					this.end()
				}
			}, time)
		} catch {
			loading = false;
		}
	},
})