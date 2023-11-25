// pages/newActivity/newActivity.js
const db = wx.cloud.database()
const app = getApp()

Page({
	data: {
		modalName: null,
		tempId: null,
		tempValue: null,
		signInList: [], //签到表
		imgList: [], //活动图片
		checkBox: [{
			id: '',
			name: '',
			excellent: true,
			isCome: true,
			feedback: ''
		}],
		id: ''
	},
	onLoad() {
	},
	onReady() {
	},
	onShow() {
		let that = this
		if (that.data.activityId && that.data.activityId != that.data.id) {
			that.setData({
				id: that.data.activityId
			})

			wx.$ajax({
				url: wx.$param.server['fastapi'] + "/service/show",
				method: "post",
				data: {
					"id": that.data.activityId,
				},
				header: {
					'content-type': 'application/json'
				},
				//showErr: false
			}).then(res => {
				let action = res.data[0]
				that.setData({
					action
				})
				// //如果是已经评价过的内容
				if (action.isFeedback == 1) {
					var tmp = action.joinMembers
					that.setData({
						imgList: [],
						signInList: [],
						//result.feedback.imgList
						checkBox: action.joinMembers,
						//signInList: result.feedback.signInList
					})
				}
				else {
					var tmp = action.joinMembers
					for (var l = 0; l < tmp.length; l++) {
						tmp[l]['serviceTime'] = action.serviceTimeSpan[tmp[l].posIdx[0]]['date']
						tmp[l]['excellent'] = true
						tmp[l]['isCome'] = true
						tmp[l]['feedback'] = ''
					}
					that.setData({
						checkBox: tmp,
						imgList: [],
						signInList: []
					})
				}
			}).catch(err => {
				console.log(err);
			})
		}
	},
	navTo(e) {
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
	commit() {
		let that = this

		if (!that.data.id) {
			wx.showToast({
				title: '请选择活动',
				icon: 'error'
			})
			return
		}
		wx.showLoading({
			title: '上传中',
		})

		let checkBox = []
		let tmp = that.data.checkBox
		for (let i in tmp) {
			let item = {
				id: tmp[i].id,
				isCome: tmp[i].isCome,
				excellent: tmp[i].excellent,
				feedback: tmp[i].feedback
			}
			checkBox.push(item)
		}
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/service/comment",
			method: "post",
			data: {
				serviceId: that.data.id,
				checkBox: checkBox,
				serviceImg: [],
				checkImg: []
			},
			header: {
				'content-type': 'application/json'
			},
			//showErr: false
		}).then(res => {
			console.log(res);
			if (res['msg'] == "评价成功") {
				wx.hideLoading()
				wx.navigateBack()
			}

		}).catch(err => {
			console.log(err);
			wx.hideLoading()
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