const app = getApp()
let loading = false;
const db = wx.cloud.database()

Page({
	data: {
		checkMode:0,
		hours: '',
		minutes: '',
		deadTime: '',
		serviceTime: '',
		actions: []

	},
	onLoad: function (options) {
		console.log('app.globalData:', app.globalData)
		this.data.isLogin = app.globalData.isLogin
		this.data.id = options.id
		var that = this
		//判断是否为审核页面
		if(options.check){
			this.setData({
				checkMode : 1
			})
		}
		//判断是否为从转发进来的
		if (options.actions) {
			console.log('从转发进来的')
			let info = JSON.parse(decodeURIComponent(options.actions))
			this.data.actions = info
			var tmp = wx.getStorageSync('user_status')
			if (tmp) {
				console.log('从本地读取是否已注册', tmp)
				this.data.isLogin = tmp[1]
			}
		}
		db.collection('ActivityInfo').doc(options.id).get({
			success(res) {
				var t = res.data
				// 时间戳的转换
				that.adjustTimeStamp(t);
				// 活动对于用户的状态转换
				that.adjustStatus(t);
				//开启监听(传入该页面的id)
				that.watcher(options.id);
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
		wx.stopPullDownRefresh()
	},

	onReachBottom() {

	},
	watcher(id) {
		console.log('开启监听')
		var that = this
		db.collection('ActivityInfo')
			.doc(id)
			.watch({
				onChange: function (snapShot) {
					that.adjustStatus(snapShot.docs[0])
					that.setData({
						actions: snapShot.docs[0]
					})
				},
				onError: function (err) {
					console.error('the watch closed because of error', err)
				}
			})
	},
	adjustTimeStamp(res) {
		//app.Z()函数在app.js,作用是固定长度补零
		//报名截止时间	报名截止日期
		let t = new Date(res.deadTimeStamp);
		const formattedTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		const formattedDate = `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`;
		//活动日期 服务开始时间 服务结束时间
		t = new Date(res.serviceStartStamp);
		const serviceDate = `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`;
		const serviceStartTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		t = new Date(res.serviceEndStamp);
		const serviceEndTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		//服务时长
		t = res.serviceEndStamp - res.serviceStartStamp
		const thours = Math.floor(t / (1000 * 60 * 60));
		const tminutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));
		this.setData({
			actions: res,
			deadTime: formattedDate + ' ' + formattedTime,
			serviceTime: serviceDate + ' ' + serviceStartTime + '-' + serviceEndTime,
			hours: thours,
			minutes: tminutes,
			isEnd: res.deadTimeStamp - new Date().getTime() <= 0 ? 1 : 0,
			isPintuan: res.isPintuan
		})
	},
	adjustStatus(res) {
		//检测活动的报名成功状态
		this.setData({
			isFull: (res.outJoin == res.outNum) ? 1 : 0
		})
		if (res.joinMembers) {
			var flag = 0
			// 如果名单里有该志愿者,改变报名按钮状态
			for (var i in res.joinMembers) {
				if (res.joinMembers[i] == app.globalData.openid) {
					flag = 1
					break
				}
			}
			this.setData({
				isJoin: flag,
			})
		} else {
			this.setData({
				isJoin: 0
			})
		}
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
				if (that.data.actions.outJoin >= that.data.actions.outNum) {
					that.setShow("error", "人数已满");
					return
				}

				//如果没满人,就去新增人数
				wx.cloud.callFunction({
					name: 'updateJoinActivity',
					data: {
						collectionName: 'ActivityInfo',
						docName: that.data.id,
						//操作变量
						outJoinAdd: 1,
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
						that.setShow("success", `成功参与${this.data.actions.ispintuan ? '拼团' : '报名'}`);
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
				if (res.data.outNum < 0) {
					this.setShow("error", "系统异常");
					return
				}
				if (res.data.outNum < res.data.outJoin) {
					this.setShow("error", "系统异常");
					return
				}
				//(云函数)人数自减1,赋值新的名单
				wx.cloud.callFunction({
					name: 'updateJoinActivity',
					data: {
						collectionName: 'ActivityInfo',
						docName: that.data.id,
						//操作变量
						outJoinAdd: -1,
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
							}
						})
					})
			})
	},
	showModal(e) {
		var tmp = e.currentTarget.dataset.target
		console.log(tmp)
		if (e.currentTarget.dataset.target == 'None') {
			//无操作
			return
		}
		if (!this.data.isLogin) {
			this.setShow("error", "您尚未注册");
			return
		}
		if (tmp == 'toJoin') {
			//报名窗口
			//先判断是否满人
			if (this.data.actions.outJoin >= this.data.actions.outNum) {
				this.setShow("error", "人数已满");
				return
			}

		} else if (tmp == 'toPintuan') {
			wx.showLoading()
			//拼团
			//先判断是否满人
			if (this.data.actions.outJoin >= this.data.actions.outNum) {
				this.setShow("error", "人数已满");
				wx.hideLoading()
				return
			}
			this.setData({
				isJoin: 1
			})
			this.Join()
			return
		} else if (tmp == 'toGroup') {
			if (!this.data.isJoin) {
				this.setShow("error", "你尚未参与此活动");
				return
			}
		}
		this.setData({
			modalName: tmp
		})
	},
	hideModal(e) {
		var a = e.currentTarget.dataset.target
		console.log(a)
		if (a == 'join') {
			wx.showLoading()
			this.setData({
				isJoin: 1
			})
			this.Join()
		} else if (a == 'unjoin') {
			wx.showLoading()
			this.setData({
				isJoin: 0
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
		var tmp = []
		if(e.currentTarget.dataset.url=="0"){
			tmp =  this.data.actions.qr_code
		}else if(e.currentTarget.dataset.url=="1"){
			tmp =  this.data.actions.iZhiYuan
		}
		wx.previewImage({
			urls: tmp,
			current: e.currentTarget.dataset.index
		})
	},
	//转发朋友
	onShareAppMessage(event) {
		console.log('shareApp', this.data.actions.actName)
		return {
			title: this.data.actions.actName,
			//imageUrl: this.data.actions.images[0],
			path: 'pages/detail/detail?id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
		}
	},
	//转发朋友圈
	onShareTimeline(event) {
		console.log('shareTimeLine', this.data.actions.actName)
		return {
			title: this.data.actions.actName + '~快来一起参加吧!',
			query: 'id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
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