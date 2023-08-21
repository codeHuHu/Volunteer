// pages/newActivity/newActivity.js
const db = wx.cloud.database()
let loading = false;
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
		actName: '',
		teamName: '',
		inNum: 0,
		outNum: 0,
		Address: '',
		intro: '',
		temp_imgList: [],
		//三个时间戳
		starttimestamp: '',
		endtimestamp: '',
		deadtimestamp: ''
	},

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		// const currentDate = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '-');
		//const currentDate = new Date()
		this.setData({
			holder: app.globalData.Name,
			Phone: app.globalData.phone,
			myPos: app.globalData.pos
		})
		const currentDate = new Date().toISOString().slice(0, 10);
		const currentTime = new Date().toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit'
		}).slice(0, 8);
		var teamPicker = ['不勾选队伍'].concat(app.globalData.team)
		this.setData({
			currentDate: currentDate,
			beginDate: currentDate,
			startTime: currentTime,
			endTime: currentTime,
			deadDate: currentDate,
			deadTime: currentTime,
			picker: teamPicker
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
		let combinedStartStr = e.detail.value + ' ' + this.data.startTime;
		let combinedEndStr = e.detail.value + ' ' + this.data.endTime;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		let dead = e.detail.value + ' ' + this.data.deadTime;
		let deadstamp = new Date(dead).getTime()

		this.setData({
			beginDate: e.detail.value,
			deadDate: e.detail.value,
			starttimestamp: start,
			endtimestamp: end,
			deadtimestamp: deadstamp
		})
	},
	binddeadChange: function (e) {
		let dead = e.detail.value + ' ' + this.data.deadTime;
		let deadstamp = new Date(dead).getTime()

		this.setData({
			deadDate: e.detail.value,
			deadtimestamp: deadstamp
		})
	},

	bindSTimeChange: function (e) {
		let combinedStartStr = this.data.beginDate + ' ' + e.detail.value;
		let combinedEndStr = this.data.beginDate + ' ' + this.data.endTime;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end)
		let dead = this.data.deadDate + ' ' + e.detail.value;
		let deadstamp = new Date(dead).getTime()
		this.setData({
			startTime: e.detail.value,
			deadTime: e.detail.value,
			starttimestamp: start,
			endtimestamp: end,
			deadtimestamp: deadstamp
		})
	},
	bindETimeChange: function (e) {
		let combinedStartStr = this.data.beginDate + ' ' + this.data.startTime;
		let combinedEndStr = this.data.beginDate + ' ' + e.detail.value;
		let start = new Date(combinedStartStr).getTime();
		let end = new Date(combinedEndStr).getTime();
		this.checkTime(start, end);
		let dead = this.data.deadDate + ' ' + this.data.deadTime;
		let deadstamp = new Date(dead).getTime()
		this.setData({
			endTime: e.detail.value,
			endtimestamp: end,
			starttimestamp: start,
			deadtimestamp: deadstamp
		})
	},
	binddeadTimeChange: function (e) {
		let dead = this.data.deadDate + ' ' + e.detail.value;
		let deadstamp = new Date(dead).getTime()
		this.setData({
			deadTime: e.detail.value,
			deadtimestamp: deadstamp
		})
	},

	handlemyTagClick(e) {
		const index = e.currentTarget.dataset.index;
		var lb = [];
		lb[index] = true;
		this.setData({
			tagIndex: index,
			showLightButton: lb, // 点击标签时显示高光
		});

		console.log(e.currentTarget.dataset.index)
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
		this.setData({
			Phone: e.detail.value
		})
	},
	getinNum(e) {
		this.setData({
			inNum: Number(e.detail.value)
		})
	},
	getoutNum(e) {
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
		//检测是否输入完整
		if (this.check() == 0) {
			return
		}
		console.log('执行提交中')

		//创建异步上传任务数组
		let uploadTask = []
		for (let i in this.data.temp_imgList) {
			uploadTask.push(this.uploadFile(this.data.temp_imgList[i]))
		}
		Promise.all(uploadTask)
			.then(result => {
				//等待完所有异步上传任务完成后
				this.setData({
					cloud_imgList: result
				}),
					//用逗号,表示setData完了之后再上传数据库
					//若不用,则异步执行,则还没setData就执行上传数据库,导致cloud_imgList无值
					db.collection('ActivityInfo').add({
						data: {
							//string
							actName: this.data.actName,
							holder: this.data.holder,
							phone: this.data.Phone,
							intro: this.data.intro,
							status: this.data.myPos == 1 ? '0' : '1',// 如果pos为1，活动状态为0：待审核，否则为1：进行中
							address: this.data.Address,
							//number
							inJoin: 0,
							outJoin: 0,
							serviceStamp: this.data.starttimestamp,
							serviceEstamp: this.data.endtimestamp,
							deadtimestamp: this.data.deadtimestamp,
							ispintuan: Number(this.data.ispintuan),
							inNum: this.data.inNum,
							outNum: this.data.outNum,
							teamName: this.data.index == 0 ? "" : this.data.picker[this.data.index],
							tag: this.data.tagList[this.data.tagIndex],
							//else	
							qr_code: this.data.cloud_imgList
						},
						success(res) {
							if (that.data.myPos == 1) {
								wx.showToast({
									icon: 'loading',
									title: '请尽快联系管理员审核并发布',
								})
							}
							else {
								this.setShow("success", "发布成功");
							}

						}
					});
			})
		setTimeout(() => {
			wx.navigateBack(),
				wx.hideToast()
		}, 1000); // 延迟 2000 毫秒后执行

	},
	isPintuan(e) {
		console.log(e.detail.value)
		this.setData({
			ispintuan: e.detail.value
		})
	},
	ChooseImage() {

		wx.chooseMedia({
			count: 4, //默认9
			mediaType: ['image'],
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], //从相册选择
			success: (res) => {
				console.log(res)
				if (this.data.temp_imgList.length != 0) {
					var t = []
					for (var i in res.tempFiles) {
						t.push(res.tempFiles[i].tempFilePath)
					}
					this.setData({
						temp_imgList: this.data.temp_imgList.concat(t)
					})
				} else {
					var t = []
					for (var i in res.tempFiles) {
						t.push(res.tempFiles[i].tempFilePath)
					}
					this.setData({
						temp_imgList: t
					})
				}
			}
		});
	},
	ViewImage(e) {
		wx.previewImage({
			urls: this.data.temp_imgList,
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
					this.data.temp_imgList.splice(e.currentTarget.dataset.index, 1);
					this.setData({
						temp_imgList: this.data.temp_imgList
					})
				}
			}
		})
	},
	// 异步上传单个文件
	uploadFile: function (filePath) {
		//返回上传文件后的信息
		return new Promise(function (callback) {
			wx.cloud.uploadFile({
				cloudPath: './QR_CODE/' + new Date().getTime(),
				filePath: filePath,
				success: res => {
					console.log('上传图片成功')
					callback(res.fileID)
				},
				fail: err => {
					console.log('上传图片失败', res)
					wx.showToast({
						title: '上传失败',
						icon: "none"
					})
					console.log(err)
				}
			})
		})
	},
	check() {
		if (!this.data.ispintuan) {
			this.setShow("error", "请勾选是否拼团");
			return 0
		}
		if (!this.data.holder || !this.data.Phone) {
			this.setShow("error", "请重启本小程序");
			return 0
		}
		if (this.data.actName.length == 0 || this.data.intro.length == 0 || this.data.Address.length == 0) {
			this.setShow("error", "名称/地点/简介错误");
			return 0
		}
		if (this.data.index != 0) {
			if (!this.data.inNum) {
				if (this.data.inNum != 0) {
					this.setShow("error", "队内招募错误");
					return 0
				}
			}
		}
		if (!this.data.outNum) {
			if (this.data.outNum != 0) {
				this.setShow("error", "公开招募错误");
				return 0
			}
		}
		if (!this.data.index) {
			this.setShow("error", "未选定队伍");
			return 0
		}
		if (!this.data.tagIndex) {
			if (this.data.tagIndex != 0) {
				this.setShow("error", "未选择标签");
				return 0
			}
		}
		if (this.data.starttimestamp < this.data.deadtimestamp) {
			this.setShow("error", "截止时间有误");
			return 0
		}
		if (this.data.endtimestamp < this.data.starttimestamp) {
			this.setShow("error", "开始和结束时间有误");
			return 0
		}
		//return 1
	},
	/**
	 * 轻提示展示
	 * @param {*} status 
	 * @param {*} message 
	 * @param {*} time 
	 * @param {*} fun 
	 */
	setShow(status, message, time = 1000, fun = false) {
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
})