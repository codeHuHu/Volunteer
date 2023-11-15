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
		grade: ['小学', '中学', '本科', '研究生', '博士', '已毕业'],
		team: ['广州大学城志愿者协会', '阳光义工团'],
		userName: '',
		userIdNumber: '',
		userPhone: '',
		UserAliPay: '',
		isCheck: false,
		List: [],
		school: '',
		selectedYear: '请选择入学年份'
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

	YearChange: function (e) {
		const value = e.detail.value;
		const year = value.substring(0, 4);
		this.setData({
			value: value,
			selectedYear: year
		});
		console.log(this.data.selectedYear)
	},
	RegionChange: function (e) {
		this.setData({
			region: e.detail.value

		})
		console.log(this.data.region)
	},
	GradeChange(e) {
		console.log(e.detail.value)
		this.setData({
			Gindex: e.detail.value
		})
	},
	PickerChange(e) {
		console.log(e);
		this.setData({
			index: e.detail.value
		})
		console.log(e.detail.value)
	},
	teamChange(e) {
		console.log(e);
		this.setData({
			teamId: e.detail.value
		})
	},

	getName(event) {
		console.log(event.detail.value);
		this.setData({
			userName: event.detail.value
		})
	},
	getIdnumber(e) {
		console.log(e.detail.value);
		this.setData({
			userIdNumber: e.detail.value
		})
	},
	getAliPay(e) {
		console.log(e.detail.value);
		this.setData({
			userAliPay: e.detail.value
		})
	},
	getPhone(e) {
		console.log(e.detail.value);
		this.setData({
			userPhone: e.detail.value
		})
	},
	getSchool(e) {
		this.setData({
			school: e.detail.value
		})
	},
	getCollege(e) {
		this.setData({
			college: e.detail.value
		})
	},
	getCrade(e) {
		this.setData({
			grade: e.detail.value
		})
	},
	getClass(e) {
		this.setData({
			class: e.detail.value
		})
	},
	register() {
		if (this.check() == 0) {
			return
		}

		var that = this;
		db.collection('UserInfo').add({
			data: {
				userName: that.data.userName,
				idType: that.data.picker[that.data.index],
				idNumber: that.data.userIdNumber,
				//team: that.data.team[that.data.teamid],
				phone: that.data.userPhone,
				aliPay: that.data.userAliPay,
				school: that.data.school,
				college: that.data.college,
				grade: that.data.grade[that.data.Gindex],
				year: that.data.selectedYear,
				isLogin: true,
				position: 0
			},
			success(res) {
				console.log('注册成功')
				app.globalData.name = that.data.userName;
				app.globalData.phone = that.data.userPhone;
				app.globalData.id = that.data.userIdNumber;
				app.globalData.isLogin = true;
				app.globalData.college = that.data.college;
				app.globalData.aliPay = that.data.userAliPay;
				app.globalData.school = that.data.school;
				app.globalData.grade = that.data.grade[that.data.Gindex];
				app.globalData.year = that.data.selectedYear;
				app.globalData.position = 0
				wx.setStorageSync('user_status', [app.globalData.openid, app.globalData.isLogin]);
				wx.reLaunch({
					url: '/pages/home/home',
				})
				wx.showToast({
					title: '注册成功',
				})
			}
		})
	},
	check() {

		if (!this.data.Gindex) {
			if (this.data.Gindex != 0) {
				this.setShow("error", "请选择年级");
				return 0
			}
		}
		if (!this.data.value) {
			if (this.data.value != 0) {
				this.setShow("error", "请选择学年");
				return 0
			}
		}
		if (this.data.userName == '') {
			this.setShow("error", "姓名为空");
			return 0
		}

		if (!this.data.index) {
			if (this.data.index != 0) {
				this.setShow("error", "请选择证件类型");
				return 0
			}
		}
		if (this.data.userIdNumber == '') {
			this.setShow("error", "证件号不能为空");
			return 0
		}
		if (this.data.uerPhone == '') {
			this.setShow("error", "请输入手机号");
			return 0
		}
		if (this.data.school == '') {
			this.setShow("error", "请输入学校/单位");
			return 0
		}

		if (!this.data.isCheck) {
			this.setShow("error", "请仔细阅读并同意协议");
			return 0
		}
	},
	checkchange() {
		console.log(111)
		this.setData({
			isCheck: !this.data.isCheck
		})
	},
	toInformTest() {
		wx.navigateTo({
			url: '/pages/PersonalCenter/InformTest/InformTest',
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
})