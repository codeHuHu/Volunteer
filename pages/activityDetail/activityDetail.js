const XLSX = require('./excel') //引入
const app = getApp()
let loading = false;
const db = wx.cloud.database()

Page({
	data: {
		checkMode: 0,
		constant: {
			hours: 'xxxxxxxx',
			minutes: 'xxxxxxx',
			deadTime: 'xxxxxxx',
			serviceTime: 'xxxxxxx',
		},
	},
	onLoad: function (options) {
		console.log('app.globalData:', app.globalData)
		//记录是否登录
		this.setData({
			isLogin: app.globalData.isLogin,
			phone: app.globalData.phone,
			//传入活动id
			id: options.id,
		})
		var that = this
		//判断是否为审核页面
		if (options.check) {
			this.setData({
				checkMode: 1
			})
		}
		//判断是否为从转发进来的
		if (options.actions) {
			console.log('从转发进来的')
			let info = JSON.parse(decodeURIComponent(options.actions))
			this.data.actions = info
			var tmp = wx.getStorageSync('user_status')
			if (tmp) {
				console.log('从本地读取是否已注册', tmp)
				this.data.isLogin = tmp[1]
			}
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
			}
		})
	},
	onPullDownRefresh() {
		wx.stopPullDownRefresh()
	},
	onUnload() {
		try {
			this.watcher.close()
			console.log('关闭数据监听')
		} catch (error) {
			console.log('关闭监听失败', error)
		}
	},
	watcher(id) {
		console.log('开启监听')
		var that = this
		this.watcher = db.collection('ActivityInfo')
			.doc(id)
			.watch({
				onChange: function (snapShot) {
					//console.log(snapShot)
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
		//app.Z()函数在app.js,作用是固定长度补零
		//报名截止时间	报名截止日期
		let t = new Date(res.deadTimeStamp);
		const formattedTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		const formattedDate = `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`;
		//活动日期 服务开始时间 服务结束时间
		t = new Date(res.serviceStartStamp);
		const serviceDate = `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`;
		const serviceStartTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		t = new Date(res.serviceEndStamp);
		const serviceEndTime = `${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`;
		//服务时长
		t = res.serviceEndStamp - res.serviceStartStamp
		const thours = Math.floor(t / (1000 * 60 * 60));
		const tminutes = Math.floor((t % (1000 * 60 * 60)) / (1000 * 60));

		//在这里加个非时间的功能,计算boxer
		let boxer = []
		for (var i in res.serviceTimeSpan) {
			boxer.push(0)
		}
		let constant = {
			hours: thours,
			minutes: tminutes,
			deadTime: formattedDate + ' ' + formattedTime,
			serviceTime: serviceDate + ' ' + serviceStartTime + '-' + serviceEndTime,

			checkMode: Number(res.status) <= 0 ? 1 : 0,
		}
		this.setData({
			constant,
			//记录用户是否有导出特权(负责人或管理员)
			isAdmin: (app.globalData.openid == res._openid) || (Number(app.globalData.position) >= 1),
			isDead: res.deadTimeStamp - new Date().getTime() <= 0 ? 1 : 0,
			isPintuan: res.isPintuan,

			actions: res,
			serviceTimeSpan: res.serviceTimeSpan,
			boxer

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
		//先更新一下,查看是否满人了
		db.collection('ActivityInfo').doc(that.data.id)
			.get()
			.then(res => {
				that.setData({
					actions: res.data,
				})
				if (that.data.actions.outJoin >= that.data.actions.outNum) {
					that.setShow("error", "人数已满");
					return
				}
				let t = new Date()
				//如果没满人,就去新增人数
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
							//
							bankCard: that.data.bankCard ? that.data.bankCard : '',
							//岗位信息
							joinTime: `${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())} ${app.Z(t.getHours())}:${app.Z(t.getMinutes())}`,
							posIdx: that.data.idx,
							posName: that.data.serviceTimeSpan[that.data.idx[0]].positions[that.data.idx[1]].name,
						}
					}
				}).then(res => {

					//更改按钮状态
					that.setData({
						isJoin: 1
					})
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
			})
	},
	unJoin() {
		var that = this
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
				if (res.data.outNum < res.data.outJoin) {
					this.setShow("error", "系统异常");
					return
				}
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
						//更改按钮状态
						that.setData({
							isJoin: 0
						})
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
		console.log(tmp)
		if (e.currentTarget.dataset.target == 'None') {
			//无操作
			return
		}
		if (!this.data.isLogin) {
			this.setShow("error", "您尚未注册");
			return
		}
		if(this.data.isDead && tmp == 'toCancel'){
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
		}else if(tmp == 'showPosDesc'){
			this.setData({
				showPosDescIdx: [e.currentTarget.dataset.sindex,e.currentTarget.dataset.pindex]
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
			wx.showLoading()
			this.setData({
				isJoin: 1
			})
			this.Join()
		} else if (a == 'unjoin') {
			wx.showLoading()
			this.setData({
				isJoin: 0
			})
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
		console.log('previeww')
		var tmp = []
		if (e.currentTarget.dataset.url == "0") {
			tmp = this.data.actions.qr_code
		} else if (e.currentTarget.dataset.url == "1") {
			tmp = this.data.actions.iZhiYuan
		} else if (e.currentTarget.dataset.url == "2") {
			tmp = this.data.actions.feedback.signInList
		} else if (e.currentTarget.dataset.url == "3") {
			tmp = this.data.actions.feedback.imgList
		}
		wx.previewImage({
			urls: tmp,
			current: e.currentTarget.dataset.index
		})
	},
	//转发朋友
	onShareAppMessage(event) {
		console.log('shareApp', this.data.actions.actName)
		return {
			title: this.data.actions.actName,
			//imageUrl: this.data.actions.images[0],
			path: 'pages/activityDetail/activityDetail?id=' + this.data.id + '&actions=' + encodeURIComponent(JSON.stringify(this.data.actions))
		}
	},
	//转发朋友圈
	onShareTimeline(event) {
		console.log('shareTimeLine', this.data.actions.actName)
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
			['活动类型', DA.isPintuan ? '拼团' : '报名'],
			['活动标签', DA.tag],
			['活动状态', '已结束'],
			['活动组织', DA.teamName],
			['组织负责人', DA.holder],
			['服务时间', D.serviceTime],
			['服务时长', D.hours + '小时' + D.minutes + '分钟'],
			['服务地点', DA.address],
			['服务简介', DA.intro],
			['参加活动人数', `${DA.outJoin}人`],
			['截止时间', D.deadTime],
			[],
			[],
			['用户名称', '学历', '学年', '学校/单位', '学院', '电话', '支付宝', '参加状态', '评级', '详细评价']
		)
		DA.feedback.membersInfo.forEach(item => {
			let rowcontent = []
			rowcontent.push(item.info.userName)
			rowcontent.push(item.info.grade)
			rowcontent.push(item.info.year)
			rowcontent.push(item.info.school)
			rowcontent.push(item.info.college)
			rowcontent.push(item.info.phone)
			rowcontent.push(item.info.aliPay)
			rowcontent.push(item.isCome ? '实到' : '未到')
			rowcontent.push(item.excellent ? '优秀' : '及格')
			rowcontent.push(item.feedback)
			sheet.push(rowcontent)
		})
		// XLSX插件使用
		//自定义列宽
		const colWidth = [
			{ wch: 15 },
			{ wch: 25 },
			{ wch: 10 },
			{ wch: 15 },
			{ wch: 20 },
			{ wch: 15 },
			{ wch: 15 },
			{ wch: 10 },
			{ wch: 10 },
			{ wch: 35 },
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
	getBankcard(e) {
		this.setData({
			bankCard: e.detail.value
		})
	}
})