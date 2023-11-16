// pages/checkActivity/checkActivity.js
const db = wx.cloud.database()
const app = getApp()
var utils = require("../../../utils/date.js")
let loading = false;

Page({
	data: {

	},
	async onLoad(event) {
		wx.setNavigationBarTitle({
			title: '审核发布',
		})
		const currentDate = new Date();
		const timeStamp = currentDate.getTime();
		this.setData({
			timeStamp,
			currentDate
		})
		//生成两个actionsList
		await this.getList('0');
		await this.getList('-1');
	},
	async getList(e) {
		var that = this;
		const collection = db.collection('ActivityInfo');
		const res = await collection.where({
			status: e == '0' ? '0' : db.command.in(['-1', '-2'])
		}).field({
			_id: true,
			actName: true,
			serviceEndStamp: true,
			serviceStartStamp: true,
			deadTimeStamp: true,
			status: true,
			tag: true,
			teamName: true,
			_openid: true,
			isPintuan: true,
		})
			.limit(20)
			.orderBy('serviceStamp', 'desc')
			.get();

		var actions = res.data;
		if (e == '0') {
			that.setData({
				actionList: actions,
			});
		} else {
			that.setData({
				binActionList: actions,
			});
		}
		this.setTime(res.data)

	},
	async setTime(result) {
		var res = result
		var dataArr = []
		let status = ''
		var t
		for (var l in res) {
			t = new Date(res[l].deadTimeStamp)
			dataArr.push(`${t.getFullYear()}-${utils.Z(t.getMonth() + 1)}-${utils.Z(t.getDate())}`)
			//console.log(formattedDate)
			status = res[l].status
		}
		if (status == '0') {
			this.setData({
				toCheck_Arr: dataArr
			})
			try {
				wx.stopPullDownRefresh()
			} catch (error) {
				console.error(error);
			}
		}
		else {
			this.setData({
				Reject_Arr: dataArr
			})
			try {
				wx.stopPullDownRefresh()
			} catch (error) {
				console.error(error);
			}
		}
	},
	Agree(e) {
		var that = this
		wx.showModal({
			title: '确认',
			content: '是否确定发布？',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
					const id = e.currentTarget.dataset.id
					const collection = db.collection('ActivityInfo');
					collection.doc(id).update({
						data: {
							status: '1'
						}
					}).then(res => {
						console.log(res)
						that.setShow("success", "发布成功")
						that.onLoad()
					}
					)
				} else if (res.cancel) {

				}
			}
		})
	},
	Reject(e) {
		var that = this
		wx.showModal({
			title: '确认',
			content: '是否拒绝发布',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
					const id = e.currentTarget.dataset.id
					const collection = db.collection('ActivityInfo');
					collection.doc(id).update({
						data: {
							status: '-1'	//-1表示活动不被通过发布
						}
					}).then(res => {
						console.log(res)
						that.setShow("error", "已移入回收站")
						that.onLoad()
					}
					)
				} else if (res.cancel) {

				}
			}
		})
	},
	showModal(e) {
		this.setData({
			modalName: e.currentTarget.dataset.target
		})
	},
	hideModal(e) {
		this.setData({
			modalName: null
		})
	},
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
	tabSelect(e) {
		console.log(e);
		this.setData({
			TabCur: e.currentTarget.dataset.id,
			scrollLeft: (e.currentTarget.dataset.id - 1) * 60
		})
	},
	navTo(e) {
		wx.$navTo(e)
	},
})