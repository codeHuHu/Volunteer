const db = wx.cloud.database()
const app = getApp()
let loading = false;
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
		this.setData({
			leaderName: app.globalData.Name,
			leaderId: app.globalData.Id,
			leaderPhone: app.globalData.phone,
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
	getTeamName(e) {
		this.setData({
			teamName: e.detail.value
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
		if(this.check()==0){
			return
		}
		console.log('执行提交中')
		this.setShow("success", "可以提交");
		//return
		var that = this
		//暂未添加纠错机制
		
		db.collection('TeamInfo').add({
			data: {
				teamName: that.data.teamName,
				teamLeader: [{
					openid: app.globalData.openid,
					Name: that.data.leaderName,
					Id: that.data.leaderId,
					Phone: that.data.leaderPhone
				}],
				mail: that.data.mail,
				region: that.data.region[0] + that.data.region[1] + that.data.region[2],
				teamIntro: that.data.teamIntro,
				serviceNumber: 0,
				member: 1,
				teamMembers: [{
					openid: app.globalData.openid,
					Name: that.data.leaderName,
					Id: that.data.leaderId,
					Phone: that.data.leaderPhone
				}],
				volunteerTime: 0
			},
			success(res) {
				console.log(res)
				wx.navigateBack()
				wx.showToast({
					title: '注册成功',
				})
			}
		})

	},
	check(){
		if (!this.data.leaderId || !this.data.leaderName|| !this.data.leaderPhone) {
			this.setShow("error", "请重启本小程序");
			return 0
		}
		if (this.data.teamName.length == 0 || this.data.teamIntro.length == 0 || this.data.mail.length == 0) {
			this.setShow("error", "名称/介绍/邮箱错误");
			return 0
		}
		if (!this.data.ischeck) {
			this.setShow("error", "未同意协议");
			return 0
		}
		//return 1
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
	  },

})