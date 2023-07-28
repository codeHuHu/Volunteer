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
		var that = this
		wx.setNavigationBarTitle({
			title: '首页',
		})
		db.collection('ActivityInfo').where({
			status: '1'
		}).get().then(res => {
			console.log(res.data)
			that.setData({
				actions: res.data
			})
		}).catch(err => {
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
		} else if (this.ByBase() != 0) {
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
	Byhistory() {
		var value = wx.getStorageSync('user_status')
		if (value) {
			try {
				for (var i = 0; i < value.length; i++) {
					if (value[i][0] == app.globalData.openid && value[i][1] == true) {
						// wx.showToast({
						// 	title: '你已注册成为志愿者',
						// 	icon: 'none'
						return true
					}
				}
			} catch (e) {

			}
		} else {
			return false
		}
	},
	ByBase() {
		var that = this
		wx.cloud.database().collection('UserInfo').where({
				_openid: app.globalData.openid
			})
			.get({
				success(res) {
					return res.data.length
				},
				fail(err) {

				}
			})
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
		} else if (this.ByBase() != 0) {
			wx.navigateTo({
				url: '/pages/jointeam/jointeam',
			})
		} else {
			wx.showToast({
				title: '请前往注册',
				icon: 'none'
			})
		}
	},

	todetail(e) {
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	}

})