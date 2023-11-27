const app = getApp()

Page({
	data: {},
	onLoad(options) {
		let that = this

		that.data.mode = options.mode
		let url = wx.$param.server['fastapi'] + "/service/myService"
		let form = {
			'pagination': {
				"page": 1,
				"size": 10
			}
		}
		if (options.mode == 'comment') {
			form['status'] = [2]
			if (app.globalData.userInfo['position'] >= 1) {
				url = wx.$param.server['fastapi'] + "/service/show"
			}
			wx.$ajax({
				url: url,
				method: "post",
				data: form,
				header: {
					'content-type': 'application/json'
				},
				showErr: false
			}).then(res => {
				that.setData({
					actionList: res.data
				})
			}).catch(err => {

			})
		} else {
			wx.$ajax({
				url: url,
				method: "post",
				data: form,
				header: {
					'content-type': 'application/json'
				},
				showErr: false
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