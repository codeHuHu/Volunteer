// pages/newActivity/newActivity.js
const db = wx.cloud.database()
let loading = false;
const app = getApp()
Page({
	data: {
		serviceTimeSpan: [],//服务时间段
		beginDate: '',//服务阶段开始日期(用于添加服务时间段)
		startTime: '',//服务阶段开始时刻(用于添加服务时间段)
		endTime: '',//服务阶段结束时刻(用于添加服务时间段)
		deadDate: '',//截止日期
		deadTime: '',//截止时刻

		inputValue: '', // 清空输入框的值
		showLightButton: [], // 控制按钮显示高光
		actName: '',
		teamName: '',
		outNum: 0,
		address: '',
		intro: '',
		temp_imgList: [], //群二维码
		temp_imgList2: [], //i志愿报名码
		tagList: ['党建引领', '乡村振兴', '新时代文明实践（文化/文艺/体育）', '科普科教', '社区/城中村治理', '环境保护', '弱势群体帮扶', '志愿驿站值班', '其他'],
		picker: [
			'方案策划',
			'现场执行',
			'美工设计',
			'新媒体宣传',
			'文案撰写',
			'主持人',
			'小队长',
			'其他（可自由编辑)'
		],
	},
	onLoad: function () {
		this.setData({
			holder: app.globalData.name,
			phone: app.globalData.phone,
			myPos: app.globalData.position
		})
		const currentDate = new Date().toISOString().slice(0, 10);
		const currentTime = new Date().toLocaleTimeString('en-US', {
			hour12: false,
			hour: '2-digit',
			minute: '2-digit'
		}).slice(0, 5);
		console.log(currentDate, currentTime)
		this.setData({
			beginDate: currentDate,//服务开始日期
			startTime: currentTime,//服务阶段开始时刻
			endTime: "23:59",//服务阶段结束时刻
			deadDate: currentDate,//截止日期
			deadTime: currentTime,//截止时刻
		});
	},
	onReady() {
		this.handleTotalNum()
	},
	hideModal() {
		this.setData({
			modalName: null
		})
	},
	checkTime(start, end) {
		if (end < start) {
			wx.showToast({
				icon: 'none',
				title: '当前设置的时间有误！请重新设置',
			});
			setTimeout(() => {
				wx.hideToast()
			}, 1000); // 延迟 2000 毫秒后执行

			return; // 结束函数执行，以免继续执行下方的 setData
		}
	},
	//添加时间段的日期选择时
	bindStartChange: function (e) {
		this.setData({
			beginDate: e.detail.value,
			deadDate: e.detail.value,
		})
	},
	//添加时间段的开始时间
	bindSTimeChange: function (e) {
		this.setData({
			startTime: e.detail.value,
			deadTime: e.detail.value,
		})
	},
	bindETimeChange: function (e) {
		let combinedStartStr = this.data.beginDate + ' ' + this.data.startTime;
		let combinedEndStr = this.data.beginDate + ' ' + e.detail.value;
		this.checkTime(new Date(combinedStartStr).getTime(), new Date(combinedEndStr).getTime());
		this.setData({
			endTime: e.detail.value,
		})
	},
	//填写截止日期的时刻
	bindDeadTimeChange: function (e) {
		this.setData({
			deadTime: e.detail.value,
		})
	},
	//填写截止日期的日期
	bindDeadDateChange: function (e) {
		this.setData({
			deadDate: e.detail.value,
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
		this.setData({
			tagList: tagList,
			showCloseButton: false,
		});

	},
	getactName(e) {
		console.log(e.detail.value)
		this.setData({
			actName: e.detail.value
		})
	},
	getholder(e) {
		console.log(e.detail.value)
		this.setData({
			holder: e.detail.value
		})
	},
	getPhone(e) {
		this.setData({
			phone: e.detail.value
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
			address: e.detail.value
		})
	},
	getintro(e) {
		console.log(e.detail.value)
		this.setData({
			intro: e.detail.value
		})
	},
	getTeamName(e) {
		this.setData({
			teamName: e.detail.value
		})
	},
	getElsePositon(e) {
		console.log(e.detail.value)
		this.setData({
			elsePosition: e.detail.value
		})
	},
	sendNew(e) {
		//检测是否输入完整
		if (this.check() == 0) {
			return
		}
		console.log('执行提交中')

		//创建异步上传任务数组
		let uploadTask = [
			[],
			[]
		]
		//群二维码
		for (let i in this.data.temp_imgList) {
			uploadTask[0].push(this.uploadFile(this.data.temp_imgList[i]))
		}
		//i志愿报名码
		for (let i in this.data.temp_imgList2) {
			uploadTask[1].push(this.uploadFile(this.data.temp_imgList2[i]))
		}
		Promise.all(uploadTask[0])
			.then(result => {
				const qr_code = result
				Promise.all(uploadTask[1])
					.then(result => {
						const iZhiYuan = result
						const stamps = this.generateStamp()
						let data = {
							//string
							actName: this.data.actName,
							holder: this.data.holder,
							phone: this.data.phone,
							intro: this.data.intro,
							status: this.data.myPos >= 1 ? '1' : '0', // 如果pos为1，活动状态为0：待审核，否则为1：进行中
							address: this.data.address,
							//number
							outJoin: 0,
							outNum: this.data.outNum,

							serviceTimeSpan: this.data.serviceTimeSpan,

							serviceStartStamp: stamps[0],//服务开始时间戳
							serviceEndStamp: stamps[1],//服务结束时间戳
							deadTimeStamp: stamps[2],//截止报名时间戳

							isPintuan: Number(this.data.isPintuan),
							tag: this.data.tagList[this.data.tagIndex],

							teamName: this.data.teamName,
							qr_code,
							iZhiYuan
						}
						console.log(data)
						db.collection('ActivityInfo').add({
							data: data,
							success(res) {
								if (that.data.myPos == 1) {
									wx.showToast({
										icon: 'loading',
										title: '请尽快联系管理员审核并发布',
									})
								} else {
									this.setShow("success", "发布成功");
								}

							}

						});
					})
			})
		setTimeout(() => {
			wx.navigateBack(),
				wx.hideToast()
		}, 2000); // 延迟 2000 毫秒后执行

	},
	isPintuan(e) {
		this.setData({
			isPintuan: e.detail.value
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
	ChooseImage2() {
		wx.chooseMedia({
			count: 4, //默认9
			mediaType: ['image'],
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album', 'camera'], //从相册选择
			success: (res) => {
				console.log(res)
				if (this.data.temp_imgList2.length != 0) {
					var t = []
					for (var i in res.tempFiles) {
						t.push(res.tempFiles[i].tempFilePath)
					}
					this.setData({
						temp_imgList2: this.data.temp_imgList2.concat(t)
					})
				} else {
					var t = []
					for (var i in res.tempFiles) {
						t.push(res.tempFiles[i].tempFilePath)
					}
					this.setData({
						temp_imgList2: t
					})
				}
			}
		});
	},
	ViewImage(e) {
		let a = e.currentTarget.dataset.which == "1" ? this.data.temp_imgList : this.data.temp_imgList2
		wx.previewImage({
			urls: a,
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
	DelImg2(e) {
		wx.showModal({
			title: '提示',
			content: '确定要删除图片吗？',
			cancelText: '取消',
			confirmText: '确定',
			success: res => {
				if (res.confirm) {
					this.data.temp_imgList2.splice(e.currentTarget.dataset.index, 1);
					this.setData({
						temp_imgList2: this.data.temp_imgList2
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
		if (!this.data.isPintuan) {
			this.setShow("error", "请勾选是否拼团");
			return 0
		}
		if (!this.data.holder || !this.data.phone) {
			this.setShow("error", "请重启本小程序");
			return 0
		}
		if (this.data.actName.length == 0 || this.data.address.length == 0) {
			this.setShow("error", "名称/地点错误");
			return 0
		}
		if (!this.data.outNum) {
			if (this.data.outNum != 0) {
				this.setShow("error", "公开招募错误");
				return 0
			}
		}
		if (!this.data.tagIndex) {
			if (this.data.tagIndex != 0) {
				this.setShow("error", "未选择标签");
				return 0
			}
		}
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
	showModal(e) {
		var tmp = e.currentTarget.dataset.target
		if (tmp == 'teamName') {
			console.log('teamName')
		}
		if (tmp == 'addPosition') {
			this.setData({
				serviceSpanIndex_active: e.currentTarget.dataset.servicespanindex
			})
		}
		this.setData({
			modalName: tmp
		})
	},
	// 点击列表,收缩与展示
	click(event) {
		const index = event.currentTarget.dataset.index;
		const {
			serviceTimeSpan
		} = this.data;
		if (serviceTimeSpan[index].checked == true) {
			serviceTimeSpan[index].checked = false
		} else {
			serviceTimeSpan[index].checked = true
		}
		this.setData({
			serviceTimeSpan
		});
	},
	//生成用于提交数据库表单的时间戳
	generateStamp() {
		let tempList = this.data.serviceTimeSpan
		let serviceStartStamp = 0
		let serviceEndStamp = 0
		let deadTimeStamp = new Date(this.data.deadDate + ' ' + this.data.deadTime).getTime()
		for (let i in tempList) {
			//服务开始时间戳
			let dateTime = tempList[i].date + ' ' + tempList[i].time.split('-')[0]
			let stamp = new Date(dateTime).getTime()
			if (i == 0 || stamp < serviceStartStamp) {
				serviceStartStamp = stamp
			}
			//服务结束时间戳
			dateTime = tempList[i].date + ' ' + tempList[i].time.split('-')[1]
			stamp = new Date(dateTime).getTime()
			if (i == 0 || stamp > serviceEndStamp) {
				serviceEndStamp = stamp
			}
		}
		return [serviceStartStamp, serviceEndStamp, deadTimeStamp]
	},
	//改变选择岗位索引
	positionPickerChange(e) {
		console.log(e.detail.value)
		this.setData({
			positionPickerIndex: e.detail.value
		})
	},
	//添加服务时间段
	addServiceSpan() {
		let tempSpan = {
			date: this.data.beginDate,
			time: this.data.startTime + "-" + this.data.endTime,
			positions: [],
			checked: false
		}
		let tempList = this.data.serviceTimeSpan
		tempList.push(tempSpan)
		this.setData({
			endTime: "23:59",
			serviceTimeSpan: tempList
		})
		this.handleTotalNum();
		this.hideModal()
	},
	//删除时间段
	deleteServiceSpan(e) {
		const that = this
		wx.showModal({
			title: '提示',
			content: '是否要删除此时间段',
			success(res) {
				if (res.confirm) {
					let tempList = that.data.serviceTimeSpan
					tempList.splice(e.currentTarget.dataset.index, 1)
					that.setData({
						serviceTimeSpan: tempList
					})
					setTimeout(() => {
						that.handleTotalNum();
					}, 200);
				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})
	},
	//添加岗位
	addPosition() {
		let span = this.data.serviceSpanIndex_active
		let picker = this.data.positionPickerIndex
		if (span >= 0 && picker >= 0) {
			let tempPos = {
				//判断是已有的岗位还是自定义岗位
				name: picker == this.data.picker.length - 1 ? this.data.elsePosition : this.data.picker[picker],
				number: 1,
				joined: 0
			}
			let tempList = this.data.serviceTimeSpan
			tempList[span]['positions'].push(tempPos)
			tempList[span]['checked'] = true
			this.setData({
				serviceTimeSpan: tempList
			})
		}
		this.handleTotalNum();
		this.hideModal()
	},
	//删除岗位
	deletePosition(e) {
		const that = this
		wx.showModal({
			title: '提示',
			content: '是否要删除此岗位',
			success(res) {
				if (res.confirm) {
					let span = e.currentTarget.dataset.sindex
					let position = e.currentTarget.dataset.pindex
					if (span >= 0 && position >= 0) {
						let tempList = that.data.serviceTimeSpan
						tempList[span]['positions'].splice(position, 1)
						that.setData({
							serviceTimeSpan: tempList
						})
					}
					setTimeout(() => {
						that.handleTotalNum();
					}, 200);

				} else if (res.cancel) {
					console.log('用户点击取消')
				}
			}
		})


	},
	//岗位人数变动
	changePosNum(e) {
		let span = e.currentTarget.dataset.sindex
		let position = e.currentTarget.dataset.pindex
		let op = e.currentTarget.dataset.op
		if (span < 0 || position < 0) {
			console.log('未知错误');
			return
		}
		if (op == 'increase') {
			let tempList = this.data.serviceTimeSpan
			tempList[span]['positions'][position]['number'] += 1
			this.setData({
				serviceTimeSpan: tempList
			})
		} else if (op == 'decrease') {
			let tempList = this.data.serviceTimeSpan
			tempList[span]['positions'][position]['number'] -= 1
			//归零操作
			if (tempList[span]['positions'][position]['number'] < 0) {
				tempList[span]['positions'][position]['number'] = 0
			}
			this.setData({
				serviceTimeSpan: tempList
			})
		} else {

		}

		this.handleTotalNum();

	},
	//处理总人数
	handleTotalNum() {
		let tempList = this.data.serviceTimeSpan
		let total = 0;
		for (let i in tempList) {
			for (let j in tempList[i]['positions']) {
				total += tempList[i].positions[j].number
			}
		}
		this.setData({
			outNum: total
		})
	}
})