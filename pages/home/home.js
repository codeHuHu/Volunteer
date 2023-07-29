// pages/home/home.js
const app = getApp()
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		message: 123,
		actions: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		console.log('fuck', app.globalData)
		var that = this
		wx.setNavigationBarTitle({
			title: '首页',
		})
		//查找活动
		db.collection('ActivityInfo')
			.where({
				status: '1'
			})
			.get()
			.then(res => {
				console.log(res.data)
				that.setData({
					actions: res.data
				})
			})
			.catch(err => {
				console.log(err);
			})
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		console.log('fuck', app.globalData)
		wx.hideHomeButton()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},
	toregister() {
		if (this.Byhistory()) {
			wx.showToast({
				title: '你已注册成为志愿者',
				icon: 'none'
			})
		} else if (this.ByBase()) {}

	},
	Byhistory() {
		var value = wx.getStorageSync('user_status')
		if (value) {
			try {
				console.log(app.globalData)
				for (var i in value) {
					if (value[i][0] == app.globalData.openid && value[i][1] == true) {
						return true
					}
				}
				return false
			} catch (e) {}
		} else {
			return false
		}
	},
	ByBase() {
		wx.cloud.database().collection('UserInfo')
			.where({
				_openid: app.globalData.openid
			})
			.get({
				success(res) {
					console.log(res);
					var n = res.data.length;
					if (n) {
						app.globalData.islogin = true
						wx.setStorageSync('user_status', [
							[res.data[0]._openid, app.globalData.islogin]
						])
						wx.showToast({
							title: '你已注册成为志愿者',
							icon: 'none'
						})
					} else {
						wx.navigateTo({
							url: '/pages/accountSignUp/accountSignUp',
						})
					}
				},
				fail(err) {}
			});
	},
	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	},
	NavChange(e) {
		this.setData({
			PageCur: e.currentTarget.dataset.cur
		})
	},
	toZhiyuanfuwu() {
		wx.reLaunch({
			url: '/pages/volunteerService/volunteerService',
		})
	},
	tomine(event) {
		wx.navigateTo({
			url: '/pages/mine/mine',
		})
	},
	tojointeam() {
		if (this.Byhistory()) {
			wx.navigateTo({
				url: '/pages/jointeam/jointeam',
			})
		} else if (this.ByBase()) {
			
		}
	},

	todetail(e) {
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	},
})