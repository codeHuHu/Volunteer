// pages/mySignUp/mySignUp.js
let loading = false;
const db = wx.cloud.database()
const app = getApp()
Page({
	data: {
		region: ['广东省', '广州市', '番禺区'],
		picker: ['居民身份证', '香港居民身份证', '澳门居民身份证', '台湾身份证'],
		grade: ['小学', '中学', '本科', '研究生', '博士', '已毕业'],
		userName: '',
		userIdNumber: '',
		userPhone: '',
		isCheck: false,
		List: [],
		school: '',
		selectedYear: '请选择入学年份'
	},
	onLoad(options) { },
	onReady() { },
	onShow() { },
	onHide() { },
	onUnload() { },
	onPullDownRefresh() { },
	onReachBottom() { },
	onShareAppMessage() { },
	YearChange(e) {
		const value = e.detail.value;
		const year = value.substring(0, 4);
		this.setData({
			value: value,
			selectedYear: year
		});
	},
	gradeChange(e) {
		this.setData({
			gIdx: e.detail.value
		})
	},
	pickerChange(e) {
		this.setData({
			index: e.detail.value
		})
	},
	register() {
		var that = this;
		if (that.check() == 0) {
			return
		}

		let form = {
			name: that.data.userName,
			phone: that.data.userPhone,
			password: '123456',
			year: that.data.selectedYear,
			school: that.data.school,
			grade: that.data.grade[that.data.gIdx],
			college: that.data.college,
			idCard: that.data.userIdNumber,
			idCardType: that.data.picker[that.data.index],
		}

		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/user/create",
			method: "post",
			data: form,
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log('注册成功res', res)
			wx.setStorageSync('loginInfo', { 'phone': that.data.userPhone, 'password': '123456' })
			app.getAuthStatus();
			wx.reLaunch({
				url: '/pages/HomeCenter/home/home',
			})
			wx.showToast({
				title: '注册成功',
			})
		}).catch(err => {
			console.log(err);
		})
	},
	checkChange() {
		this.setData({
			isCheck: !this.data.isCheck
		})
	},
	check() {
		if (!this.data.gIdx && this.data.gIdx != 0) {
			this.setShow("error", "请选择年级");
			return 0
		}
		if (!this.data.value && this.data.value != 0) {
			this.setShow("error", "请选择学年");
			return 0
		}
		if (this.data.userName == '') {
			this.setShow("error", "姓名为空");
			return 0
		}

		if (!this.data.index && this.data.index != 0) {
			this.setShow("error", "请选择证件类型");
			return 0
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
		return 1
	},
	navTo(e) {
		wx.$navTo(e)
	},
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