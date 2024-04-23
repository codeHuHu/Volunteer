const app = getApp()
let loading = false;

Page({
	data: {

	},
	onLoad(event) {
		wx.setNavigationBarTitle({
			title: '审核发布',
		})
		this.getList(-1) //status为-1是待审核
		// this.getList(-2) //status为-2是拒绝发布
		// this.getList(-3) //status为-3是发布后但取消
	},

	getList(e) {
		let that = this
		let form = {
			status: e,
			page: 1,
			pageSize: 10
		}
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/service/public/page",
			method: "get",
			data: form,
			header: {
				'content-type': 'application/json'
			},
			showErr: false
		}).then(res => {
			if (e == -1) {
				that.setData({
					actionList: res.data.records
				})
			} else if (e == -2) {
				that.setData({
					binActionList: res.data.records,
				})
			}
			else if (e == -3) {
				that.setData({
					binActionList: that.data.binActionList.concat(res.data.records),
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
				var status = 1;
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
					wx.$ajax({
						url: wx.$param.server['springboot'] + "/service/status/" + status,
						method: "post",
						data: {
							id: e.currentTarget.dataset.id,

						},
					}).then(res => {
						that.setData({
							actionList: [],
						})
						that.getList(-1) //status为-1是待审核
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
				var status = -2
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
					wx.$ajax({
						url: wx.$param.server['springboot'] + "/service/status/" + status,
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
						//	that.getList([-1]) //status为-1是待审核
						that.getList(-2) //status为-2是已取消
						that.getList(-3) //status为-3是用户已取消

					}).catch(err => {

					})
				} else if (res.cancel) {

				}
			}
		})
	},
	showModal(e) {
		this.getList(-2) //status为-2是拒绝发布
		this.getList(-3) //status为-3是发布后但取消

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