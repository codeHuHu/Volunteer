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
			hours: 'xxxxxxxx',
			minutes: 'xxxxxxx',
			deadTime: 'xxxxxxx',
			serviceTime: 'xxxxxxx',
		},
		picker: [
			'建设银行',
			'邮储银行',
			'农业银行',
			'工商银行',
			'中国银行',
			'交通银行',
			'其他银行'
		],
		BankPickerIndex: '',
		bankCardNumber: '',
		Banktype: '',
		aliPay: ''

	},
	onLoad: function (options) {
		console.log('app.globalData:', app.globalData)
		var that = this
		//记录是否登录
		that.setData({
			isLogin: app.globalData.isLogin,
			myInfo: app.globalData,
			//传入活动id
			id: options.id,

			//判断是否为审核页面
			checkMode: options.check ? 1 : 0
		})

		//判断是否为从转发进来的
		if (options.actions) {
			console.log('从转发进来的')
			let info = JSON.parse(decodeURIComponent(options.actions))
			let tmp = wx.getStorageSync('user_status')

			that.setData({
				actions: info,
				isLogin: tmp ? tmp[1] : false
			})
		}
		db.collection('ActivityInfo').doc(options.id).get({
			success(res) {
				var t = res.data
				// 时间戳的转换
				that.adjustTimeStamp(t);
				// 活动对于用户的状态转换
				that.adjustStatus(t);
				//开启监听(传入该页面的id)
				that.watcher(options.id);

				//如果是补贴活动,读取本地数据
				if (t.isSubsidy) {
					let payInfo = wx.getStorageSync('payInfo')
					if (payInfo) {
						let BankPickerIndex = 0;
						for (var i in that.data.picker) {
							BankPickerIndex = i
							if (that.data.picker[i] == payInfo['Banktype']) {
								break
							}
						}
						that.setData({
							aliPay: payInfo['aliPay'],
							bankCardNumber: payInfo['bankCardNumber'],
							Banktype: payInfo['Banktype'],
							BankPickerIndex
						})
					}
				}
			}
		})


	},
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	onUnload() {
		try {
			if (this.watcher) {
				this.watcher.close();
				console.log('关闭数据监听')
			}

		} catch (error) {
			console.log('关闭监听失败', error)
		}
	},
	watcher(id) {
		var that = this
		this.watcher = db.collection('ActivityInfo')
			.doc(id)
			.watch({
				onChange: function (snapShot) {
					console.log(snapShot)
					that.adjustStatus(snapShot.docs[0])
					that.setData({
						actions: snapShot.docs[0],
						serviceTimeSpan: snapShot.docs[0].serviceTimeSpan
					})
				},
				onError: function (err) {
					console.error('the watch closed because of error', err)
				}
			})
	},
	adjustTimeStamp(res) {
		//报名截止时间	报名截止日期
		let t = new Date(res.deadTimeStamp);
		const formattedTime = `${utils.Z(t.getHours())}:${utils.Z(t.getMinutes())}`;
		const formattedDate = `${t.getFullYear()}-${utils.Z(t.getMonth() + 1)}-${utils.Z(t.getDate())}`;
		//活动日期 服务开始时间 服务结束时间
		t = new Date(res.serviceStartStamp);
		const serviceDate = `${t.getFullYear()}-${utils.Z(t.getMonth() + 1)}-${utils.Z(t.getDate())}`;
		const serviceStartTime = `${utils.Z(t.getHours())}:${utils.Z(t.getMinutes())}`;
		t = new Date(res.serviceEndStamp);
		const serviceEndTime = `${utils.Z(t.getHours())}:${utils.Z(t.getMinutes())}`;
		//服务时长
		t = 0;
		for (var i in res.serviceTimeSpan) {
			var splitTime = res.serviceTimeSpan[i].time.split('-')
			var start = new Date(`${res.serviceTimeSpan[i].date} ${splitTime[0]}`).getTime()
			var end = new Date(`${res.serviceTimeSpan[i].date} ${splitTime[1]}`).getTime()
			t += end - start
		}
		const thours = Math.floor(t / (1000 * 60 * 60));
		const tminutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));

		//在这里加个非时间的功能,计算boxer
		let boxer = []
		for (var i in res.serviceTimeSpan) {
			boxer.push(0)
		}

		let constants = {
			hours: thours,
			minutes: tminutes,
			deadTime: formattedDate + ' ' + formattedTime,
			serviceTime: serviceDate + ' ' + serviceStartTime + '-' + serviceEndTime,
			checkMode: Number(res.status) <= 0 ? 1 : 0,
		}
		this.setData({
			boxer,
			constants,
			//记录用户是否有导出特权(负责人或管理员)
			isAdmin: (app.globalData.openid == res._openid) || (Number(app.globalData.position) >= 1),
			isDead: 0,
			//isDead: res.deadTimeStamp - new Date().getTime() <= 0 ? 1 : 0,
			isPintuan: res.isPintuan,
			actions: res,
			serviceTimeSpan: res.serviceTimeSpan,
		})
	},
	//改变选择银行索引
	BankPickerChange(e) {
		this.setData({
			BankPickerIndex: e.detail.value,
			Banktype: this.data.picker[e.detail.value]	//银行类型
		})
	},
	getElseBank(e) {
		this.setData({
			Banktype: e.detail.value
		})
	},
	adjustStatus(res) {
		//检测活动的报名成功状态
		this.setData({
			isFull: (res.outJoin == res.outNum) ? 1 : 0
		})
		if (res.joinMembers) {
			var flag = 0
			// 如果名单里有该志愿者,改变报名按钮状态
			for (var i in res.joinMembers) {
				if (res.joinMembers[i].info.openid == app.globalData.openid) {
					flag = 1
					// 找出所报名的岗位逻辑位置
					this.setData({
						idx: res.joinMembers[i].posIdx,
					})
					break
				}

			}
			this.setData({
				isJoin: flag,
			})
		} else {
			this.setData({
				isJoin: 0
			})
		}
	},
	Join() {
		var that = this
		let t = new Date()
		//按钮暂时设置不可见状态
		that.setData({
			isJoin: -1
		})
		wx.cloud.callFunction({
			name: 'updateJoinActivity',
			data: {
				collectionName: 'ActivityInfo',//集合名字
				docName: that.data.id,//活动id
				//操作变量
				outJoinAdd: 1,//加一人
				idx: that.data.idx,//该岗位的逻辑位置
				member: {
					//个人身份信息
					info: {
						openid: app.globalData.openid, //openid
						name: app.globalData.name, //名字
						phone: app.globalData.phone, //电话
						school: app.globalData.school, //学校
						year: app.globalData.year, //学年
						id: app.globalData.id, //身份证
					},
					aliPay: that.data.aliPay ? that.data.aliPay : '',
					bankType: that.data.Banktype ? that.data.Banktype : '',
					bankCardNumber: that.data.bankCardNumber ? that.data.bankCardNumber : '',
					//岗位信息
					joinTime: `${t.getFullYear()}-${utils.Z(t.getMonth() + 1)}-${utils.Z(t.getDate())} ${utils.Z(t.getHours())}:${utils.Z(t.getMinutes())}`,
					posIdx: that.data.idx,
					posName: that.data.serviceTimeSpan[that.data.idx[0]].positions[that.data.idx[1]].name,
				}
			}
		}).then(res => {
			//如果是补贴活动,那将银行卡和支付宝信息保存到本地
			if (that.data.actions.isSubsidy == 1) {
				let payInfo = {
					'aliPay': that.data.aliPay,
					'Banktype': that.data.Banktype,
					'bankCardNumber': that.data.bankCardNumber
				}
				wx.setStorageSync('payInfo', payInfo)
			}

			//将该活动id加入到userInfo
			db.collection('UserInfo').where({
				_openid: app.globalData.openid,
			}).update({
				data: {
					myActivity: db.command.push(that.data.id)
				}
			})
			wx.hideLoading()
			that.setShow("success", `成功参与${this.data.actions.ispintuan ? '拼团' : '报名'}`);
		})
	},
	unJoin() {
		var that = this
		//按钮暂时设置不可见状态
		that.setData({
			isJoin: -1
		})
		//(非云函数)先获取数据库
		db.collection('ActivityInfo').doc(this.data.id)
			.get()
			.then(res => {
				this.setData({
					actions: res.data
				})
				// 比较安全地在名单中清除该志愿者
				var tmpList = res.data.joinMembers
				var result = []
				for (var i in tmpList) {
					if (tmpList[i].info.openid != app.globalData.openid) {
						result.push(tmpList[i])
					}
				}
				//加入两个错误判断
				if (res.data.outNum < 0) {
					this.setShow("error", "系统异常");
					return
				}
				// if (res.data.outNum < res.data.outJoin) {
				// 	this.setShow("error", "系统异常");
				// 	return
				// }
				//(云函数)人数自减1,赋值新的名单
				wx.cloud.callFunction({
					name: 'updateJoinActivity',
					data: {
						collectionName: 'ActivityInfo',
						docName: that.data.id,
						//操作变量
						outJoinAdd: -1,
						newJoinMembers: result,
						idx: that.data.idx,
					}
				})
					.then(res => {
						//在userInfo中删除此活动id
						db.collection('UserInfo').where({
							_openid: app.globalData.openid
						}).get({
							success(res) {
								var myActivityList = []
								var myActivity = res.data[0].myActivity
								for (var l in myActivity) {
									if (myActivity[l] != that.data.id) {
										myActivityList.push(myActivity[l])
									}
								}
								db.collection('UserInfo')
									.where({
										_openid: app.globalData.openid
									}).update({
										data: {
											myActivity: myActivityList
										}
									})
									.then(res => {
										wx.hideLoading()
										that.setShow("success", "取消成功");
									})
							}
						})
					})
			})
	},
	showModal(e) {
		var tmp = e.currentTarget.dataset.target
		if (!this.data.isLogin) {
			this.setShow("error", "您尚未注册");
			wx.$navTo('/pages/PersonalCenter/accountSignUp/accountSignUp')
			return
		}
		if (this.data.isDead && tmp == 'toCancel') {
			this.setShow("error", "截止时间已到,不可操作")
			return
		}
		if (tmp == 'toJoin') {
			//报名窗口
			//先判断是否满人
			if (this.data.actions.outJoin >= this.data.actions.outNum) {
				this.setShow("error", "人数已满");
				return
			}
		} else if (tmp == 'toPintuan') {

			this.setData({
				idx: [e.currentTarget.dataset.timespan, e.currentTarget.dataset.position],
			})
			// wx.showLoading()
			// //拼团
			// //先判断是否满人
			// if (this.data.actions.outJoin >= this.data.actions.outNum) {
			// 	this.setShow("error", "人数已满");
			// 	wx.hideLoading()
			// 	return
			// }
			// this.setData({
			// 	isJoin: 1
			// })
			// this.Join()
			// return
		} else if (tmp == 'toGroup') {
			if (!this.data.isJoin) {
				this.setShow("error", "你尚未参与此活动");
				return
			}
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
		var a = e.currentTarget.dataset.target
		console.log(a)
		if (a == 'join') {
			if (this.checkInfo()) {
				wx.showLoading()
				this.setData({
					isJoin: 1
				})
				this.Join()
			}

		} else if (a == 'unjoin') {
			wx.showLoading()
			this.unJoin()
		}
		this.setData({
			modalName: null
		})
	},
	//动画
	toggle(e) {
		var anmiaton = e.currentTarget.dataset.class;
		var that = this;
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
			path: 'pages/activityDetail/activityDetail?id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
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
			//['活动类型', DA.isPintuan ? '拼团' : '报名'],
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
		var ws = XLSX.utils.aoa_to_sheet(sheet);
		console.log('ws', ws)
		var wb = XLSX.utils.book_new();
		console.log('wb', wb)
		ws['!cols'] = colWidth
		ws['!rows'] = rowWidth
		//增加sheet
		XLSX.utils.book_append_sheet(wb, ws, "sheet名字");
		var fileData = XLSX.write(wb, {
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
	getbutton(e) {
		this.setData({
			payee: e.detail.value
		})
	},
	openFile(e) {
		var idx = e.currentTarget.dataset.target;
		var fileid = this.data.actions.FileID[idx];
		var that = this;
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
			if (!that.data.payee) {
				this.setShow("error", "支付信息没填");
				return false
			}
			if (that.data.payee == 1 && that.data.aliPay == '') {
				this.setShow("error", "支付信息没填");
				return false
			}
			if (that.data.payee == 2 && (that.data.BankPickerIndex == '' || that.data.Banktype == '')) {
				this.setShow("error", "支付信息没填");
				return false
			}
		}
		return true
	}


})