// pages/teamdetail/teamdetail.js
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		isJoin: 0,
		isLeader: 0,
		id: '',

	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		if (options.info) {
			let info = JSON.parse(decodeURIComponent(options.info))
			console.log('传入参数并解析')
			this.setData({
				teamDetail: info,
				id: info._id
			})
		}
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		var cur = this.data.teamDetail.teamMembers
		for (var i in cur) {
			if (cur[i].openid == app.globalData.openid) {
				//已在队伍当中了
				this.setData({
					isJoin: 1
				})
				//是否为队长
				if (this.data.teamDetail._openid == app.globalData.openid) {
					this.setData({
						isLeader: 1
					})
				}
			}
		}
	},

	/**
	 * 生命周期函数--监听页面显示
	 */


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
		if (this.data.isLeader) {
			//已经加入了
			wx.showToast({
				title: '你已是队长',
				icon: 'none'
			})
			return
		}
		if (this.data.isJoin) {
			//已经加入了
			wx.showToast({
				title: '你已加入该队伍',
				icon: 'none'
			})
			return
		} //

		//云函数添加memberUndetermined到数据库
		wx.cloud.callFunction({
			name: 'updateJoinTeam',
			data: {
				collectionName: 'TeamInfo',
				docName: this.data.id,
				myId: app.globalData.id,
				myName: app.globalData.name,
				myPhone: app.globalData.phone,
				//操作变量
				Add: 1,
				//newTeamMembers:result
			}
		})
			.then(res => {
				//更改按钮状态
				this.setData({
					isJoin: 1
				})
				wx.showToast({
					title: '申请成功',
					icon: 'none'
				})
			})


	},
	members() {
		wx.navigateTo({
			url: '/pages/teamMembers/teamMembers?id=' + this.data.id,
		})
	}
})