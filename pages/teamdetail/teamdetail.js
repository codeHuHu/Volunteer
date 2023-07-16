// pages/teamdetail/teamdetail.js
const app=getApp()	
Page({

	/**
	 * 页面的初始数据
	 */
	data: {

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
  join()
  {
    if (app.globalData.userInfo == null) {
      
      wx.showModal({
				title: '提示',
				content: '你未注册，请前往注册认证',
				success(res){
          if(res.confirm)
          {
						console.log("成功")
						wx.navigateTo({
							url: '/pages/home/home',
						})
					}
					else {
						
					}
				}
			})
	}
		else {
		wx.showToast({
			title: '申请成功，等待管理员验证通过',
		})
		}
}
})