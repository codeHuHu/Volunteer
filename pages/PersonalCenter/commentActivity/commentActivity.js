const app = getApp()

Page({
	data: {
		modalName: null,
		tempId: null,
		tempValue: null,
		checkImg: [], //签到表
		serviceImg: [], //活动图片
		checkBox: [{
			id: '',
			name: '',
			isExcellent: true,
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
				url: wx.$param.server['springboot'] + `/service/${that.data.activityId}`,
				method: "get",
				header: {
					'content-type': 'application/json'
				},
				//showErr: false
			}).then(res => {
				console.log(res);
				let action = res.data
				console.log(action)
				that.setData({
					action
				})
				// //如果是已经评价过的内容
				if (action.isFeedback == 1) {
					var tmp = action.joinMembers
					that.setData({
						serviceImg: action.serviceImg,
						checkImg: action.checkImg,
						//result.feedback.serviceImg
						checkBox: action.joinMembers,
						//checkImg: result.feedback.checkImg
					})
				}
				else {
					var tmp = action.joinMembers
					for (var l = 0; l < tmp.length; l++) {
						tmp[l]['posIdx'] = tmp[l].posIdx
						tmp[l]['isExcellent'] = true
						tmp[l]['isCome'] = true
						tmp[l]['feedback'] = ''
					}
					that.setData({
						checkBox: tmp,
						serviceImg: [],
						checkImg: []
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
				if (param === 'checkImg') {
					console.log('checkImg');
					if (this.data.checkImg.length != 0) {
						this.setData({
							checkImg: this.data.checkImg.concat(res.tempFilePaths)
						})
					} else {
						this.setData({
							checkImg: res.tempFilePaths
						})
					}
				} else {
					if (this.data.serviceImg.length != 0) {
						this.setData({
							serviceImg: this.data.serviceImg.concat(res.tempFilePaths)
						})
					} else {
						this.setData({
							serviceImg: res.tempFilePaths
						})
					}
				}
			}
		});
	},
	ViewImage(e) {
		wx.previewImage({
			urls: e.currentTarget.dataset.urls == 'checkImg' ? this.data.checkImg : this.data.serviceImg,
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
				if (param === 'checkImg') {
					if (res.confirm) {
						this.data.checkImg.splice(e.currentTarget.dataset.index, 1);
						this.setData({
							checkImg: this.data.checkImg
						})
					}
				} else {
					if (res.confirm) {
						this.data.serviceImg.splice(e.currentTarget.dataset.index, 1);
						this.setData({
							serviceImg: this.data.serviceImg
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
				items[i].isExcellent = items[i].isCome;
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
				items[i].isExcellent = !items[i].isExcellent;
				break
			}
		}
		this.setData({
			checkBox: items
		})
	},
	async commit() {
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

		//过滤出需要上传的图片
		let filtered_servieImg_upload = that.data.serviceImg.filter(Img => Img.toLowerCase().includes("//tmp"));
		let filtered_checkImg_upload = that.data.checkImg.filter(Img => Img.toLowerCase().includes("//tmp"));
		//过滤出不需要上传的图片
		let filtered_serviceImg = that.data.serviceImg.filter(Img => !Img.toLowerCase().includes("//tmp"));
		let filtered_checkImg = that.data.checkImg.filter(Img => !Img.toLowerCase().includes("//tmp"));

		// 群二维码 i志愿报名码简介文件
		const serviceImgPromises = that.uploadPromises(filtered_servieImg_upload);
		const checkImgPromises = that.uploadPromises(filtered_checkImg_upload);

		try {
			let [serviceImg, checkImg] = await Promise.all([serviceImgPromises, checkImgPromises]);
			serviceImg = serviceImg.concat(filtered_serviceImg)
			checkImg = checkImg.concat(filtered_checkImg)

			let tmp = that.data.checkBox
			for (let i in tmp) {
				tmp[i].isCome = Number(tmp[i].isCome)
				tmp[i].isExcellent = Number(tmp[i].isExcellent)
			}
			this.setData({
				checkBox:tmp
			})
			let form = {
				joinMembers:this.data.checkBox,
				id:this.data.id,
				serviceImg:serviceImg,
				checkImg:checkImg,
				isFeedback:1,
				timeSpan:this.data.action.timeSpan
			}
			wx.$ajax({
				url: wx.$param.server['springboot'] + "/service/update",
				method: "put",
				data: form,
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
		} catch (err) {
			console.error("上传文件失败", err);
		}


	},
	async uploadPromises(fileList) {
		let that = this;
		//如果是简介文件就记录一下名字,如果是图片就不用
		const uploadPromises = fileList.map(file => typeof file === 'object' ? that.uploadFile(file.tempFilePath, file.name, true) : that.uploadFile(file));
		return Promise.all(uploadPromises);
	},
	// 异步上传单个文件
	uploadFile(filePath, fileName = null, progress = false) {
		let that = this
		//返回上传文件后的信息
		return new Promise(function (callback) {
			console.log("promise filePath", filePath);
			const header =
			{
				'content-type': 'application/json',
				'Authorization':  wx.getStorageSync("JWT_Token")
			}
			const uploadTask = wx.uploadFile({
				url: wx.$param.server['springboot'] + '/common/upload',
				filePath: filePath,
				name: 'file',
				header:header,
				success: (res) => {
					console.log("promise res", res)
					if (progress) {
						that.setData({
							progress: 100
						})
					}

					const data = JSON.parse(res.data);
					const msg = data.msg
					console.log("msg= ",msg)
					if (fileName) {
						let tmp = {
							fileName: fileName,
							filePath: msg
						}
						callback(tmp)
					} else {
						callback(msg)
					}
				},
				fail: (error) => {
					console.log('上传图片失败', error.data + error.statusCode)
					wx.showToast({
						title: '上传失败' + error.data + error.statusCode,
						icon: "none"
					})
					console.log(err)
				},
			})
			//监听进度
			if (progress) {
				uploadTask.onProgressUpdate(res => {
					if (res.progress < 85) {
						that.setData({
							progress: res.progress
						})
					}
				})
			}
		})
	},
})