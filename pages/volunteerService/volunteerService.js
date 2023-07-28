// pages/service/service.js
const app = getApp();
const db = wx.cloud.database();

Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		show1: false, //控制下拉列表的显示隐藏，false隐藏、true显示
		show2: false,
		show3: false,
		selectallData: ['全部', '我的'], //下拉列表的数据
		selecttypeData: ['类型', '党建引领', '乡村振兴', '新时代文明实践（文化/文艺/体育）', '科普科教', '社区/城中村治理', '环境保护', '弱势群体帮扶', '志愿驿站值班', '其他'],
		selectstatusData: ['状态', '进行中', '已结束'],
		index1: 0, //选择的下拉列表下标
		index2: 0,
		index3: 0,
		actionList: [],
		currentDate: '',
		doing: '进行中',
		finish: '已结束',
		timestamp: '',
		index: ''
	},

	// 点击下拉显示框
	selectallTap() {
		this.setData({
			show1: !this.data.show1
		});
	},
	// 点击下拉显示框
	selecttypeTap() {
		this.setData({
			show2: !this.data.show2
		});
	},
	// 点击下拉显示框
	selectstatusTap() {
		this.setData({
			show3: !this.data.show3
		});
	},
	// 点击下拉列表
	optionallTap(e) {
		let Index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		this.setData({
			index1: Index,
			show1: !this.data.show1
		});
	},
	// 点击下拉列表
	optiontypeTap(e) {
		var that = this
		let Index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		this.setData({
			index2: Index,
			show2: !this.data.show2
		});
		if (Index == 0) {
			this.onShow()
		} else {
			const collection = db.collection('ActivityInfo');
			collection.where({
				'tag': that.data.selecttypeData[Index]
			}).get().then(res => {
				console.log(res.data);
				this.setData({
					actionList: res.data
				})
			}).catch(err => {
				console.log(err);
			})
		}

	},
	// 点击下拉列表
	optionstatusTap(e) {
		let Index = e.currentTarget.dataset.index; //获取点击的下拉列表的下标
		console.log(Index)
		this.setData({
			index3: Index,
			show3: !this.data.show3
		});
		if (Index == 1) {

			const collection = db.collection('ActivityInfo');
			collection.where({
				'status': '1' //进行中
			}).get().then(res => {
				console.log(res.data);
				this.setData({
					actionList: res.data
				})
			}).catch(err => {
				console.log(err);
			})
		} else if (Index == 2) {
			const collection = db.collection('ActivityInfo');
			collection.where({
				'status': '2' //已结束
			}).get().then(res => {
				console.log(res.data);
				this.setData({
					actionList: res.data
				})
			}).catch(err => {
				console.log(err);
			})
		} else {
			this.onShow()
		}
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (event) {
		wx.setNavigationBarTitle({
			title: '志愿服务',
		})
		const currentDate = new Date().toLocaleDateString().split('/').join('-');
		const currentDateObject = new Date(currentDate);
		const timestamp = currentDateObject.getTime();
		console.log(timestamp);

		this.setData({
			timestamp: timestamp,
			currentDate: currentDate
		})

		this.getStatus()

	},
	getStatus() {
		var that = this
		const collection = db.collection('ActivityInfo');
		collection.get().then(res => {
			var actions = res.data
			console.log(actions[0])

			for (var l in actions) {
				var tmptimestamp = new Date(actions[l].serviceDate)
				tmptimestamp = tmptimestamp.getTime()
				console.log(tmptimestamp)
				if (tmptimestamp < that.data.timestamp) {
					actions[l].status = '2'
				}
			}
			// 更新集合中的文档属性
			actions.forEach(action => {
				collection.doc(action._id).update({
					data: {
						status: action.status
					}
				}).then(() => {
					console.log('Document updated successfully.');
				}).catch(error => {
					console.error('Error while updating document:', error);
				});
			});

		}).catch(error => {
			console.error('Error while finding documents:', error);
		});
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow: function () {
		const db = wx.cloud.database()
		db.collection('ActivityInfo')
			.orderBy('serviceDate', 'desc').get().then((res) => {
				console.log(res)
				this.setData({
					actionList: res.data
				})
				wx.stopPullDownRefresh()
			})
			.catch(console.error)
	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

	},

	/**
	 * 页面相关事件处理函数--监听用户下拉动作
	 */
	onPullDownRefresh() {

	},

	/**
	 * 页面上拉触底事件的处理函数
	 */
	onReachBottom() {

	},

	/**
	 * 用户点击右上角分享
	 */
	onShareAppMessage() {

	},
	todetail(e) {
		console.log(e.currentTarget.dataset.id)
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	},
	addstatus(e) {
		console.log(e.currentTarget.dataset.status)
	}
})