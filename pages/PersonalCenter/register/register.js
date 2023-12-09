const app = getApp()
Page({
	data: {
		btn_disabled: true,

	},
	onLoad(options) {
		console.log("check");
		if(wx.getStorageSync('JWT_Token')){
			console.log("check success");
			wx.navigateBack()
		}
	},
	getPhoneNumber(e) {
		console.log(e)
		if (e.detail.code) {
			wx.showLoading()
			let code = e.detail.code
			app.login(code)
		}

	},
	agreeChange(e) {
		console.log(e.detail.value)
		this.setData({
			isAgree: e.detail.value,
		})
		if (e.detail.value == "agree") {
			console.log(e.detail.value)
			this.setData({
				btn_disabled: false,
			})
		} else {
			console.log(e.detail.value)
			this.setData({
				btn_disabled: true
			})
		}
	},
})