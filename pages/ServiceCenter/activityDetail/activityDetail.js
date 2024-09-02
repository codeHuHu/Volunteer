const app = getApp()
let loading = false;

const utils = require("../../../utils/exportExcel.js")

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
		joinSet:[],	//维护该用户在每个岗位的参加情况
		joinStatus:{}
	},
	onLoad(options) {
		console.log('app.globalData:', app.globalData)
		let myInfo = wx.getStorageSync('userInfo')
		let that = this

		that.setData({
			myInfo: myInfo, //记录个人信息
			id: options.id, //传入活动id
			//判断是否为审核页面
			checkMode: options.check ? 1 : 0
		})

		//判断是否为从转发进来的
		if (options.actions) {
			console.log('从转发进来的')
			// app.getAuthStatus()
			console.log("app", app.globalData);
			let actions = JSON.parse(decodeURIComponent(options.actions))
			that.setData({
				actions,
			})
		}
		that.getService(options.id)
		
	},
	onShow() {
		let myInfo = wx.getStorageSync('userInfo')
		this.setData({
			myInfo: myInfo, //记录个人信息
		})
	},
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	onUnload() { },
	getService(id = null) {
		let that = this
		if (!id) {
			id = that.data.id
		}
		//获取服务
		wx.$ajax({
			url: wx.$param.server['springboot'] + `/service/${id}`,
			method: "get",
		}).then(res => {
			console.log("res", res);
			that.adjustData(res.data)
		}).catch(err => { })
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
		let isJoin = 0
		if (res.joinMembers && app.globalData.userInfo != null) {
			let ifJoinSet = []
			// 如果名单里有该志愿者,改变报名按钮状态
			for (let i in res.joinMembers) {
				//暂时通过名字来判断
				if (res.joinMembers[i]["id"] == app.globalData.userInfo["id"] && res.joinMembers[i]["name"] == app.globalData.userInfo["name"]) {
					activeIdx = res.joinMembers[i].posIdx[0]
					ifJoinSet.push(res.joinMembers[i].posIdx)
					isJoin = 1
					// 找出所报名的岗位逻辑位置
					// that.setData({
					// 	idx: res.joinMembers[i].posIdx,
					// })
					// break
				}
			}
			that.setData({
				joinSet:ifJoinSet
			})
		}
		that.setData({
			isJoin
		})
		this.updateJoinStatus(res.timeSpan);
		//在这里加个非时间的功能,计算boxer
		let boxer = []
		for (let i in res.timeSpan) {
			if (i == activeIdx) {
				boxer.push(1)
			} else {
				boxer.push(0)
			}
		}

		//一些常量
		let constants = {
			deadTime: res.deadTime,
		}


		that.setData({
			isFull: (res.joinNum >= res.needNum) ? 1 : 0,
			boxer,
			constants,
			//记录用户是否有导出特权(负责人或管理员)
			isAdmin: app.getRole() >= 1,
			isDead: false,
			//isDead: res.deadTimeStamp - new Date().getTime() <= 0 ? 1 : 0,
			actions: res,
			timeSpan: res.timeSpan,
		})

	},
	updateJoinStatus(timeSpan) {
    const joinStatus = {};
    timeSpan.forEach((item, index) => {
      item['positions'].forEach((pos, pindex) => {
        joinStatus[`${index}-${pindex}`] = this.data.joinSet.some((it) => it[0] === index && it[1] === pindex);
      });
		});
    this.setData({ joinStatus:joinStatus });
  },
	Join() {
		let that = this

		//按钮暂时设置不可见状态
		that.setData({
			isJoin: -1
		})

		let form = {
			sId: that.data.id,
			payType: that.data.payType ? that.data.payType : '',
			payNumber: that.data.payNumber ? that.data.payNumber : '',
			posIdx: that.data.idx,
			posName: that.data.timeSpan[that.data.idx[0]].positions[that.data.idx[1]].name,
		}

		console.log(form)

		wx.$ajax({
			url: wx.$param.server['springboot'] + "/service/engage",
			method: "post",
			data: form,
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log("报名成功res", res)
			//如果是补贴活动,那将支付信息保存到本地
			if (that.data.actions.isSubsidy) {
				that.savePayInfo()
			}
			wx.hideLoading()
			that.setShow("success", "报名成功");
			that.getService()
		}).catch(err => {
			console.log("报名失败err", err)
			that.setShow("error", err.detail)
			that.getService()
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
			url: wx.$param.server['springboot'] + "/service/engage",
			method: "post",
			data: {
				sId: that.data.id,
				posIdx: that.data.idx,
			},
			header: {
				'content-type': 'application/json'
			}
		}).then(res => {
			console.log("取消成功res", res)
			that.setShow("success", "取消成功");
			that.getService()
			wx.hideLoading()
		}).catch(err => {
			console.log("取消失败err", err)
			that.setShow("error", err.detail)
			wx.hideLoading()
		})
	},
	//保存支付信息到本地
	savePayInfo() {
		const that = this;

		let localPayInfo = wx.getStorageSync('payInfo')
		if (!localPayInfo) localPayInfo = {}

		localPayInfo[that.data.payType] = that.data.payNumber
		wx.setStorageSync('payInfo', localPayInfo)

	},
	showModal(e) {
		console.log(e.currentTarget.dataset)
		//首先看是否登录了
		if (!app.globalData.isAuth) {
			this.setShow("error", "您尚未登录");
			wx.$navTo('/pages/PersonalCenter/register/register')
			return
		}
		if (app.globalData.userInfo.name === "新用户") {
			this.setShow("error", "您尚未实名");
			setTimeout(() => {
				wx.$navTo('/pages/PersonalCenter/setting/setting')
			}, 700)

			return
		}

		let tmp = e.currentTarget.dataset.target

		// if (tmp == 'toCancel' && this.data.isDead) {
		// 	this.setShow("error", "截止时间已到,不可操作")
		// 	return
		// }



		if (tmp == 'toGroup' && !this.data.isJoin) {
			this.setShow("error", "你尚未参与此活动");
			return
		} else if (tmp == 'comfirmInfo') {
			// (仅仅是前端判断)判断人数是不是满了
			let selectPosition = this.data.timeSpan[e.currentTarget.dataset.timespan].positions[e.currentTarget.dataset.position];
			if (selectPosition.joined >= selectPosition.number) {
				this.setShow("error", "该岗位人数已满")
				return;
			}
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
		} else if (tmp == 'joinMembers') {
			if (!this.data.isAdmin) {
				return;
			}
			this.setData({
				showJoinMembersIdx: [e.currentTarget.dataset.sindex, e.currentTarget.dataset.pindex]
			})

		}

		this.setData({
			modalName: tmp,
			idx: [e.currentTarget.dataset.timespan, e.currentTarget.dataset.position],
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
			title: this.data.actions.title,
			path: 'pages/ServiceCenter/activityDetail/activityDetail?id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
		}
	},
	//转发朋友圈
	onShareTimeline(event) {
		return {
			title: this.data.actions.title + '~快来一起参加吧!',
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
			['活动名称', DA.title],
			['活动标签', DA.tag],
			//['活动状态', '已结束'],
			//['活动组织', DA.teamName],
			['组织负责人', DA.holder.name],
			['负责人介绍', DA.holderDetail],
			// ['服务时间', D.constants.serviceTime],
			// ['服务时长', D.constants.hours + '小时' + D.constants.minutes + '分钟'],
			['服务地点', DA.address],
			['服务简介', DA.intro],
			['参加活动人数', `${DA.joinNum}人`],
			['截止时间', D.constants.deadTime],
			[],
			[],
			['用户名称', '服务时间段', '岗位', '参加状态', '评级', '详细评价', '电话', '收款信息', '学历', '学年', '学校/单位', '学院',]
		)
		DA.joinMembers.forEach(item => {
			let rowcontent = []
			let TS = DA.timeSpan[item['posIdx'][0]]
			rowcontent.push(item.name)
			rowcontent.push(TS.date + " " + TS.time)
			rowcontent.push(item.posName)
			rowcontent.push(item.isCome ? '实到' : '未到')
			rowcontent.push(item.performance)
			rowcontent.push(item.feedback)
			rowcontent.push(item.phone)
			rowcontent.push(item.payType + ' ' + item.payNumber)
			rowcontent.push(item.grade)
			rowcontent.push(item.year)
			rowcontent.push(item.school)
			rowcontent.push(item.college)
			sheet.push(rowcontent)
		})
		utils.exportExcel(sheet, DA.title)
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
		let file = e.currentTarget.dataset.file;
		wx.showLoading({
			title: '下载中...',
			mask: true
		})

		//根据https路径可以获得http格式的路径(指定文件下载后存储的路径 (本地路径)),根据这个路径可以预览
		wx.downloadFile({
			url: file.filePath,
			success: (res) => {
				console.log("openfile", res)
				wx.hideLoading()
				//预览文件
				wx.openDocument({
					filePath: res.tempFilePath,
					showMenu: true,
					success: res => { },
					fail: err => {
						console.log(err);
					}
				})
			},
			fail: (err) => {
				wx.hideLoading()
				wx.showLoading({
					title: '下载失败' + err.errMsg,
					mask: true
				})
				console.log('下载失败', err)
			}
		})

	},
	checkInfo() {
		const that = this


		if (that.data.actions.isSubsidy && !that.data.payNumber) {
			this.setShow("error", "支付信息没填");
			return false
		}
		return true
	}


})