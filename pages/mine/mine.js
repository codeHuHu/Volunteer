// pages/mine/mine.js
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		openid: null,
		islogin: '',
		actions: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (event) {
		var value = wx.getStorageSync('user_status');
		if (value) {
			for (var i = 0; i < value.length; i++) {
				if (value[i][0] == app.globalData.openid && value[i][1] == true) {
					this.setData({
						islogin: true
					})

				}
			}
		} else {
			this.setData({
				islogin: false
			})
		}

		console.log(this.data.islogin)
		this.setData({
			openid: app.globalData.openid
		})
		this.getDetail();

	},
	getDetail() {
		var that = this
		wx.cloud.database().collection('UserInfo').where({
				_openid: app.globalData.openid
			})
			.get({
				success(res) {

					console.log(res.data)
					that.setData({
						actions: res.data
					})
				}
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
	onShow() {
		// 隐藏返回按钮
		wx.hideHomeButton()
		wx.stopPullDownRefresh()
		this.onLoad()
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

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	},
	toregister() {
		wx.navigateTo({
			url: '/pages/accountSignUp/accountSignUp',
		})
	},
	toNewActivity() {
		wx.navigateTo({
			url: '/pages/newActivity/newActivity',
		})
	},
	toNewTeam() {
		wx.navigateTo({
			url: '/pages/newTeam/newTeam',
		})
	},
})