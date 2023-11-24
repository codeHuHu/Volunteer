const app = getApp()
let loading = false;
const db = wx.cloud.database()

const utils = require("../../../utils/date.js")
const XLSX = require('../../../utils/excel.js') //引入


Page({
	data: {
		avators: [
			'https://image.meiye.art/FlqKg5bugFQD5Qzm_QhGM7ET4Mtx?imageMogr2/thumbnail/450x/interlace/1',
			'https://image.meiye.art/FiLUT-wb9DP0-dpxRQH19HJOOJOW?imageMogr2/thumbnail/450x/interlace/1',
			'https://image.meiye.art/Fha6tqRTIwHtlLW3xuZBJj8ZXSX3?imageMogr2/thumbnail/450x/interlace/1',
			'https://image.meiye.art/FhHGe9NyO0uddb6D4203jevC_gzc?imageMogr2/thumbnail/450x/interlace/1',
			'https://image.meiye.art/FlqKg5bugFQD5Qzm_QhGM7ET4Mtx?imageMogr2/thumbnail/450x/interlace/1',
			'https://image.meiye.art/Fha6tqRTIwHtlLW3xuZBJj8ZXSX3?imageMogr2/thumbnail/450x/interlace/1',
			'https://image.meiye.art/FhHGe9NyO0uddb6D4203jevC_gzc?imageMogr2/thumbnail/450x/interlace/1'
		],
		checkMode: 0,
		constants: {
			deadTime: 'xxxxxxx',
		},
		payType: '',
		payNumber: '',
	},
	onLoad(options) {
		console.log('app.globalData:', app.globalData)
		let myInfo = wx.getStorageSync('userInfo')
		let that = this

		that.setData({
			isLogin: app.globalData.isAuth,//记录是否登录
			myInfo: myInfo,//记录个人信息
			id: options.id,//传入活动id
			//判断是否为审核页面
			checkMode: options.check ? 1 : 0
		})

		//判断是否为从转发进来的
		if (options.actions) {
			console.log('从转发进来的')
			let actions = JSON.parse(decodeURIComponent(options.actions))
			//let myInfo = wx.getStorageSync('userInfo')
			that.setData({
				actions,
				//isLogin: myInfo ? true : false,
			})
		}

		that.getService(options.id)

	},
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	onUnload() {
	},
	getService(id = null) {
		let that = this
		if (!id) {
			id = that.data.id
		}

		//获取服务
		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/service/show",
			method: "post",
			data: {
				"id": id,
			},
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			that.adjustData(res.data[0])
		}).catch(err => {
		})
	},
	//调整数据
	adjustData(res) {
		let that = this

		//如果是补贴活动,读取本地数据
		if (res.isSubsidy) {
			that.setData({
				payType: res.payType,
			})
			let payInfo = wx.getStorageSync('payInfo')
			if (payInfo) {
				that.setData({
					payNumber: payInfo[res.payType]
				})
			}
		}

		let activeIdx = -1
		if (res.joinMembers) {
			let joinFlag = 0
			// 如果名单里有该志愿者,改变报名按钮状态
			for (let i in res.joinMembers) {
				//暂时通过名字来判断
				if (res.joinMembers[i]["name"] == app.globalData.userInfo["name"] && res.joinMembers[i]["id"] == app.globalData.userInfo["id"]) {
					activeIdx = res.joinMembers[i].posIdx[0]
					joinFlag = 1
					// 找出所报名的岗位逻辑位置
					that.setData({
						idx: res.joinMembers[i].posIdx,
					})
					break
				}
			}
			that.setData({
				isJoin: joinFlag,
			})
		} else {
			that.setData({
				isJoin: 0
			})
		}

		//在这里加个非时间的功能,计算boxer
		let boxer = []
		for (let i in res.serviceTimeSpan) {
			if (i == activeIdx) {
				boxer.push(1)
			} else {
				boxer.push(0)
			}
		}

		//一些常量
		let constants = {
			deadTime: res.serviceDeadTime,
		}


		that.setData({
			isFull: (res.outJoin >= res.outNum) ? 1 : 0,
			boxer,
			constants,
			//记录用户是否有导出特权(负责人或管理员)
			isAdmin: app.globalData["userInfo"]["position"] >= 1,
			isDead: false,
			//isDead: res.deadTimeStamp - new Date().getTime() <= 0 ? 1 : 0,
			actions: res,
			serviceTimeSpan: res.serviceTimeSpan,
		})
	},
	Join() {
		let that = this

		//按钮暂时设置不可见状态
		that.setData({
			isJoin: -1
		})

		let form = {
			id: that.data.id,
			payType: that.data.payType ? that.data.payType : '',
			payNumber: that.data.payNumber ? that.data.payNumber : '',
			posIdx: that.data.idx,
			posName: that.data.serviceTimeSpan[that.data.idx[0]].positions[that.data.idx[1]].name,
		}

		console.log(form)

		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/service/engage",
			method: "post",
			data: form,
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log("报名成功res", res)
			//如果是补贴活动,那将支付信息保存到本地
			if (!!that.data.actions.isSubsidy) {
				that.savePayInfo()
			}
			wx.hideLoading()
			that.setShow("success", "成功参与");
			that.getService()
		}).catch(err => {
			console.log("报名失败err", err)
			wx.hideLoading()
		})
	},
	unJoin() {
		let that = this
		//按钮暂时设置不可见状态
		that.setData({
			isJoin: -1
		})

		wx.$ajax({
			url: wx.$param.server['fastapi'] + "/service/engage",
			method: "post",
			data: {
				id: that.data.id
			},
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log("取消成功res", res)
			that.getService()
			wx.hideLoading()
		}).catch(err => {
			console.log("取消失败err", err)
			wx.hideLoading()
		})
	},
	//保存支付信息到本地
	savePayInfo() {
		const that = this;

		let localPayInfo = wx.getStorageSync('payInfo')
		if (!localPayInfo) {
			localPayInfo = {}
		}
		localPayInfo[that.data.payType] = that.data.payNumber
		wx.setStorageSync('payInfo', localPayInfo)

	},
	showModal(e) {
		//首先看是否登录了
		if (!this.data.isLogin) {
			this.setShow("error", "您尚未注册");
			wx.$navTo('/pages/PersonalCenter/accountSignUp/accountSignUp')
			return
		}

		let tmp = e.currentTarget.dataset.target
		
		if (this.data.isDead && tmp == 'toCancel') {
			this.setShow("error", "截止时间已到,不可操作")
			return
		}
		if (tmp == 'toGroup' && !this.data.isJoin) {
			this.setShow("error", "你尚未参与此活动");
			return
		}

		if (tmp == 'comfirmInfo') {
			this.setData({
				idx: [e.currentTarget.dataset.timespan, e.currentTarget.dataset.position],
			})
		} else if (tmp == 'showPosDesc') {
			this.setData({
				showPosDescIdx: [e.currentTarget.dataset.sindex, e.currentTarget.dataset.pindex]
			})
		} else if (tmp == 'showFeedback') {
			this.setData({
				showFeedbackIdx: [e.currentTarget.dataset.index]
			})
		}

		this.setData({
			modalName: tmp
		})
	},
	hideModal(e) {
		let tmp = e.currentTarget.dataset.target

		if (tmp == 'join') {
			if (this.checkInfo()) {
				wx.showLoading()
				this.setData({
					isJoin: 1
				})
				this.Join()
			}

		} else if (tmp == 'unjoin') {
			wx.showLoading()
			this.unJoin()
		}
		this.setData({
			modalName: null
		})
	},
	//动画
	toggle(e) {
		let anmiaton = e.currentTarget.dataset.class;
		let that = this;
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
		let urls = e.currentTarget.dataset.urls
		let current = e.currentTarget.dataset.index
		wx.previewImage({
			urls,
			current
		})
	},
	//转发朋友
	onShareAppMessage(event) {
		return {
			title: this.data.actions.actName,
			//imageUrl: this.data.actions.images[0],
			path: 'pages/ServiceCenter/activityDetail/activityDetail?id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
		}
	},
	//转发朋友圈
	onShareTimeline(event) {
		return {
			title: this.data.actions.actName + '~快来一起参加吧!',
			query: 'id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
		}
	},
	//轻提示展示 
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
	//导出Excel
	myShowToast() {
		wx.showModal({
			title: '温馨提示',
			content: '打开后请发送电脑端或保存到手机本地查看',
			complete: (res) => {
				if (res.cancel) {
					return
				}
				if (res.confirm) {
					this.exportExcel()
				}
			}
		})
	},
	exportExcel() {
		const D = this.data
		const DA = D.actions
		let sheet = []
		// 表头
		sheet.push(
			['活动名称', DA.actName],
			['活动标签', DA.tag],
			//['活动状态', '已结束'],
			//['活动组织', DA.teamName],
			['组织负责人', DA.holder],
			['服务时间', D.constants.serviceTime],
			['服务时长', D.constants.hours + '小时' + D.constants.minutes + '分钟'],
			['服务地点', DA.address],
			['服务简介', DA.intro],
			['参加活动人数', `${DA.outJoin}人`],
			['截止时间', D.constants.deadTime],
			[],
			[],
			['用户名称', '服务时间段', '岗位', '参加状态', '评级', '详细评价', '电话', '支付宝', '银行卡信息', '学历', '学年', '学校/单位', '学院',]
		)
		DA.feedback.membersInfo.forEach(item => {
			let rowcontent = []
			rowcontent.push(item.info.name)
			rowcontent.push(item.serviceSpan)
			rowcontent.push(item.posName)
			rowcontent.push(item.isCome ? '实到' : '未到')
			rowcontent.push(item.excellent ? '优秀' : '及格')
			rowcontent.push(item.feedback)
			rowcontent.push(item.info.phone)
			rowcontent.push(item.info.aliPay || item.aliPay)
			rowcontent.push(item.bankType + ' ' + item.bankCardNumber)
			rowcontent.push(item.info.grade)
			rowcontent.push(item.info.year)
			rowcontent.push(item.info.school)
			rowcontent.push(item.info.college)
			sheet.push(rowcontent)
		})
		// XLSX插件使用
		//自定义列宽
		const colWidth = [
			{ wch: 13 },
			{ wch: 23 },
			{ wch: 7 },
			{ wch: 10 },
			{ wch: 11 },
			{ wch: 13 },
			{ wch: 13 },
			{ wch: 13 },
			{ wch: 25 },
			{ wch: 10 },
		]
		const rowWidth = [
			// {/* visibility */
			// 	hidden: false, // if true, the row is hidden
			// 	/* row height is specified in one of the following ways: */
			// 	hpt: 20,  // height in points
			// },
			// {
			// 	hpt: 10,
			// }
		]
		let ws = XLSX.utils.aoa_to_sheet(sheet);
		console.log('ws', ws)
		let wb = XLSX.utils.book_new();
		console.log('wb', wb)
		ws['!cols'] = colWidth
		ws['!rows'] = rowWidth
		//增加sheet
		XLSX.utils.book_append_sheet(wb, ws, "sheet名字");
		let fileData = XLSX.write(wb, {
			bookType: "xlsx",
			type: 'base64'
		});
		// 保存的本地地址
		console.log(wx.env.USER_DATA_PATH)
		let filePath = `${wx.env.USER_DATA_PATH}/${DA.actName}.xlsx`
		// 写文件
		const fs = wx.getFileSystemManager()
		fs.writeFile({
			filePath: filePath,
			data: fileData,
			encoding: 'base64',
			success(res) {
				const sysInfo = wx.getSystemInfoSync()
				if (sysInfo.platform.toLowerCase().indexOf('windows') >= 0) {
					wx.saveFileToDisk({
						filePath: filePath,
						success(res) {
							console.log(res)
						},
						fail(res) {
							console.error(res)
							util.tips("导出失败")
						}
					})
				} else {
					wx.openDocument({
						filePath: filePath,
						showMenu: true,
						success: function (res) {
							console.log('打开文档成功')
						},
						fail: console.error
					})
				}
			},
			fail(res) {
				console.error(res)
				if (res.errMsg.indexOf('locked')) {
					wx.showModal({
						title: '提示',
						content: '文档已打开，请先关闭',
					})
				}
			}
		})
	},
	// 点击列表,收缩与展示
	click(event) {
		const index = event.currentTarget.dataset.index;
		const {
			boxer
		} = this.data;
		if (boxer[index] == 1) {
			boxer[index] = 0
		} else {
			boxer[index] = 1
		}
		this.setData({
			boxer
		});
	},
	openFile(e) {
		let idx = e.currentTarget.dataset.target;
		let fileid = this.data.actions.FileID[idx];
		let that = this;
		wx.cloud.getTempFileURL({
			fileList: [fileid],
			//fileid不能在浏览器直接下载，要获取临时URL才可以
			success: res => {
				console.log(res.fileList)
				that.setData({
					//res.fileList[0].tempFileURL是https格式的路径，可以根据这个路径在浏览器上下载
					imgSrc: res.fileList[0].tempFileURL
				});
				wx.showLoading({
					title: '下载中...',
					mask: true
				})
				//根据https路径可以获得http格式的路径(指定文件下载后存储的路径 (本地路径)),根据这个路径可以预览
				wx.downloadFile({
					url: that.data.imgSrc,
					success: (res) => {
						console.log(res)
						that.setData({
							httpfile: res.tempFilePath
						})
						wx.hideLoading()
						//预览文件
						wx.openDocument({
							filePath: that.data.httpfile,
							success: res => {
							},
							fail: err => {
								console.log(err);
							}
						})
					},
					fail: (err) => {
						console.log('读取失败', err)
					}
				})
			},
			fail: err => {
				console.log(err);
			}
		})

	},
	checkInfo() {
		const that = this
		if (that.data.actions.isSubsidy) {
			if (!that.data.payNumber) {
				this.setShow("error", "支付信息没填");
				return false
			}
		}
		return true
	}


})