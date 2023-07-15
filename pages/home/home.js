// pages/home/home.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: 123,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    wx.setNavigationBarTitle({
      title: '首页',
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
  onShow: function () {
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
  NavChange(e) {
    this.setData({
      PageCur: e.currentTarget.dataset.cur
    })
  },
  toZhiyuanfuwu() {
    wx.navigateTo({
      url: '/pages/volunteerService/volunteerService',
    })
  },
  tomine(event) {
    wx.navigateTo({
      url: '/pages/mine/mine',
    })
  },
  tojointeam() {
    wx.navigateTo({
      url: '/pages/jointeam/jointeam',
    })
  },
  toregister() {
    wx.navigateTo({
      url: '/pages/accountSignUp/accountSignUp',
    })
  },
  tomine() {
    wx.reLaunch({
      url: '/pages/mine/mine',
    })
  },
  todetail() {
    wx.navigateTo({
      url: '/pages/detail/detail',
    })
  }
})