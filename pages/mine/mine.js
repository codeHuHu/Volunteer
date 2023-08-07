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
		console.log(app.globalData)
		this.setData({
			openid: app.globalData.openid
		})
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
			//去数据库看看有没有
			this.getDetail()
		}
	},
	getDetail() {
		var that = this
		wx.cloud.database().collection('UserInfo').where({
				_openid: app.globalData.openid
			})
			.get({
				success(res) {
					that.setData({
						actions: res.data[0],
					})
					app.globalData.islogin = that.data.actions.islogin
					wx.setStorageSync('user_status', [
						[res.data[0]._openid, app.globalData.islogin]
					])
					return true;
				},
				fail(err) {
					that.setData({
						islogin: false
					})
					return false;
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
		this.getDetail()
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
	toPersonalSetting() {
		wx.navigateTo({
			url: '/pages/personalSetting/personalSetting',
		})
	},
	toMyActivity()
	{
		wx.navigateTo({
			url: '/pages/myActivity/myActivity',
		})
	},
	toCheckActivity() {
		wx.navigateTo({
			url: '/pages/checkActivity/checkActivity',
		})
	}
})