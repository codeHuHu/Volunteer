// pages/myJoin/myJoin.js
const app = getApp()
Page({
	data: {},
	onLoad(options) {

	},
	onReady() { },
	onShow() {
		let that = this

		let form = {
			"page": 1,
			"size": 10
		}
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/service/myJoin",
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
	},
	navTo(e) {
		wx.$navTo(e)
	}
})