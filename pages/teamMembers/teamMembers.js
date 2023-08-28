// pages/teammenbers/teammenbers.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		teamMembers: [],
		phone: [],
		leader: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		var that = this
		db.collection('TeamInfo').doc(options.id).get({
			success(res) {
				console.log(res)
				that.setData({
					leader: res.data.teamLeader,
					teamMembers: res.data.teamMembers,
				})

				that.setData(
					{
						leaderPhone: that.data.leader.map(item => {
							item.phone = that.maskPhoneNumber(item.phone);
							return item;
						}),
						memberPhone: that.data.teamMembers.map(item => {
							item.phone = that.maskPhoneNumber(item.phone);
							return item;
						})

					}
				)

			},
			fail(err) {
				console.log('失败')
			}

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

	},

	maskPhoneNumber(phoneNumber) {
		// 替换中间四位数字为星号
		return phoneNumber.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
	}
})