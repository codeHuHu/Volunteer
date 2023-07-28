// pages/teamdetail/teamdetail.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		ifJoined: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		if (options.info) {
			let info = JSON.parse(decodeURIComponent(options.info))
			console.log('传入参数并解析')
			this.setData({
				teamDetail: info
			})
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		var cur = this.data.teamDetail.teamMembers
		for (var i in cur) {
			if (cur[i][0] == app.globalData.openid) {
				//已在队伍当中了
				this.setData({
					ifJoined: 1
				})
				//是否为队长
				if (this.data.teamDetail._openid == app.globalData.openid) {
					this.setData({
						ifLeader: 1
					})
				}
			}
		}
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
	join() {
		if (this.data.ifLeader) {
			//已经加入了
			wx.showToast({
				title: '你已是队长',
				icon: 'none'
			})
			return
		}
		if (this.data.ifJoined) {
			//已经加入了
			wx.showToast({
				title: '你已加入该队伍',
				icon: 'none'
			})
			return
		}
		//云函数添加memberUndetermined到数据库(还没写)
		wx.showToast({
			title: '申请成功',
			icon: 'none'
		})
	}
})