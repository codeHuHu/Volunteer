// pages/home/home.js
const app = getApp()
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		message: 123,
		actions: [],
		keyword: '',
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		wx.setNavigationBarTitle({
			title: '首页',
		})
		this.getData()
	},
	//查找活动
	getData() {
		var that = this;
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
	togift() {
		wx.showToast({
			title: '加急开发中...',
			icon: 'loading',
			duration:1000,
			mask:true

		})
	},
	tohonor() {
		wx.showToast({
			title: '加急开发中...',
			icon: 'loading',
			duration:1000,
			mask:true

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

	toDetail(e) {
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	},
	searchIcon(e) {
		this.setData({
			keyword: e.detail.value
		})
	},
	searchActivity() {
		var that = this
		//搜索栏不为空
		if (this.data.keyword) {
			wx.showLoading({
				title: '搜索中...',
				mask: true
			})
			wx.cloud.callFunction({
					name: 'searchTeam',
					data: {
						collection: 'ActivityInfo',
						keyword: this.data.keyword,
						name: 'actName'
					}
				})
				.then(res => {
					console.log(res.result)
					that.setData({
						actions: res.result
					})
					wx.hideLoading()
				})

		} else {
			this.getData();
		}

	}
})