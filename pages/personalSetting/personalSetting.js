// pages/personalSetting/personalSetting.js
const app =getApp()
const db =wx.cloud.database()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		showModal: null,

		loading:false
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		console.log('abcde')
		this.setData({
			openid:app.globalData.openid,
			name:app.globalData.name,
			phone:app.globalData.phone,
			aliPay:app.globalData.aliPay,
			school:app.globalData.school,
			grade:app.globalData.grade,
			class:app.globalData.class,
			team:app.globalData.team[0]
		})
	},
	tohome()
		{
			wx.navigateTo({
				url: '/pages/newTeam/newTeam',
			})
		},
	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */

	openModal: function (e) {
		console.log('打开模态框')
    this.setData({
      showModal: e.currentTarget.dataset.target // 打开模态框
    });
  },

  closeModal: function () {
    this.setData({
      showModal:null // 关闭模态框
    });
	},
	
	handleNameInput: function (e) {
		console.log(e.detail.value)
    this.setData({
      name: e.detail.value // 更新昵称数据
		});
	
	},
	handleSchoolInput:function(e)
	{
		this.setData({
      school: e.detail.value // 更新昵称数据
		});
	},
	handleGradeInput:function(e)
	{
		this.setData({
      grade: e.detail.value // 更新昵称数据
		});
	},
	handleClassInput:function(e)
	{
		this.setData({
      class: e.detail.value // 更新昵称数据
		});
	},
	handlePhoneInput:function(e)
	{
		this.setData({
      phone: e.detail.value // 更新昵称数据
		});
	},
	handlealiPayInput:function(e)
	{
		this.setData({
      aliPay: e.detail.value // 更新昵称数据
		});
	},
	handleSave: function () {
    // 调用API保存昵称到本地存储或后台服务器
    wx.showToast({
      title: '保存成功',
      icon: 'success'
    });
    this.closeModal(); // 保存后关闭模态框
   // wx.navigateBack(); // 返回上一页
  },
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
		console.log('隐藏')
	},

	/**
	 * 生命周期函数--监听页面卸载
	 */
		onUnload() {
			wx.showLoading({
				title: '(数据上传中...)',
				mask:true
			})
			console.log(this.data.grade)
			console.log('修改')
			db.collection('UserInfo').where({
				_openid:this.data.openid
			}).update({
				data:
				{
					username:this.data.name,
					school:this.data.school,
					grade:this.data.grade,
					class:this.data.class,
					phone:this.data.phone,
					aliPay:this.data.aliPay,
				},
				success: function (res) {
				wx.hideLoading();
					// 在此处执行其他操作
				},
				fail: function (error) {
					console.error('更新失败', error);
				}
			})
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