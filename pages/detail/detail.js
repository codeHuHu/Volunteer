// pages/datail/detail.js
// 目前只在活动中记录到志愿者,而未在志愿者中记录活动,之后再完善
const app = getApp()
let loading = false;
const db = wx.cloud.database()
Page({

	data: {
		hours: '',
		minutes: '',
		//志愿者是否参加了此次志愿
		ifJoin: 0,
		//志愿者是否在组织志愿的队伍中
		ifInTeam:0
	},

	onLoad: function (options) {
		var that = this
		that.data.id = options.id
		wx.cloud.database().collection('ActivityInfo').doc(that.data.id).get({
			success(res) {
				var startTime = res.data.serviceSTime
				var endTime = res.data.serviceETime
				var startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
				var endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
				// 计算时间差（以分钟为单位）
				var duration = endMinutes - startMinutes;
				// 将时间差转换为小时和分钟
				var hours = Math.floor(duration / 60);
				var minutes = duration % 60;

				that.setData({
					actions: res.data,
					hours,
					minutes,
				})
				// 如果名单里有该志愿者,改变报名按钮状态
				for (var i in res.data.joinMembers) {
					if (res.data.joinMembers[i] == app.globalData.openid)
						that.setData({
							ifJoin: 1
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

	onShareAppMessage() {

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
	ifAvailableAndJoin() {
		//先更新一下,查看是否满人了
		db.collection('ActivityInfo').doc(this.data.id)
			.get()
			.then(res => {
				this.setData({
					actions: res.data
				})
				//如果没满人,就去新增人数
				if (this.data.actions.inJoin < this.data.actions.inNum) {
					wx.cloud.callFunction({
							name: 'updateJoinActivity',
							data: {
								collectionName: 'ActivityInfo',
								docName: this.data.id,
								//操作变量
								inJoinAdd: 1,
							}
						})
						.then(res => {
							//console.log(res)
							//更改按钮状态
							this.setData({
								ifJoin: 1
							})
							this.setShow("success", "报名成功");
							//(非云函数)修改完毕,再次获取数据库
							db.collection('ActivityInfo').doc(this.data.id)
								.get()
								.then(res => {
									this.setData({
										actions: res.data
									})
								})
						})
				} else {
					//提示满人了
					this.setShow("error", "人数已满");
				}
			})
	},
	unJoin() {
		//(非云函数)先获取数据库
		db.collection('ActivityInfo').doc(this.data.id)
			.get()
			.then(res => {
				this.setData({
					actions: res.data
				})
				// 比较安全地在名单中清除该志愿者
				var tmpList = this.data.actions.joinMembers
				var result = []
				var j = 0
				for (var i in tmpList) {
					if (tmpList[i] == app.globalData.openid) {
						continue
					}
					result[j++] = tmpList[i]
				}
				//加入一个错误判断
				if (this.data.actions.inNum < 0 || this.data.actions.inNum < 0) {
					this.setShow("error", "系统异常");
					return
				}
				//(云函数)人数自减1,赋值新的名单
				wx.cloud.callFunction({
						name: 'updateJoinActivity',
						data: {
							collectionName: 'ActivityInfo',
							docName: this.data.id,
							//操作变量
							inJoinAdd: j-i-1,//根据上面i和j的差来决定要减少多少
							newJoinMembers: result
						}
					})
					.then(res => {
						//更改按钮状态
						this.setData({
							ifJoin: 0
						})
						this.setShow("success", "取消成功");
						//(非云函数)修改完毕,再次获取数据库
						db.collection('ActivityInfo').doc(this.data.id)
							.get()
							.then(res => {
								this.setData({
									actions: res.data
								})
							})
					})
			})
	},
	showModal(e) {
		var tmp = e.currentTarget.dataset.target
		//报名窗口
		if (tmp == 'Image') {
			//先判断是否满人
			if (this.data.actions.inJoin >= this.data.actions.inNum) {
				//提示满人了
				this.setShow("error", "人数已满");
				return
			}
		}
		this.setData({
			modalName: tmp
		})
	},
	hideModal(e) {
		var a = e.currentTarget.dataset.target
		if (a == 'join') {
			this.setData({
				ifJoin: 1
			})
			this.ifAvailableAndJoin()
		} else if (a == 'unjoin') {
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
		wx.previewImage({
			urls: ['/images/青协头像.png'],
		})
	}
})