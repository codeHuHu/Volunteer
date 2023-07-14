// pages/service/service.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		show1:false,//控制下拉列表的显示隐藏，false隐藏、true显示
		show2:false,
		show3:false,
		selectallData:['全部','我的'],//下拉列表的数据
		selecttypeData:['青少年服务','便民服务','环境保护','扶贫帮困','其他'],
		selectstatusData:['进行中','已截止','已结束'],
		index1:0,//选择的下拉列表下标
		index2:0,
		index3:0
	},
	
	// 点击下拉显示框
	selectallTap(){
		this.setData({
		 show1: !this.data.show1
		});
		},
			// 点击下拉显示框
	selecttypeTap(){
		this.setData({
		 show2: !this.data.show2
		});
		},
			// 点击下拉显示框
	selectstatusTap(){
		this.setData({
		 show3: !this.data.show3
		});
		},
		// 点击下拉列表
		optionallTap(e){
		let Index=e.currentTarget.dataset.index;//获取点击的下拉列表的下标
		this.setData({
		 index1:Index,
		 show1:!this.data.show1
		});
	},
	// 点击下拉列表
	optiontypeTap(e){
		let Index=e.currentTarget.dataset.index;//获取点击的下拉列表的下标
		this.setData({
		 index2:Index,
		 show2:!this.data.show2
		});
	},
	// 点击下拉列表
	optionstatusTap(e){
		let Index=e.currentTarget.dataset.index;//获取点击的下拉列表的下标
		this.setData({
		 index3:Index,
		 show3:!this.data.show3
		});
	},
	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		wx.setNavigationBarTitle({
			title: '志愿服务',
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
			// 隐藏返回按钮
			wx.hideHomeButton()
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
	toshouye()
	{
	wx.reLaunch({
		url: '/pages/home/home',
	})
},
	tomine()
	{
		wx.reLaunch({
			url: '/pages/mine/mine',
		})
	}
})