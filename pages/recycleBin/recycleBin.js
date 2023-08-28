// pages/RecycleBin/RecycleBin.js
const db=wx.cloud.database()
const app =getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (event) {
		wx.setNavigationBarTitle({
			title: '回收站',
		})
		const currentDate = new Date();
		const timestamp = currentDate.getTime();
		this.setData({
			timestamp: timestamp,
			currentDate: currentDate
		})
		this.getStatus()
	},
	getStatus() {
		var that = this;

		const collection = db.collection('ActivityInfo');
		collection.where({
			status : '-1'
		}).field({
			_id: true,
			actName: true,
			serviceEndStamp: true,
			serviceStartStamp: true,
			status: true,
			tag: true,
			teamName: true,
			_openid: true
		})
			.limit(20)
			.orderBy('serviceStamp', 'desc')
			.get()
			.then(res => {
				var actions = res.data;
				that.setData({
					actionList: actions,
				});
				this.setTime(res.data)
				return Promise.resolve(); // 返回一个 resolved 状态的 Promise 对象
			});
		},
		onShow()
			{
				
			},
		
	setTime(result) {
		var res = result
		var dataArr = []
		var t
		for (var l in res) {
			t = new Date(res[l].serviceStamp)
			dataArr.push(`${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`)
		}
		this.setData({
			data_Arr: dataArr
		})
		wx.stopPullDownRefresh()
	},

	toDetail(e) {
		//console.log(e.currentTarget.dataset.id)
		wx.navigateTo({
			url: '/pages/activityDetail/activityDetail?id=' + e.currentTarget.dataset.id,
		})
	},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

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

	}
})