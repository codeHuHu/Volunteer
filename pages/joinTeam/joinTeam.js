// pages/jointeam/jointeam.js
const db = wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		teamList: [],
		keyword: '',
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
		this.getData()
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
	getData() {
		db.collection('TeamInfo').get()
			.then(res => {
				this.setData({
					teamList: res.data
				})
				wx.stopPullDownRefresh()
			})
			.catch(console.error)
	},
	toteamdetail(e) {
		wx.navigateTo({
			url: '/pages/teamDetail/teamDetail?info=' + encodeURIComponent(JSON.stringify(this.data.teamList[e.currentTarget.dataset.index])),
		})
	},
	getkeyword(e) {
		console.log(e.detail.value)
		this.setData({
			keyword: e.detail.value
		})

	},
	search() {
		wx.showLoading({
			title: '搜索中...',
			mask: true
		})
		var that = this
		//搜索栏不为空
		if (this.data.keyword) {
			wx.cloud.callFunction({
				name: 'searchTeam',
				data: {
					collection: 'TeamInfo',
					keyword: this.data.keyword,
					name: 'teamName'
				}
			})
				.then(res => {
					console.log(res.result)
					that.setData({
						teamList: res.result
					})
					wx.hideLoading()
				})
		}
		else {
			this.getData();
		}
	}
})