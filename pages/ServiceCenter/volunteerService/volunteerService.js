// pages/service/service.js
const app = getApp();
let utils = require("../../../utils/date.js")
let loading = false;

let form = {
	tag: "",
	status: 1,
	page: 1,
	pageSize: 5
}


Page(
	{

	data: {
		show1: false, //控制下拉列表的显示隐藏，false隐藏、true显示
		show2: false,
		show3: false,
		selectAll: ['全部'], //下拉列表的数据
		selectType: ['所有类型', '党建引领', '乡村振兴', '新时代文明实践', '科普科教', '社区/城中村治理', '环境保护', '弱势群体帮扶', '志愿驿站值班', '其他'],
		selectStatus: ['所有状态', '进行中', '已结束'],
		index1: 0, //选择的下拉列表下标
		index2: 0,
		index3: 0,
		actionList: [],	//存储查询结果的数组
	//	isLoading:false,
		hasMore:true,
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
		this.initPage()
		wx.setNavigationBarTitle({
			title: '志愿服务',
		})
		this.setData({
			myPos: app.globalData.userInfo["position"],
			myId: app.globalData.userInfo["id"]
		})
		this.getData()
	},
	getData() {
		let that = this;
		wx.$ajax({
			url: wx.$param.server['springboot'] + "/service/public/page",
			method: "get",
			data: form,
			header: {
				'content-type': 'application/json'
			},
			showErr: false,
		}).then(res => {
			that.setShow("success", "获取成功")
			console.log(res.data)
			const updateActionList = this.data.actionList.concat(res.data.records)
			that.setData({
				actionList: updateActionList
			})

			const hasMore = res.data.records.length >= form['pageSize']
			this.setData({
				hasMore:hasMore,
			//	isLoading:false
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
			show1: !this.data.show1,
			show2: false,
			show3: false,
			actionList: [],
			index1: index,
			index2: 0,
			index3: 0
		});
		that.initPage()
		that.getData()
	},
	// 类型 点击下拉列表
	typeSearch(e) {
		let that = this
		let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		that.setData({
			show1: false,
			show2: !this.data.show2,
			show3: false,
			actionList: [],
			index2: index,
			index1: 0,
		});
		form['status'] = that.data.index3 != 0 ? that.data.index3 : 1
		form['tag'] = index ? that.data.selectType[index] : ''
		that.initPage()
		that.getData()

	},
	// (状态)点击下拉列表
	statusSearch(e) {
		let that = this
		let index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		that.setData({
			show1: false,
			show2: false,
			show3: !that.data.show3,
			actionList: [],
			index3: index,
			index1: 0,
		});
		form['status'] = that.data.index3
		that.initPage()
		that.getData()
	},
	myCancel(e) {
		let that = this
		wx.showModal({
			title: '是否取消活动',
			content: '取消后仅你和管理员可见',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					wx.$ajax({
						url: wx.$param.server['springboot'] + "/service/status/-3" ,
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
						that.getData()
					}).catch(err => {

					})
				} else if (res.cancel) {

				}
			}
		})
	},
	initPage()
	{
		form['page'] = 1
		form['pageSize'] = 5
		this.setData({
			hasMore:true,
		})
	},
	//页面上拉触底事件的处理函数
	onReachBottom:function()
	{
		var that =this
		console.log("上拉刷新")
	//	wx.pageScrollTo({scrollTop: 100})
		const {hasMore} =this.data;
		console.log(hasMore)
		if(hasMore)
		{
			console.log("+1页",form['page'])
		form['page'] = form['page']+1
		that.getData()
	}
	
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