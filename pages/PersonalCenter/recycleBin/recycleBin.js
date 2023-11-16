// pages/RecycleBin/RecycleBin.js
const db = wx.cloud.database()
const app = getApp()
Page({
	data: {},
	onLoad: function (event) {
		wx.setNavigationBarTitle({
			title: '回收站',
		})
		const currentDate = new Date();
		const timestamp = currentDate.getTime();
		this.setData({
			timestamp: timestamp,
			currentDate: currentDate
		})
		this.getStatus()
	},
	getStatus() {
		var that = this;

		const collection = db.collection('ActivityInfo');
		collection.where({
			status: '-1'
		}).field({
			_id: true,
			actName: true,
			serviceEndStamp: true,
			serviceStartStamp: true,
			status: true,
			tag: true,
			teamName: true,
			_openid: true
		})
			.limit(20)
			.orderBy('serviceStamp', 'desc')
			.get()
			.then(res => {
				var actions = res.data;
				that.setData({
					actionList: actions,
				});
				this.setTime(res.data)
				return Promise.resolve(); // 返回一个 resolved 状态的 Promise 对象
			});
	},
	setTime(result) {
		var res = result
		var dataArr = []
		var t
		for (var l in res) {
			t = new Date(res[l].serviceStamp)
			dataArr.push(`${t.getFullYear()}-${utils.Z(t.getMonth() + 1)}-${utils.Z(t.getDate())}`)
		}
		this.setData({
			data_Arr: dataArr
		})
		wx.stopPullDownRefresh()
	},
	navTo(e) {
		wx.$navTo(e)
	},
})