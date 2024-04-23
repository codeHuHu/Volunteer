const app = getApp()
let loading = false


let form = {
	status: 1,
	page: 1,
	pageSize: 5
}

Page({
	data: {
		dataList: [],
		keyword: '',
		showModal: true, // 是否显示模态框
		showImageModal: false, // 是否显示图片和提示信息框
		imageSrc: '', // 图片链接，请替换为实际的图片链接
	},
	onLoad() {
		wx.setNavigationBarTitle({
			title: '首页',
		})
		this.setData({
			myPos: app.getRole()
		})
	},
	onReady() { },
	onShow() {
		this.getData()
		wx.hideHomeButton()
	},
	//查找活动
	getData() {
		wx.showLoading()
		var that = this;
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/service/public/page",
			method: "get",
			data: form,
			header: {
				'content-type': 'application/json'
			},
			showErr: false
		}).then(res => {
			that.setData({
				dataList: res.data.records
			})
			wx.hideLoading()
		}).catch(err => {
			console.log(err)
			wx.hideLoading()
		})
	},
	searchActivity() {
		var that = this
		that.setData({
			dataList: []
		})
		form['title'] = this.data.keyword
		if (this.data.keyword.length == 0) {
			form['status'] = 1
		} else {
			form['status'] = 0
		}
		that.getData()
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
	longTap(e) {
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
	//跳转一般都用这个
	navTo(e) {
		wx.$navTo(e)
	},
	toNewActivity() {
		if (!app.globalData.isAuth) {
			this.setShow("error", "请先前往个人中心注册");
			return 0
		}
		if (this.byhistory() || this.byBase()) {
			this.setData({
				modalName: null
			});
			wx.$navTo('/pages/PersonalCenter/newActivity/newActivity')
		} else {
			wx.$navTo("/pages/PersonalCenter/accountSignUp/accountSignUp")
		}
	},
	toRegister() {
		if (app.globalData.isAuth == true) {
			wx.showToast({
				title: '你已注册成为志愿者',
				icon: 'none'
			})
		} else {
			wx.$navTo("/pages/PersonalCenter/register/register")
		}
	},
	//转发朋友
	onShareAppMessage(event) {
		return {
			//imageUrl: this.data.dataList.images[0],
			path: 'pages/HomeCenter/home/home'
		}
	},
	//转发朋友圈
	onShareTimeline(event) {
		return {
		}
	},
	setShow(status, message, time = 1500, fun = false) {
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