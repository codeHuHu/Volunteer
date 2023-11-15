// pages/mine/mine.js
const app = getApp()
let loading = false;
Page({
	data: {
		openid: null,
		isLogin: false,
		actions: '',
		showModal: true, // 是否显示模态框
		showImageModal: false, // 是否显示图片和提示信息框
		imageSrc: 'cloud://volunteer-4gaukcmqce212f11.766f-volunteer-4gaukcmqce212f11-1321274883/kefu.jpg', // 图片链接，请替换为实际的图片链接
		isTip:'1'	//是否弹出提示链接
	},
	onLoad: function (event) {
		console.log('app.globalData', app.globalData)
		this.setData({
			openid: app.globalData.openid,
			myPos: app.globalData.position,
			isLogin: app.globalData.isLogin
		})
	},
	getDetail() {
		var that = this
		wx.cloud.database().collection('UserInfo').where({
			_openid: app.globalData.openid
		})
			.get({
				success(res) {
					that.setData({
						actions: res.data[0],
					})
					app.globalData.isLogin = that.data.actions.isLogin
					wx.setStorageSync('user_status', [res.data[0]._openid, app.globalData.isLogin])
					return true;
				},
				fail(err) {
					that.setData({
						isLogin: false
					})
					return false;
				}
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
		
		this.setData({
			openid: app.globalData.openid,
			isLogin: app.globalData.isLogin,
			myPos: app.globalData.position,
		})
		this.getDetail()
	},
	toregister() {
		wx.navigateTo({
			url: '/pages/PersonalCenter/accountSignUp/accountSignUp',
		})
	},
	toNewActivity() {

		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		this.setData({
			isTip:0
		})
		
		wx.navigateTo({
			url: '/pages/PersonalCenter/newActivity/newActivity',
		})
	},
	toSetting() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/PersonalCenter/setting/setting',
		})
	},
	toMyActivity() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/PersonalCenter/myActivity/myActivity',
		})
	},
	toMyJoin() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}
		wx.navigateTo({
			url: '/pages/PersonalCenter/myJoin/myJoin',
		})
	},

	toCommentActivity() {
		if (!this.data.isLogin) {
			this.setShow("error", "未注册");
			return 0
		}

		wx.navigateTo({
			url: '/pages/PersonalCenter/commentActivity/commentActivity',
		})
	},
	toCheckActivity() {
		wx.navigateTo({
			url: '/pages/PersonalCenter/checkActivity/checkActivity',
		})
	},
	showModal(e) {
		this.setData({
			isTip:1,
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
	toaboutUs() {
		wx.navigateTo({
			url: '/pages/PersonalCenter/aboutUs/aboutUs',
		})
	}
})