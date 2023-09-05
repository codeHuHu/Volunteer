// pages/mine/mine.js
const app = getApp()
let loading = false;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		openid: null,
		isLogin: false,
		actions: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (event) {
		console.log('app.globalData', app.globalData)
		this.setData({
			openid: app.globalData.openid,
			myPos: app.globalData.position,
			//isLogin: app.globalData.isLogin
		})


		// var value = wx.getStorageSync('user_status');
		// if (value) {
		// 	if (value[0] == app.globalData.openid && value[1] == true) {
		// 		this.setData({
		// 			isLogin: true
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
					app.globalData.isLogin = that.data.actions.isLogin
					wx.setStorageSync('user_status', [res.data[0]._openid, app.globalData.isLogin])
					return true;
				},
				fail(err) {
					that.setData({
						isLogin: false
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
			isLogin: app.globalData.isLogin
		})
		this.getDetail()
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {},

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
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/newActivity/newActivity',
		})
	},
	toNewTeam() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/newTeam/newTeam',
		})
	},
	toSetting() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/setting/setting',
		})
	},
	toMyActivity() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/myActivity/myActivity',
		})
	},
	toMyJoin() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/myJoin/myJoin',
		})
	},

	toCommentActivity() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}

		wx.navigateTo({
			url: '/pages/commentActivity/commentActivity',
		})
	},
	toCheckActivity() {
		wx.navigateTo({
			url: '/pages/checkActivity/checkActivity',
		})
	},
	/**
	 * 轻提示展示
	 * @param {*} status 
	 * @param {*} message 
	 * @param {*} time 
	 * @param {*} fun 
	 */
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
	}
})