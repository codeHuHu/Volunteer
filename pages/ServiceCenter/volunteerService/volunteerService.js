// pages/service/service.js
const app = getApp();
const db = wx.cloud.database();
let utils = require("../../../utils/date.js")
let loading = false;

Page({
	data: {
		show1: false, //控制下拉列表的显示隐藏，false隐藏、true显示
		show2: false,
		show3: false,
		selectAll: ['全部', '我的'], //下拉列表的数据
		selectType: ['所有类型', '党建引领', '乡村振兴', '新时代文明实践', '科普科教', '社区/城中村治理', '环境保护', '弱势群体帮扶', '志愿驿站值班', '其他'],
		selectStatus: ['所有状态', '进行中', '已结束'],
		index1: 0, //选择的下拉列表下标
		index2: 0,
		index3: 0,
		actionList: [],
		currentDate: '',
		doing: '进行中',
		finish: '已结束',
		timeStamp: '',
		index: '',
		data_Arr: [],
		toUpdateArr: [''],
		actions_Status: ['1'],
	},
	onLoad(event) {
		wx.setNavigationBarTitle({
			title: '志愿服务',
		})
		this.setData({
			myPos: app.globalData.userInfo["position"],
			myId: app.globalData.userInfo["id"]
		})
		this.getServices()
	},
	getServices(myForm = null, myUrl = null) {
		let that = this;

		let url = !!myUrl ? myUrl : wx.$param.server['fastapi'] + "/service/show"
		let form = !!myForm ? myForm : { "status": [1], "pagination": { "page": 1, "size": 10 } }

		wx.$ajax({
			url,
			method: "post",
			data: form,
			header: {
				'content-type': 'application/json'
			},
			showErr: false,
		}).then(res => {
			that.setShow("success", "获取成功")
			that.setData({
				actionList: res.data
			})
		}).catch(err => {
			that.setShow("error", "获取失败")
		})
	},
	// 控制下拉显示框
	controlSelectTap(e) {
		let suffix = e.currentTarget.dataset.show
		this.setData({
			['show' + suffix]: !this.data['show' + suffix]
		});
	},
	// (全部/我的)点击下拉列表
	allSearch(e) {
		let that = this
		let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		that.setData({
			actionList: [],
			index1: index,
			show1: !this.data.show1,
			index2: 0,
			index3: 0
		});
		if (index == 0) {
			that.getServices()
		} else {
			//我的
			that.getServices(null, wx.$param.server['fastapi'] + "/service/myService")
		}
	},
	// ()类型)点击下拉列表
	typeSearch(e) {
		let that = this
		let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		that.setData({
			actionList: [],
			index2: index,
			show2: !this.data.show2,
			index1: 0,
		});
		if (index == 0) {
			that.getServices()
		} else {
			let form = {
				"tag": index ? that.data.selectType[index] : '',
				"status": [that.data.index3],
				"pagination": { "page": 1, "size": 10 }
			}
			that.getServices(form, null)
		}

	},
	// (状态)点击下拉列表
	statusSearch(e) {
		let that = this
		let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		that.setData({
			actionList: [],
			index3: index,
			show3: !that.data.show3,
			index1: 0,
		});
		let form = {
			"tag": that.data.index2 ? that.data.selectType[that.data.index2] : '',
			"status": [index],
			"pagination": { "page": 1, "size": 10 }
		}
		that.getServices(form, null)
	},

	setTime(result) {
		let res = result
		let dataArr = []
		let t
		for (let l in res) {
			t = new Date(res[l].serviceStartStamp)
			dataArr.push(`${t.getFullYear()}-${utils.Z(t.getMonth() + 1)}-${utils.Z(t.getDate())}`)
		}
		this.setData({
			data_Arr: dataArr
		})
		wx.stopPullDownRefresh()
	},
	cancell(e) {
		let that = this
		wx.showModal({
			title: '是否取消活动',
			content: '取消后仅你和管理员可见',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					wx.$ajax({
						url: wx.$param.server['fastapi'] + "/service/check",
						method: "post",
						data: {
							id: e.currentTarget.dataset.id,
							status: -3
						},
						header: {
							'content-type': 'application/json'
						},
					}).then(res => {
						that.setData({
							actionList: [],
						})
						that.getServices()
					}).catch(err => {

					})
				} else if (res.cancel) {

				}
			}
		})
	},
	setShow(status, message, time = 500, fun = false) {
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