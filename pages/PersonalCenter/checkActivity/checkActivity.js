const app = getApp()
let loading = false;

Page({
	data: {

	},
	onLoad(event) {
		wx.setNavigationBarTitle({
			title: '审核发布',
		})
		this.getList([-1]) //status为-1是待审核
		this.getList([-2, -3]) //status为-2是已取消
	},
	getList(e) {
		let that = this
		let form = {
			status: e,
			pagination: {
				page: 1,
				size: 10
			}
		}
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/service/show",
			method: "post",
			data: form,
			header: {
				'content-type': 'application/json'
			},
			showErr: false
		}).then(res => {
			if (e[0] == -1) {
				that.setData({
					actionList: res.data,
				})
			} else if (e[0] == -2) {
				that.setData({
					binActionList: res.data,
				})
			}
		}).catch(err => {
			console.log("err", err);
		})


	},
	agree(e) {
		let that = this
		wx.showModal({
			title: '确认',
			content: '是否确定发布？',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
					wx.$ajax({
						url: wx.$param.server['springboot'] + "/service/check/1",
						method: "post",
						data: {
							id: e.currentTarget.dataset.id,
						
						},
						header: {
							'content-type': 'application/json'
						},
					}).then(res => {
						that.setData({
							actionList: [],
						})
						that.getList([-1]) //status为-1是待审核
					}).catch(err => {

					})
				} else if (res.cancel) {

				}
			}
		})
	},
	reject(e) {
		let that = this
		wx.showModal({
			title: '确认',
			content: '是否拒绝发布',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
					wx.$ajax({
						url: wx.$param.server['springboot'] + "/service/check/-2",
						method: "post",
						data: {
							id: e.currentTarget.dataset.id,
						},
						header: {
							'content-type': 'application/json'
						},
					}).then(res => {
						that.setData({
							actionList: [],
							binActionList: []
						})
						that.getList([-1]) //status为-1是待审核
						that.getList([-2, -3]) //status为-2是已取消
					}).catch(err => {

					})
				} else if (res.cancel) {

				}
			}
		})
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
	navTo(e) {
		wx.$navTo(e)
	},
})