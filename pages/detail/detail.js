// pages/datail/detail.js
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
			hours:'',
			minutes:''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad:function(options) {
		var that=this
		that.data.id=options.id
		console.log(options.id)
		wx.cloud.database().collection('ActivityInfo').doc(that.data.id).get(
			{
				success(res)
				{
					var startTime=res.data.serviceSTime
					var endTime=res.data.serviceETime
					
					var startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
var endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

// 计算时间差（以分钟为单位）
var duration = endMinutes - startMinutes;

// 将时间差转换为小时和分钟
var hours = Math.floor(duration / 60);
var minutes = duration % 60;

console.log(hours + "小时 " + minutes + "分钟"); 

					console.log(res.data)
					var actions = []
					that.setData({
						actions:res.data,
						hours:hours,
						minutes:minutes
					})
				}
			}
		)
	
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