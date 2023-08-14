// pages/mine/mine.js
const app = getApp()
let loading = false;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		openid: null,
		islogin: false,
		actions: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (event) {
		console.log('app.globalData', app.globalData)
		this.setData({
			openid: app.globalData.openid,
			myPos : app.globalData.pos
		})
			islogin: app.globalData.islogin
		
		// var value = wx.getStorageSync('user_status');
		// if (value) {
		// 	if (value[0] == app.globalData.openid && value[1] == true) {
		// 		this.setData({
		// 			islogin: true
		// 		})
		// 	}
		// } else {
		// 	//去数据库看看有没有
		// 	this.getDetail()
		// }

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
					wx.setStorageSync('user_status', [res.data[0]._openid, app.globalData.islogin])
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
		console.log('app.globalData', app.globalData)
		this.setData({
			openid: app.globalData.openid,
			islogin: app.globalData.islogin
		})
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
		if (!this.data.islogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/newActivity/newActivity',
		})
	},
	toNewTeam() {
		if (!this.data.islogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/newTeam/newTeam',
		})
	},
	toPersonalSetting() {
		if (!this.data.islogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/personalSetting/personalSetting',
		})
	},
	toMyActivity() {
		if (!this.data.islogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/myActivity/myActivity',
		})
	},
	toMyJoin() {
		if (!this.data.islogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/myJoin/myJoin',
		})
	},

	toCommentActivity() {
		if (!this.data.islogin) {
			this.setShow("error", "未注册");
			return 0
		}

		wx.navigateTo({
			url: '/pages/CommentActivity/CommentActivity',
		})
	},
	toCheckActivity()
	{

	}
	, setShow(status, message, time = 500, fun = false) {
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
})