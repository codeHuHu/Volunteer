// pages/mySignUp/mySignUp.js
const db = wx.cloud.database()
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

		region: ['广东省', '广州市', '番禺区'],
		picker: ['居民身份证', '香港居民身份证', '澳门居民身份证', '台湾身份证'],

		team:	['广州大学城志愿者协会','阳光义工团'],
		UserName:'',
		UserIdnumber:'',
		UserPhone:'',
		ischeck:false,
		List:[]

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
	getPhone(e) {

		console.log(e.detail.value);
		this.setData({
			UserPhone: e.detail.value
		})
	},
	register() {
		var that = this;
		if (that.data.UserName == '') {
			wx.showToast({
				title: '姓名不能为空',
			})
			return
		} else if (that.data.UserIdnumber == '') {
			wx.showToast({
				title: '证件号不能为空',
			})
			return
		} else if (that.data.UserPhone == '') {
			wx.showToast({
				title: '请输入手机号',
			})
			return
		} else if (!this.data.ischeck) {
			wx.showToast({
				title: '请同意协议',
			})
		} else {

			db.collection('UserInfo').add({
				data: {
					username: that.data.UserName,
					idtype: that.data.picker[that.data.index],
					idnumber: that.data.UserIdnumber,
					team: that.data.team[that.data.teamid],
					residence: that.data.region,
					phone: that.data.UserPhone,
					islogin: true
				},
				success(res) {
					console.log(res);
					console.log("修改islogin");
					app.globalData.islogin = true;
					console.log(app.globalData.islogin);

					try {
						that.data.List.push([app.globalData.openid, app.globalData.islogin]);
						console.log(that.data.List);
						try {
							wx.setStorageSync('user_status', that.data.List);
						} catch (e) {

						}
					} catch (e) {
						console.log(123123);
					}

					wx.navigateBack(),
						wx.showToast({
							title: '注册成功',
						})

				}
			})
		}
	},
	checkchange() {
		console.log(111)
		this.setData({
			ischeck: !this.data.ischeck
		})
	},
	//删除数据库
	delete() {
		db.collection('UserInfo').where({
			_openid: app.globalData.openid
		}).remove()
	}

})