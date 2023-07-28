// pages/newActivity/newActivity.js
const db = wx.cloud.database()
const app = getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
		currentDate: '',
		beginDate: '',
		deadDate: '',
		endDate: '',
		startTime: '00:00',
		endTime: '00:00',
		deadTime: '00:00',
		tagList: ['党建引领', '乡村振兴', '新时代文明实践（文化/文艺/体育）', '科普科教', '社区/城中村治理', '环境保护', '弱势群体帮扶', '志愿驿站值班', '其他'],
		picker: [''],
		inputValue: '', // 清空输入框的值
		showLightButton: [], // 控制按钮显示高光
		index: '',
		tagIndex: '',
		ActName: '',
		holder: '',
		teamName: '',
		inNum: 0,
		outNum: 0,
		actAddress: '',
		intro: '',
		Phone: '',
		imgList: []
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		// const currentDate = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
		const currentDate = new Date().toISOString().slice(0, 10);

		const currentTime = new Date().toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit'
		});
		console.log(currentTime)
		this.setData({
			currentDate: currentDate,
			beginDate: currentDate,
			startTime: currentTime,
			endTime: currentTime,
			deadDate: currentDate,
			deadTime: currentTime,
			picker: app.globalData.team
		});

		db.collection('TeamInfo')
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
				title: '当前设置的时间有误！请重新设置',
			});
			setTimeout(() => {
				wx.hideToast()
			}, 2000); // 延迟 2000 毫秒后执行

			return; // 结束函数执行，以免继续执行下方的 setData
		}
	},

	bindStartChange: function (e) {
		// let combinedStartStr = this.data.beginDate;
		// let combinedEndStr = e.detail.value;
		// let start = new Date(combinedStartStr).getTime();
		// let end = new Date(combinedEndStr).getTime();
		// this.checkTime(start, end);
		this.setData({
			beginDate: e.detail.value,
			deadDate: e.detail.value
		})
		//console.log(e.detail.value)
	},
	binddeadChange: function (e) {
		// let combinedStartStr = this.data.beginDate;
		// let combinedEndStr = e.detail.value;
		// let start = new Date(combinedStartStr).getTime();
		// let end = new Date(combinedEndStr).getTime();
		// this.checkTime(start, end);
		this.setData({
			deadDate: e.detail.value
		})
	},

	bindSTimeChange: function (e) {
		let combinedStartStr = this.data.beginDate + ' ' + e.detail.value;
		let combinedEndStr = this.data.beginDate + ' ' + this.data.endTime;
		//	console.log(combinedStartStr)
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end)
		// console.log(start)
		// console.log(end)
		// console.log(e.detail.value);

		this.setData({
			startTime: e.detail.value,
			deadTime: e.detail.value
		})
	},
	bindETimeChange: function (e) {
		let combinedStartStr = this.data.beginDate + ' ' + this.data.startTime;
		let combinedEndStr = this.data.beginDate + ' ' + e.detail.value;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end);
		this.setData({
			endTime: e.detail.value
		})
	},
	binddeadTimeChange: function (e) {
		this.setData({
			deadTime: e.detail.value
		})
	},

	// onConfirm(e) {
	//   const value = e.detail.value; // 获取输入框的内容
	//   const tagList = this.data.tagList; // 获取之前的内容数组
	//   tagList.push(value); // 将新的内容添加到数组中
	//   this.setData({
	// 		tagList: tagList, // 更新tagList的值
	// 		inputValue: '', // 清空输入框的值
	//   });
	// },
	handlemyTagClick(e) {
		const index = e.currentTarget.dataset.index;
		var lb = [];
		lb[index] = true;
		this.setData({
			tagIndex: index,
			showLightButton: lb, // 点击标签时显示高光
		});

		console.log(e.currentTarget.dataset.index)
		console.log(this.data.tagList[this.data.tagindex])
	},


	handleHiddenClick(e) {
		const index = e.currentTarget.dataset.index; // 获取点击的标签索引
		const tagList = this.data.tagList;
		var mytagList = []
		mytagList.push(tagList[index])
		this.setData({
			mytagList: mytagList
		})
		tagList.splice(index, 1); // 从数组中删除该索引对应的元素
		console.log(this.data.tagList);
		console.log(this.data.mytagList);

		this.setData({
			tagList: tagList,
			showCloseButton: false,
		});

	},

	PickerChange(e) {
		this.setData({
			index: e.detail.value
		})
		console.log(this.data.picker[this.data.index])
	},
	getactName(e) {
		console.log(e.detail.value)
		this.setData({
			ActName: e.detail.value
		})
		console.log(this.data.ActName)
	},
	getholder(e) {
		console.log(e.detail.value)
		this.setData({
			holder: e.detail.value
		})
	},
	getPhone(e) {
		console.log(e.detail.value)
		this.setData({
			Phone: e.detail.value
		})
	},
	getinNum(e) {
		console.log(e.detail.value)
		this.setData({
			inNum: Number(e.detail.value)
		})
	},
	getoutNum(e) {
		console.log(e.detail.value)
		this.setData({
			outNum: Number(e.detail.value)
		})
	},
	getAddress(e) {
		this.setData({
			Address: e.detail.value
		})
	},
	getintro(e) {
		console.log(e.detail.value)
		this.setData({
			intro: e.detail.value
		})
	},

	sendNew(e) {
		let combinedStartStr = this.data.beginDate + ' ' + this.data.startTime;
		let combinedEndStr = this.data.beginDate + ' ' + this.data.endTime;
		//console.log(combinedStartStr);
		//console.log(combinedEndStr);
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		//console.log(start);
		//console.log(end);
		if (end < start) {
			wx.showToast({
				icon: 'none',
				title: '开始时间和结束时间有误，请重新选择！',
			});
			setTimeout(() => {
				wx.hideToast()
			}, 2000); // 延迟 2000 毫秒后执行
		} else {

			db.collection('ActivityInfo').add({
				data: {
					actName: this.data.actName,
					holder: this.data.holder,
					phone: this.data.Phone,
					teamName: this.data.picker[this.data.index],
					inNum: this.data.inNum,
					outNum: this.data.outNum,
					inJoin: 0,
					outJoin: 0,
					serviceDate: this.data.beginDate,
					serviceSTime: this.data.startTime,
					serviceETime: this.data.endTime,
					DeadDate: this.data.deadDate,
					deadTime: this.data.deadTime,
					address: this.data.Address,
					intro: this.data.intro,
					tag: this.data.tagList[this.data.tagIndex],
					status: '1', //进行中
					ispintuan: this.data.ispintuan,
					qr_code: this.data.imgList
				},

				success(res) {
					wx.showToast({
						icon: 'success',
						title: '提交成功！',
					})
				}
			});
			setTimeout(() => {
				wx.navigateBack(),
					wx.hideToast()
			}, 2000); // 延迟 2000 毫秒后执行
		}
	},

	isPintuan(e) {
		console.log(e.detail.value)
		this.setData({
			ispintuan: e.detail.value
		})
	},
	ChooseImage() {
		wx.chooseImage({
			count: 4, //默认9
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album'], //从相册选择
			success: (res) => {
				if (this.data.imgList.length != 0) {
					this.setData({
						imgList: this.data.imgList.concat(res.tempFilePaths)
					})
				} else {
					this.setData({
						imgList: res.tempFilePaths
					})
				}
			}
		});
	},
	ViewImage(e) {
		wx.previewImage({
			urls: this.data.imgList,
			current: e.currentTarget.dataset.url
		});
	},
	DelImg(e) {
		wx.showModal({
			title: '提示',
			content: '确定要删除图片吗？',
			cancelText: '取消',
			confirmText: '确定',
			success: res => {
				if (res.confirm) {
					this.data.imgList.splice(e.currentTarget.dataset.index, 1);
					this.setData({
						imgList: this.data.imgList
					})
				}
			}
		})
	},
})