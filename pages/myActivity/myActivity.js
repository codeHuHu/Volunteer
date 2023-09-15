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
		this.data.mode = options.mode
		if (options.mode == 'comment') {
			db.collection('ActivityInfo').where({
				_openid: app.globalData.openid,
				status: '2',
				isFeedback: db.command.neq(1)
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
		} else {
			db.collection('ActivityInfo').where({
				_openid: app.globalData.openid,
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
		}

	},
	onShow() {
		console.log('myAct onShow')
	},
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
	toDetail(e) {
		if (this.data.mode == 'comment') {
			//获取上一个页面的操作权限
			let pages = getCurrentPages()
			let prevPage = pages[pages.length - 2]
			prevPage.setData({
				activityId: e.currentTarget.dataset.id
			})
			wx.navigateBack({})
			return
		}
		wx.navigateTo({
			url: '/pages/activityDetail/activityDetail?id=' + e.currentTarget.dataset.id,
		})
	}
})