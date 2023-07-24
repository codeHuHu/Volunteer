// pages/datail/detail.js

let loading = false;
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		hours: '',
		minutes: '',
		//志愿者是否参加了此次志愿,需要通过数据库来获取,暂未完善
		volunteerStatus: 0
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function (options) {
		var that = this
		that.data.id = options.id
		console.log(options.id)
		wx.cloud.database().collection('ActivityInfo').doc(that.data.id).get({
			success(res) {
				var startTime = res.data.serviceSTime
				var endTime = res.data.serviceETime

				var startMinutes = parseInt(startTime.split(":")[0]) * 60 + parseInt(startTime.split(":")[1]);
				var endMinutes = parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

				// 计算时间差（以分钟为单位）
				var duration = endMinutes - startMinutes;

				// 将时间差转换为小时和分钟
				var hours = Math.floor(duration / 60);
				var minutes = duration % 60;

				that.setData({
					actions: res.data,
					hours: hours,
					minutes: minutes
				})
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
	
	/**
	 * 轻提示展示
	 * @param {*} status 
	 * @param {*} message 
	 * @param {*} time 
	 * @param {*} fun 
	 */
	setShow(status, message, time = 2000, fun = false) {
		if (loading) {
			return
		}
		loading = true;
		try {
			this.setData({
				status,
				message,
				time,
				show: true,
			})
			setTimeout(() => {
				this.setData({
					show: false,
				})
				loading = false;
				// 触发回调函数
				if (fun) {
					this.end()
				}
			}, time)
		} catch {
			loading = false;
		}
	},
	showModal(e) {
		this.setData({
			modalName: e.currentTarget.dataset.target
		})


	},
	hideModal(e) {
		//	console.log(e)
		var a = e.currentTarget.dataset.target
		if (a == 'signUp') {
			this.setData({
				volunteerStatus: 1
			})
			this.setShow("error", "您已报名");
		} else if (a == 'cancle_signUp') {
			this.setData({
				volunteerStatus: 0
			})
			this.setShow("error", "您已取消报名");
		}
		this.setData({
			modalName: null
		})
	},
	toggle(e) {
		var anmiaton = e.currentTarget.dataset.class;
		var that = this;
		that.setData({
			animation: anmiaton
		})
		setTimeout(function () {
			that.setData({
				animation: ''
			})
		}, 1000)
	},
	previewImage(e) {
		wx.previewImage({
			urls: ['/images/青协头像.png'],
		})
	}
})