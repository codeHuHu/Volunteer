// pages/checkActivity/checkActivity.js
const db = wx.cloud.database()
const app =getApp()
let loading = false;

Page({

	/**
	 * 页面的初始数据
	 */
	data: {

	},

	onLoad: function (event) {
		wx.setNavigationBarTitle({
			title: '审核发布',
		})
		const currentDate = new Date();
		const timestamp = currentDate.getTime();
		this.setData({
			timestamp: timestamp,
			currentDate: currentDate
		})
		//生成两个actionsList
		this.getList('0');
		this.getList('-1');
	},

	getList(e)
	{
		console.log(e)
		var s = e;
		var that = this;
		const collection = db.collection('ActivityInfo');
		collection.where({
			status : s
		}).field({
			_id: true,
			actName: true,
			serviceEstamp: true,
			serviceStamp: true,
			status: true,
			tag: true,
			teamName: true,
			_openid: true
		})
			.limit(20)
			.orderBy('serviceStamp', 'desc')
			.get()
			.then(res => {
				var actions = res.data;
				if(s == '0')
				{
				that.setData({
					actionList: actions,
				});
			}
			else
			{
				that.setData({
					BinactionList: actions,
				});
			}
				this.setTime(res.data)
				return Promise.resolve(); // 返回一个 resolved 状态的 Promise 对象
			});
	},

	setTime(result) {
		var res = result
		console.log(res)
		var dataArr = []
		var t
		for (var l in res) {
			t = new Date(res[l].serviceStamp)
			dataArr.push(`${t.getFullYear()}-${app.Z(t.getMonth() + 1)}-${app.Z(t.getDate())}`)
			//console.log(formattedDate)
		}
		this.setData({
			data_Arr: dataArr
		})
		wx.stopPullDownRefresh()

			.catch(console.error)
	},

	toDetail(e) {
		//console.log(e.currentTarget.dataset.id)
		wx.navigateTo({
			url: '/pages/detail/detail?id=' + e.currentTarget.dataset.id,
		})
	},

	Agree(e)
	{
		var that = this
		wx.showModal({
			title: '确认',
			content: '是否确定发布？',
			success(res) {
				// 用户点击了确定按钮
				if (res.confirm) {
					console.log(e.currentTarget.dataset.id)
		const id = e.currentTarget.dataset.id
		const collection = db.collection('ActivityInfo');
		collection.doc(id).update({
			data:{
					status: '1'
			}
		}).then(res=>
		{
			console.log(res)
			that.setShow("success","发布成功")
			that.onLoad()
		}
		)
				} else if (res.cancel) {
					
				}
			}
		})
	},
		Reject(e)
		{
			var that = this
			wx.showModal({
				title: '确认',
				content: '是否拒绝发布',
				success(res) {
					// 用户点击了确定按钮
					if (res.confirm) {
						console.log(e.currentTarget.dataset.id)
			const id = e.currentTarget.dataset.id
			const collection = db.collection('ActivityInfo');
			collection.doc(id).update({
				data:{
						status: '-1'	//-1表示活动不被通过发布
				}
			}).then(res=>
			{
				console.log(res)
				that.setShow("error","已移入回收站")
				that.onLoad()
			}
			)
					} else if (res.cancel) {
						
					}
				}
			})
		},

		showModal(e) {
			this.setData({
				modalName: e.currentTarget.dataset.target
			})
		},
		hideModal(e) {
			this.setData({
				modalName: null
			})
		},
	/**
	 * 轻提示展示
	 * @param {*} status 
	 * @param {*} message 
	 * @param {*} time 
	 * @param {*} fun 
	 */
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
	tabSelect(e) {
    console.log(e);
    this.setData({
      TabCur: e.currentTarget.dataset.id,
      scrollLeft: (e.currentTarget.dataset.id - 1) * 60
    })
  }
})