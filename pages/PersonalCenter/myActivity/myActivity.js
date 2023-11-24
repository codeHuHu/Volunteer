// pages/myActivity/myActivity.js
const app = getApp()
const db = wx.cloud.database()
Page({
	data: {},
	onLoad(options) {
		let that = this

		that.data.mode = options.mode
		// if (Number(app.globalData.userInfo['position']) >= 1) {
		// 	filter = {
		// 		status: '2',
		// 	}
		// }
		if (options.mode == 'comment') {
		} else {
			let form = {
				"page": 1,
				"size": 10
			}

			wx.$ajax({
				url: wx.$param.server['fastapi'] + "/service/myService",
				method: "post",
				data: form,
				header: {
					'content-type': 'application/json'
				},
				showErr:false
			}).then(res => {
				that.setData({
					actionList: res.data
				})
			}).catch(err => {

			})
		}

	},
	onShow() { },
	toDetail(e) {
		if (this.data.mode == 'comment') {
			//获取上一个页面的操作权限
			let pages = getCurrentPages()
			let prevPage = pages[pages.length - 2]
			prevPage.setData({
				activityId: e.currentTarget.dataset.id
			})
			wx.navigateBack({})
			return
		}
		wx.$navTo("/pages/ServiceCenter/activityDetail/activityDetail?id=" + e.currentTarget.dataset.id)
	}
})