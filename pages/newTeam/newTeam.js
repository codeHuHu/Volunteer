const db = wx.cloud.database()
const app = getApp()
// pages/newTeam/newTeam.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		adminAccount: '',
		adminPassword: '',
		ifAdmin: false,
		picker: ['类型1', '类型2', '类型3', '类型4'],
		teamName: '',
		teamCategory: '',
		leaderName: '',
		leaderId: '',
		leaderPhone: '',
		mail: '',
		region: ['广东省', '广州市', '番禺区'],
		teamIntro: '',
		reason: '',
		ischeck: false,
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

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
    let a = wx.getStorageSync('adminAccount')
    let b = wx.getStorageSync('adminPassword')
    this.setData({
      adminAccount: a,
      adminPassword: b
		})
		console.log(app.globalData.team)
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
	getAdminAccount(e) {
		this.setData({
			adminAccount: e.detail.value
		})
	},
	getAdminPassword(e) {
		this.setData({
			adminPassword: e.detail.value
		})
	},
	adminLogin() {
		if (this.data.adminAccount == '123456' && this.data.adminPassword == '123456') {
			this.setData({
				ifAdmin: true
			})
			wx.setStorageSync('adminAccount', this.data.adminAccount)
			wx.setStorageSync('adminPassword', this.data.adminPassword)
		} else {
			wx.showToast({
				title: '验证错误',
			})
		}
	},
	getTeamName(e) {
		this.setData({
			teamName: e.detail.value
		})
	},
	getCaptainName(e) {
		this.setData({
			leaderName: e.detail.value
		})
	},
	getCaptainNumber(e) {
		this.setData({
			leaderId: e.detail.value
		})
	},
	getCaptainPhone(e) {
		this.setData({
			leaderPhone: e.detail.value
		})
	},
	getMail(e) {
		this.setData({
			mail: e.detail.value
		})
	},
	getTeamIntro(e) {
		this.setData({
			teamIntro: e.detail.value
		})
	},
	getReason(e) {
		this.setData({
			reason: e.detail.value
		})
	},
	RegionChange: function (e) {
		this.setData({
			region: e.detail.value
		})
	},
	PickerChange(e) {
		this.setData({
			teamCategory: this.data.picker[e.detail.value]
		})
	},
	checkchange() {
		this.setData({
			ischeck: !this.data.ischeck
		})
	},
	teamRegister() {
		console.log('register')
		//暂未添加纠错机制
		if (!this.data.ischeck) {
			wx.showToast({
				title: '未同意协议',
			})
			// db.collection('TeamInfo').where({
			// 	_openid: app.globalData.openid
			// }).remove()
		} else {
			db.collection('TeamInfo').add({
				data: {
					teamName: this.data.teamName,
					teamLeader: [app.globalData.openid, this.data.leaderName, this.data.leaderId, this.data.leaderPhone],
					mail: this.data.mail,
					region: this.data.region[0] + this.data.region[1] + this.data.region[2],
					teamIntro: this.data.teamIntro,
					serviceNumber: 0,
					member:1,
					memberDetail: [[app.globalData.openid, this.data.leaderName, this.data.leaderId, this.data.leaderPhone]],
					volunteerTime: 0
				},
				success(res) {
					console.log(res)
					//wx.navigateBack()
					wx.showToast({
						title: '注册成功',
					})
				}
			})
		}
	}

})