// pages/newActivity/newActivity.js
Page({

	/**
	 * 页面的初始数据
	 */
  data: {
		startDate: '',
		endDate:'',
		startTime:'00:00', 
		endTime:'00:00',
		tagList:[],
		inputValue: '', // 清空输入框的值
		showCloseButton: false, // 控制关闭按钮的显示
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function() {
		const currentDate = new Date().toLocaleDateString().split('/').join('-');
    this.setData({
			startDate: currentDate,
			endDate:currentDate,
    });
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
	checkTime(start, end) {  
		if (end < start) {
			wx.showToast({
				icon: 'none',
				title: '当前设置的时间有误！',
			});
			setTimeout(() => {
				wx.hideToast()
			}, 2000); // 延迟 2000 毫秒后执行
			return; // 结束函数执行，以免继续执行下方的 setData
		}
	},
	bindStartChange: function (e) {
		let combinedStartStr = e.detail.value + ' ' + this.data.startTime;
		let combinedEndStr = this.data.endDate + ' ' + this.data.endTime;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end);
		this.setData({
			startDate: e.detail.value
		})
	},
	bindEndChange: function(e) {
		let combinedStartStr = this.data.startDate + ' ' + this.data.startTime;
		let combinedEndStr = e.detail.value + ' ' + this.data.endTime;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end);
		this.setData({
			endDate: e.detail.value
		});
	},
	bindSTimeChange:function(e) {
		let combinedStartStr = this.data.startDate + ' ' + e.detail.value;
		let combinedEndStr = this.data.endDate + ' ' + this.data.endTime;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end);
		console.log(e);
		this.setData({
			startTime:e.detail.value
		})
	},	
	bindETimeChange:function(e) {
		let combinedStartStr = this.data.startDate + ' ' + this.data.startTime;
		let combinedEndStr = this.data.endDate + ' ' + e.detail.value;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end);
		this.setData({
			endTime:e.detail.value
		})
	},
sendNew(e) {
	let combinedStartStr = this.data.startDate + ' ' + this.data.startTime;
	let combinedEndStr = this.data.endDate + ' ' + this.data.endTime;
	console.log(combinedStartStr);
	console.log(combinedEndStr);
	let start = new Date(combinedStartStr).getTime();
	let end = new Date(combinedEndStr).getTime();
	console.log(start);
	console.log(end);
	if (end < start) {
		wx.showToast({
			icon: 'none',
			title: '开始时间和结束时间有误，请重新选择！',
		});
		setTimeout(() => {
			wx.hideToast()
		}, 2000); // 延迟 2000 毫秒后执行
	}
	else {
		wx.showToast({
			icon: 'success',
			title: '提交成功！',
		});
		setTimeout(() => {
			wx.hideToast()
		}, 2000); // 延迟 2000 毫秒后执行
	}
},

  onConfirm(e) {
    const value = e.detail.value; // 获取输入框的内容
    const tagList = this.data.tagList; // 获取之前的内容数组
    tagList.push(value); // 将新的内容添加到数组中
    this.setData({
			tagList: tagList, // 更新tagList的值
			inputValue: '', // 清空输入框的值
    });
	},
	handleTagClick() {
    this.setData({
      showCloseButton: true, // 点击标签时显示关闭按钮
    });
  },
  handleCloseClick(e) {
    const index = e.currentTarget.dataset.index; // 获取点击的标签索引
    const tagList = this.data.tagList;
		tagList.splice(index, 1); // 从数组中删除该索引对应的元素
		console.log(this.data.tagList);
    this.setData({
      tagList: tagList,
      showCloseButton: false,
    });
  },
})