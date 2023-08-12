// pages/myActivity/myActivity.js
const app = getApp()
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		db.collection('ActivityInfo').where({
			_openid: app.globalData.openid
		}).field({
			_id: true,
			actName: true,
			serviceEstamp: true,
			serviceStamp: true,
			status: true,
			tag: true,
			teamName: true,
			_openid: true
		}).orderBy('serviceStamp', 'desc').get().then(res => {
			this.setData({
				actionList: res.data
			})
			this.setTime(res.data)
		}).catch(err => {
			console.log(err);
		})
		// db.collection('UserInfo').where({
		// 	_openid: app.globalData.openid
		// }).get().then(res => {
		// 	var actions = res.data
		// 	var myActivity = actions[0].myActivity
		// 	console.log(actions)
		// 	db.collection('ActivityInfo').where({
		// 		_id: db.command.in(myActivity)
		// 	}).field({
		// 		_id: true,
		// 		actName: true,
		// 		serviceEstamp: true,
		// 		serviceStamp: true,
		// 		status: true,
		// 		tag: true,
		// 		teamName: true,
		// 		_openid: true
		// 	}).orderBy('serviceStamp', 'desc').get().then(res => {
		// 		this.setData({
		// 			actionList: res.data
		// 		})
		// 		this.setTime(res.data)
		// 	}).catch(err => {
		// 		console.log(err);
		// 	})
		// })
	},

	setTime(result) {
		var res = result
		console.log(res)
		var dataArr = []
		for (var l in res) {
			const date = new Date(res[l].serviceStamp);
			const year = date.getFullYear();
			const month = date.getMonth() + 1; // 月份需要加1
			const day = date.getDate();

			const formattedDate = `${year}-${month}-${day}`;
			dataArr.push(formattedDate)
			//console.log(formattedDate)
		}
		this.setData({
			data_Arr: dataArr
		})
		wx.stopPullDownRefresh()

			.catch(console.error)
	},
	toDetail(e) {
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	}


})