// pages/mine/mine.js
const app = getApp()
let loading = false;
Page({
	data: {
		isLogin: false,
		actions: {},
		showModal: true, // 是否显示模态框
		showImageModal: false, // 是否显示图片和提示信息框
		imageSrc: 'cloud://volunteer-4gaukcmqce212f11.766f-volunteer-4gaukcmqce212f11-1321274883/kefu.jpg', // 图片链接，请替换为实际的图片链接
	},
	onLoad() {
	},
	onShow() {
		this.getUserInfo()
		this.saveData()
	},
	saveData() {
		wx.setStorageSync('app_globalData', app.globalData)
	},
	getOpenid() {
		let openid = wx.getStorageSync('openid')
		if (openid.length > 1) {
			return openid
		}
		wx.cloud.callFunction({
			name: 'getUserOpenid',
			success(res) {
				return res.result.openid

			}
		})
	},
	getUserInfo() {
		var that = this
		let openid = this.getOpenid()
		wx.cloud.database().collection('UserInfo').where({
			_openid: openid ? openid : (app.globalData.userInfo['_openid'] ? app.globalData.userInfo['_openid'] : 1)
		})
			.get({
				success(res) {
					that.setData({
						actions: res.data[0],
						isLogin: true,
						myPos: res.data[0].position,
					})
					app.globalData.userInfo=res.data[0]
				},
				fail(err) {
					that.setData({
						isLogin: false
					})
				}
			})
	},

	navTo(e) {
		if (e.currentTarget.dataset.check == "1" && !this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		this.hideModal()
		wx.$navTo(e)
	},
	showModal(e) {
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