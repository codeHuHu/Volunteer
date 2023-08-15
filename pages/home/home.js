// pages/home/home.js
const app = getApp()
const db = wx.cloud.database()
Page({

	data: {
		actions: [],
		keyword: '',
	},

	onLoad: function () {
		wx.setNavigationBarTitle({
			title: '首页',
		})
		//查找活动
		this.getData()
	},
	//查找活动
	getData() {
		var that = this;
		db.collection('ActivityInfo')
			.where({
				status: '1'
			})
			.get()
			.then(res => {
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

	toregister() {
		if (this.Byhistory()) {
			wx.showToast({
				title: '你已注册成为志愿者',
				icon: 'none'
			})
		} else if (this.ByBase()) { }
	},
	Byhistory() {
		var value = wx.getStorageSync('user_status')
		if (value) {
			try {
				if (value[0] == app.globalData.openid && value[1] == true) {
					return true
				}
				return false
			} catch (e) {

			}
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
					if (res.data.length) {
						app.globalData.islogin = true
						wx.setStorageSync('user_status', [res.data[0]._openid, app.globalData.islogin])
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
				fail(err) {

				}
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
	toGift() {
		wx.showToast({
			title: '加急开发中...',
			icon: 'loading',
			duration: 500,
			mask: true
		})
	},
	toHonor() {
		wx.showToast({
			title: '加急开发中...',
			icon: 'loading',
			duration: 500,
			mask: true
		})
	},
	toNewActivity() {
		if (this.Byhistory()) {
			wx.navigateTo({
				url: '/pages/newActivity/newActivity',
			})
		} else if (this.ByBase()) {

		}
	},
	tomine(event) {
		wx.navigateTo({
			url: '/pages/mine/mine',
		})
	},
	toJoinTeam() {
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