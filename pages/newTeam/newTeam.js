// pages/newTeam/newTeam.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		region: ['广东省', '广州市', '番禺区'],
		picker: ['类型1', '类型2', '类型3', '类型4'],
		team:	['广州大学城青年志愿者协会','阳光义工团'],
		UserName:'',
		UserIdnumber:'',
		UserPhone:'',
		ischeck:false,
		List:[]
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {

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

	},

	RegionChange: function (e) {
		this.setData({
			region: e.detail.value
		
		})
		console.log	(this.data.region)
	},
	PickerChange(e) {
		console.log(e);
		this.setData({
			index: e.detail.value
		})
		console.log()
	},
})