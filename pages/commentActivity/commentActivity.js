// pages/newActivity/newActivity.js
const db = wx.cloud.database()
const app = getApp()

Page({

	/**
	 * 页面的初始数据
	 */
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

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad: function () {
		// var tmpPicker = []
		// var that = this
		// db.collection('ActivityInfo').where({
		// 	_openid: app.globalData.openid
		// }).field({
		// 	_id: true,
		// 	actName: true,
		// 	joinMembers: true,
		// 	_openid: true
		// })
		// 	.get()
		// 	.then(res => {
		// 		that.setData({
		// 			actionList: res.data
		// 		})
		// 		for (var i in that.data.actionList) {
		// 			tmpPicker.push(that.data.actionList[i].actName)
		// 		}
		// 		console.log(tmpPicker)
		// 		that.setData({
		// 			picker: tmpPicker
		// 		})

		// 	}).catch(err => {
		// 		console.log(err);
		// 	})

	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {
		console.log('onReady')
	},

	/**
	 * 生命周期函数--监听页面显示
	 */
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
					var members = result.joinMembers
					this.setData({
						id: result._id
					})
					db.collection('UserInfo').where({
						_openid: db.command.in(members)
					}).field({
						_openid: true,
						userName: true,
						idNumber: true,
						phone: true,
						college: true,
						grade: true,
						aliPay: true,
						year: true,
						school: true,
					}).get().then(res => {
						var tmp = res.data
						for (var l in tmp) {
							nameList.push(tmp[l])
						}
						const newArray = []
						for (var l = 0; l < tmp.length; l++) {
							const item = {
								id: l,
								info: tmp[l],
								excellent: true,
								isCome: true,
								feedback: ''
							}
							newArray.push(item)
						}
						console.log(newArray)
						this.setData({
							checkBox: newArray
						})
					}).then(res => {

					})
				})
		}
		console.log('onShow')
	},
	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {
		console.log('onHide')
	},
	PickerChange(e) {
		wx.navigateTo({
			url: '/pages/myActivity/myActivity?mode=comment',
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
	handleInput: function (e) {
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
		console.log('执行提交中')
		let uploadTask = [
			[],
			[]
		]
		//签到表
		for (let i in this.data.signInList) {
			uploadTask[0].push(this.uploadFile(this.data.signInList[i]))
		}
		//活动图片
		for (let i in this.data.imgList) {
			uploadTask[1].push(this.uploadFile(this.data.imgList[i]))
		}
		//等待签到表上传
		Promise.all(uploadTask[0])
			.then(result => {
				let signInList = result
				//等待活动图片上传
				Promise.all(uploadTask[1])
					.then(result => {
						let imgList = result
						db.collection('ActivityInfo')
							.doc(this.data.id)
							.update({
								data: {
									isFeedback: 1,
									feedback: {
										signInList,
										membersInfo: this.data.checkBox,
										imgList,
									}
								},
								success: function (res) {

									console.log('更新成功', res);
									wx.navigateBack()
									// 在此处执行其他操作
								},
								fail: function (error) {
									console.error('更新失败', error);
								}
							})
					})
			})
	},
	uploadFile: function (filePath) {
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