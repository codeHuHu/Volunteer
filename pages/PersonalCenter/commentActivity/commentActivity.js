// pages/newActivity/newActivity.js
const db = wx.cloud.database()
const app = getApp()

Page({
	data: {
		picker: '',
		index1: '',
		index: null,
		modalName: null,
		tempId: null,
		tempValue: null,
		arrayName: '',
		signInList: [], //签到表
		imgList: [], //活动图片
		people: [], //活动人员
		checkBox: [{
			id: '',
			name: '',
			excellent: true,
			isCome: true,
			feedback: ''
		}],
		members: [],
		count: 0,
		id: ''
	},
	onLoad() {
	},
	onReady() {
	},
	onShow() {
		if (this.data.activityId && this.data.activityId != this.data.id) {
			this.data.id = this.data.activityId
			console.log('有与之前不相等的ActivityId了,可以开始获取数据库')
			//从PikerChange复制下来的
			db.collection('ActivityInfo')
				.doc(this.data.activityId)
				.get()
				.then(res => {
					console.log(res.data)
					this.setData({
						result: res.data,
					})
				}).then(() => {
					var result = this.data.result
					var nameList = []
					var members = []
					result.joinMembers.forEach(item => {
						members.push(item.info.openid)
					})
					console.log(members)
					this.setData({
						id: result._id
					})
					//如果是已经评价过的内容
					if (result.isFeedback == 1) {
						var newArray = []
						const Infos = result.feedback.membersInfo
						for (var i in Infos) {
							var item = {
								id: Infos[i].id,
								info: Infos[i].info,
								excellent: Infos[i].excellent,
								isCome: Infos[i].isCome,
								feedback: Infos[i].feedback,
								serviceSpan: Infos[i].serviceSpan,
								posName: Infos[i].posName,
								aliPay: Infos[i].aliPay,
								bankType: Infos[i].bankType,
								bankCardNumber: Infos[i].bankCardNumber,
							}
							newArray.push(item)
						}
						console.log(newArray)
						this.setData({
							imgList: result.feedback.imgList,
							checkBox: newArray,
							signInList: result.feedback.signInList
						})
					}
					else {
						this.setData({
							imgList: [],
							signInList: []
						})
						var tmp = this.data.result.joinMembers
						const newArray = []
						for (var l = 0; l < tmp.length; l++) {
							let TS = this.data.result.serviceTimeSpan[tmp[l].posIdx[0]]
							const item = {
								id: l,
								info: tmp[l].info,
								excellent: true,
								isCome: true,
								feedback: '',
								serviceSpan: TS.date+' '+TS.time,
								posName: tmp[l].posName,
								aliPay: tmp[l].aliPay ? tmp[l].aliPay : '',
								bankType: tmp[l].bankType ? tmp[l].bankType : '',
								bankCardNumber: tmp[l].bankCardNumber ? tmp[l].bankCardNumber : '',
							}
							newArray.push(item)
						}
						console.log(newArray)
						this.setData({
							checkBox: newArray
						})


						//db.command.in(members)
						// db.collection('UserInfo').where({
						// 	_openid: db.command.in(members)
						// }).field({
						// 	_openid: true,
						// 	userName: true,
						// 	idNumber: true,
						// 	phone: true,
						// 	college: true,
						// 	grade: true,
						// 	aliPay: true,
						// 	year: true,
						// 	school: true,
						// }).get().then(res => {
						// 	var tmp = res.data
						// 	for (var l in tmp) {
						// 		nameList.push(tmp[l])
						// 	}
						// 	const newArray = []
						// 	for (var l = 0; l < tmp.length; l++) {
						// 		const item = {
						// 			id: l,
						// 			info: tmp[l],
						// 			excellent: true,
						// 			isCome: true,
						// 			feedback: ''
						// 		}
						// 		newArray.push(item)
						// 	}
						// 	console.log(newArray)
						// 	this.setData({
						// 		checkBox: newArray
						// 	})
						// })
					}

				})
		}
		console.log('onShow')
	},
	onHide() {},
	navTo(e){
		wx.$navTo(e)
	},
	ChooseImage(e) {
		let param = e.currentTarget.dataset.param;
		wx.chooseImage({
			count: 8, //默认9
			sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
			sourceType: ['album'], //从相册选择
			success: (res) => {
				if (param === 'signInList') {
					console.log('signInList');
					if (this.data.signInList.length != 0) {
						this.setData({
							signInList: this.data.signInList.concat(res.tempFilePaths)
						})
					} else {
						this.setData({
							signInList: res.tempFilePaths
						})
					}
				} else {
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
			}
		});
	},
	ViewImage(e) {
		wx.previewImage({

			urls: e.currentTarget.dataset.urls == 'signInList' ? this.data.signInList : this.data.imgList,
			current: e.currentTarget.dataset.url
		});
	},
	DelImg(e) {
		let param = e.currentTarget.dataset.param;
		wx.showModal({
			content: '确定要删除这张图片吗？',
			cancelText: '返回',
			confirmText: '确认',
			success: res => {
				if (param === 'signInList') {
					if (res.confirm) {
						this.data.signInList.splice(e.currentTarget.dataset.index, 1);
						this.setData({
							signInList: this.data.signInList
						})
					}
				} else {
					if (res.confirm) {
						this.data.imgList.splice(e.currentTarget.dataset.index, 1);
						this.setData({
							imgList: this.data.imgList
						})
					}
				}
			}
		})
	},
	showModal(e) {
		this.setData({
			modalName: e.currentTarget.dataset.target
		})
	},
	showNGModal(e) {
		this.data.tempId = e.currentTarget.dataset.id
		const value = this.data.checkBox.find(item => item.id === e.currentTarget.dataset.id).feedback;
		this.setData({
			tempValue: value
		})
		this.showModal(e);
	},
	//出现未定义警告时，重新编译即可
	handleInput(e) {
		const btnId = this.data.tempId;
		const checkBox = this.data.checkBox.map(item => {
			if (item.id === btnId) {
				item.feedback = e.detail.value;
			}
			return item;
		});
		this.setData({
			checkBox
		});
	},
	hideModal(e) {
		this.setData({
			modalName: null
		})
	},
	ChooseIsCome(e) {
		let items = this.data.checkBox;
		let values = e.currentTarget.dataset.value;
		for (let i = 0, lenI = items.length; i < lenI; ++i) {
			if (items[i].id === values) {
				items[i].isCome = !items[i].isCome;
				items[i].excellent = items[i].isCome;
				break
			}
		}
		this.setData({
			checkBox: items
		})
		console.log(this.data.checkBox);
	},
	ChooseCheckbox(e) {
		let items = this.data.checkBox;
		let values = e.currentTarget.dataset.value;
		for (let i = 0, lenI = items.length; i < lenI; ++i) {
			if (items[i].id === values) {
				items[i].excellent = !items[i].excellent;
				break
			}
		}
		this.setData({
			checkBox: items
		})
	},
	commitfb() {
		if (!this.data.id) {
			wx.showToast({
				title: '请选择活动',
				icon: 'error'
			})
			return
		}
		console.log('执行提交中')
		let uploadTask = [
			[],
			[]
		]
		let reserved = [[], []]
		//签到表
		for (let i in this.data.signInList) {
			if (this.data.signInList[i].includes('tmp')) {
				uploadTask[0].push(this.uploadFile(this.data.signInList[i]))
			}
			else {
				reserved[0].push(this.data.signInList[i])
			}

		}
		//活动图片
		for (let i in this.data.imgList) {
			if (this.data.imgList[i].includes('tmp')) {
				uploadTask[1].push(this.uploadFile(this.data.imgList[i]))
			}
			else {
				reserved[1].push(this.data.imgList[i])
			}
		}
		console.log(uploadTask)
		console.log(reserved)
		//等待签到表上传
		wx.showLoading({
			title: '上传中',
		})
		Promise.all(uploadTask[0])
			.then(result => {
				let signInList = reserved[0].concat(result)
				//等待活动图片上传
				Promise.all(uploadTask[1])
					.then(result => {
						let imgList = reserved[1].concat(result)

						wx.cloud.callFunction({
							name: 'commentActivity',
							data: {
								collectionName: 'ActivityInfo',
								docName: this.data.id,
								//操作变量
								commentForm: {
									isFeedback: 1,
									feedback: {
										signInList,
										membersInfo: this.data.checkBox ? this.data.checkBox : null,
										imgList,
									}
								}
							}
						}).then(res => {
							wx.hideLoading()
							console.log('更新成功', res);
							wx.navigateBack()
							// 在此处执行其他操作
						})


					})
			})
	},
	uploadFile(filePath) {
		//返回上传文件后的信息
		return new Promise(function (callback) {
			wx.cloud.uploadFile({
				cloudPath: './COMMENT/' + new Date().getTime(),
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
})