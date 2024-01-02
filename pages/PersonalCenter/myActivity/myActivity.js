const app = getApp()

let form = {
	page: 1,
	pageSize: 10
}

Page({
	data: {},
	onLoad(options) {
		let that = this

		that.data.mode = options.mode
		let url = wx.$param.server['springboot'] + "/service/myService/page"
		
		if (options.mode == 'comment') {
			form['status'] = 2
			// if (app.globalData.userInfo['position'] >= 1) {
			// 	url = wx.$param.server['springboot'] + "/service/show"
			// }
			wx.$ajax({
				url: url,
				method: "get",
				data: form,
				header: {
					'content-type': 'application/json'
				}
			}).then(res => {
				that.setData({
					actionList: res.data.records
				})
			}).catch(err => {

			})
		} else {
			wx.$ajax({
				url: url,
				method: "get",
				data: form,
				header: {
					'content-type': 'application/json'
				},
				showErr: false
			}).then(res => {
				that.setData({
					actionList: res.data.records
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