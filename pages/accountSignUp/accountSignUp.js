// pages/mySignUp/mySignUp.js
let loading = false;
const db = wx.cloud.database()
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

		region: ['广东省', '广州市', '番禺区'],
		picker: ['居民身份证', '香港居民身份证', '澳门居民身份证', '台湾身份证'],

		team: ['广州大学城志愿者协会', '阳光义工团'],
		UserName: '',
		UserIdnumber: '',
		UserPhone: '',
		UserAliPay: '',
		ischeck: false,
		List: [],

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
	RegionChange: function (e) {
		this.setData({
			region: e.detail.value

		})
		console.log(this.data.region)
	},
	PickerChange(e) {
		console.log(e);
		this.setData({
			index: e.detail.value
		})
		console.log()
	},
	teamChange(e) {
		console.log(e);
		this.setData({
			teamid: e.detail.value
		})
	},

	getName(event) {
		console.log(event.detail.value);
		this.setData({
			UserName: event.detail.value
		})
	},
	getIdnumber(e) {
		console.log(e.detail.value);
		this.setData({
			UserIdnumber: e.detail.value
		})
	},
	getAliPay(e) {
		console.log(e.detail.value);
		this.setData({
			UserAliPay: e.detail.value
		})
	},
	getPhone(e) {

		console.log(e.detail.value);
		this.setData({
			UserPhone: e.detail.value
		})
	},
	getSchool(e)
	{
		this.setData({
			School:e.detail.value
		})
	},
	getCrade(e)
	{
		this.setData({
			Grade:e.detail.value
		})
	},
	getClass(e)
	{
		this.setData({
			Class:e.detail.value
		})
	},
	register() {
		if (this.check() == 0) {
			return
		}

		var that = this;
		db.collection('UserInfo').add({
			data: {
				username: that.data.UserName,
				idtype: that.data.picker[that.data.index],
				idnumber: that.data.UserIdnumber,
				//team: that.data.team[that.data.teamid],
				residence: that.data.region,
				phone: that.data.UserPhone,
				aliPay: this.data.UserAliPay,
				school:this.data.School,
				grade:this.data.Grade,
				class:this.data.Class,
				islogin: true
			},
			success(res) {
				console.log('注册成功')
				app.globalData.Name = that.data.UserName;
				app.globalData.phone = that.data.UserPhone;
				app.globalData.Id = that.data.UserIdnumber;
				app.globalData.islogin = true;
				wx.setStorageSync('user_status', [app.globalData.openid, app.globalData.islogin]);
				wx.navigateBack()
				wx.showToast({
					title: '注册成功',
				})
			}
		})
	},
	check() {
		if (this.data.UserName == '') {
			this.setShow("error", "姓名为空");
			return 0
		}
		if (!this.data.index) {
			if (this.data.index != 0) {
				this.setShow("error", "请选择证件类型");
				return 0
			}
		}
		if (this.data.UserIdnumber == '') {
			this.setShow("error", "证件号不能为空");
			return 0
		}
		if (this.data.UserPhone == '') {
			this.setShow("error", "请输入手机号");
			return 0
		}
		if (this.data.UserAliPay == '') {
			this.setShow("error", "请输入支付宝账号");
			return 0
		}
		if (!this.data.isCheck) {
			this.setShow("error", "请同意协议");
			return 0
		}
	},
	checkchange() {
		console.log(111)
		this.setData({
			ischeck: !this.data.ischeck
		})
	},

		/**
	 * 轻提示展示
	 * @param {*} status 
	 * @param {*} message 
	 * @param {*} time 
	 * @param {*} fun 
	 */
	setShow(status, message, time = 1000, fun = false) {
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
	//删除数据库
	delete() {
		db.collection('UserInfo').where({
			_openid: app.globalData.openid
		}).remove()
	}

})