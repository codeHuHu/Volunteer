// pages/myJoin/myJoin.js
const app = getApp()
const db = wx.cloud.database()
Page({
	data: {},
	onLoad(options) {
		db.collection('UserInfo').where({
			_openid: app.globalData.openid
		}).get().then(res => {
			var actions = res.data
			var myActivity = actions[0].myActivity
			console.log(actions)
			db.collection('ActivityInfo').where({
				_id: db.command.in(myActivity),
				status:db.command.not(db.command.eq('-2'))
			}).field({
				_id: true,
				actName: true,
				serviceEndStamp: true,
				serviceStartStamp: true,
				status: true,
				tag: true,
				teamName: true,
				_openid: true
			}).orderBy('serviceStartStamp', 'desc').get().then(res => {
				this.setData({
					actionList: res.data
				})
				this.setTime(res.data)
			}).catch(err => {
				console.log(err);
			})
		})
	},
	onReady() {},
	onShow() {},
	setTime(result) {
		var res = result
		console.log(res)
		var dataArr = []
		for (var l in res) {
			const date = new Date(res[l].serviceStartStamp);
			const year = date.getFullYear();
			const month = date.getMonth() + 1; // 月份需要加1
			const day = date.getDate();

			const formattedDate = `${year}-${month}-${day}`;
			dataArr.push(formattedDate)
		}
		this.setData({
			data_Arr: dataArr
		})
		wx.stopPullDownRefresh()
	},
	navTo(e){
		wx.$navTo(e)
	}
})