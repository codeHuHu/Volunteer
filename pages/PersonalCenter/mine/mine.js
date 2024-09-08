const app = getApp()
let loading = false;
Page({
	data: {
		isLogin: false,
		actions: {},
		showModal: true, // 是否显示模态框
		showImageModal: false, // 是否显示图片和提示信息框
		imageSrc: '', // 图片链接，请替换为实际的图片链接
	},
	onLoad() {
		this.getUserInfo()
	},
	onShow() {
		console.log("show")
		let that = this
		that.saveGlobalData()
		that.setData({
			isLogin: app.globalData.isAuth,
			userName: app.getUserName(),
			myRole: app.getRole()
		})
	},
	onPullDownRefresh() {
		this.getUserInfo()
		wx.stopPullDownRefresh()
	},
	// 这个主要为了调试用的
	saveGlobalData() {
		wx.setStorageSync('app_globalData', app.globalData)
	},
	getUserInfo() {
		let that = this
		// 调用全局函数
		app.getAuthStatus()
		that.setData({
			isLogin: app.globalData.isAuth,
			userName: app.getUserName(),
			myRole: app.getRole()
		})
	},
	navTo(e) {
		if (e.currentTarget.dataset.check == "1" && !this.data.isLogin) {
			this.setShow("error", "未登录");
			return 0
		}
		this.hideModal()
		wx.$navTo(e)
	},
	showModal(e) {
		if (this.data.myRole < 1) {
			this.setShow("error", "未登录");
			return 0
		}
		this.setData({
			modalName: e.currentTarget.dataset.target
		})
	},
	hideModal(e) {
		this.setData({
			modalName: null
		})
	},
	handleNotHaveOption() {
		this.setData({
			modalName: null, // 隐藏模态框
			showImageModal: true, // 显示图片和提示信息框
		});
	},
	longTap: function (e) {
		wx.previewImage({
			urls: [e.currentTarget.dataset.url],
			current: ''
		})
	},
	hideImgmodal() {
		this.setData({
			// 隐藏模态框
			showImageModal: false, // 显示图片和提示信息框
		})
	},
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