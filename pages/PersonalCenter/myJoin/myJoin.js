// pages/myJoin/myJoin.js
const app = getApp()

let form = {
	page: 1,
	pageSize: 10
}

Page({
	data: {},
	onLoad(options) {

	},
	onReady() { },
	onShow() {
		let that = this
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/service/myJoin/page",
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
	},
	navTo(e) {
		wx.$navTo(e)
	}
})