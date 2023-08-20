// pages/newActivity/newActivity.js
const db=wx.cloud.database()
const app =getApp()

Page({

	/**
	 * 页面的初始数据
	 */
  data: {
		picker:'',
		index1:'',
		index: null,
		modalName: null,
		tempID:null,
		tempValue:null,
		arrayName:'',
		signInList:[], //签到表
		imgList: [], //活动图片
		people:[],  //活动人员
		checkbox: [{
			id:'',
			name:'',
			checked: true,
			isCome:true,
			feedBack:''
		}],
		members:[],
		count:0,
		id:''
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function() {
		var tmpPicker = []
		var that =this
		db.collection('ActivityInfo').where({
			_openid: app.globalData.openid
		}).field({
			_id: true,
			actName: true,
			joinMembers:true,
			_openid: true
		}).get().then(res => {
			that.setData({
				actionList: res.data
			})
				for(var i in that.data.actionList)
				{
					tmpPicker.push(that.data.actionList[i].actName)
				}
				console.log(tmpPicker)
				that.setData({
					picker:tmpPicker
				})

		}).catch(err => {
			console.log(err);
		})
		
  },

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady() {

	},

	/**
	 * 生命周期函数--监听页面显示
	 */
	onShow() {

	},

	/**
	 * 生命周期函数--监听页面隐藏
	 */
	onHide() {

	},
	PickerChange(e)
	{
		var that =this
		this.setData({
			index1: e.detail.value
		})
		console.log(this.data.picker[this.data.index1])
		db.collection('ActivityInfo').where({
			actName:that.data.picker[that.data.index1]
		})
		.get().then(res=>{
			console.log(res.data)
					that.setData({
						result:res.data,
					})
			}
		).then(()=>{
			console.log(that.data.result)
			var result=that.data.result
			var NameList=[]
			var members = result[0].joinMembers
			that.setData({
				id:result[0]._id
			})
			db.collection('UserInfo').where({
				_openid:db.command.in(members)
			}).field({
				username:true
			}).get().then(res=>
				{
					console.log(res.data)
					var tmp =res.data
				
					for(var l in tmp)
					{
						NameList.push(tmp[l].username)
					}
				that.setData({
					NameList:NameList,
					count:tmp.length,
				
				})
				}).then(res=>
					{
						console.log(that.data.count)
							const newArray=[]
						for(var l=0;l<that.data.count;l++)
						{
							const item={
								id:l,
								name:that.data.NameList[l],
								checked:true,
								isCome:true,
								feedBack:''
							}
							newArray.push(item)
						
						}
							console.log(newArray)
							that.setData({
								checkbox:newArray
							})
					})
			
		
		
		})
	},
	/**
	 * 生命周期函数--监听页面卸载
	 */
//   onLoad(options) {
// 	    var that = this
// 	    wx.request({
// 	        url: 'http://127.0.0.1:3000/',
// 	        success: function (res) {
// 	            console.log(res)
// 	        }
// 	    })
//   },

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
				if(param === 'signInList') {
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
				}
				else {
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

      urls: this.data.imgList,
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
				if(param === 'signInList') {
					if (res.confirm) {
						this.data.signInList.splice(e.currentTarget.dataset.index, 1);
						this.setData({
							signInList: this.data.signInList
						})
					}
				}
				else {
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
		this.data.tempID = e.currentTarget.dataset.btnid;
		const value = this.data.checkbox.find(item => item.id === this.data.tempID).notGoodReason;
		this.setData({
			tempValue:value
		})
		this.showModal(e);			
	},
  hideModal(e) {
    this.setData({
      modalName: null
    })
	},
	ChooseIsCome(e) {
		let items = this.data.checkbox;
    let values = e.currentTarget.dataset.value;
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
      if (items[i].id === values) {
				items[i].isCome = !items[i].isCome;
				items[i].checked=!items[i].checked;
        break
      }
    }
    this.setData({
      checkbox: items
		})
		console.log(this.data.checkbox);
	},
	ChooseCheckbox(e) {
    let items = this.data.checkbox;
    let values = e.currentTarget.dataset.value;
    for (let i = 0, lenI = items.length; i < lenI; ++i) {
					if (items[i].id === values) {
									items[i].checked = !items[i].checked;
									break
								}   
    }
    this.setData({
      checkbox: items
    })
	},
	//出现未定义警告时，重新编译即可
	handleInput: function(e) {
	const btnId = this.data.tempID;
	const checkbox = this.data.checkbox.map(item => {
		if (item.id === btnId) {
			item.feedBack = e.detail.value;
		}
		return item;
	});
	this.setData({
		checkbox: checkbox
	});
	},
	commitfb()
	{

		console.log(this.data.checkbox)

		db.collection('ActivityInfo').doc(this.data.id).update({
			data: 
			{
				feedBack:this.data.checkbox
				
			},
			success: function (res) {
				console.log('更新成功', res);
				// 在此处执行其他操作
			},
			fail: function (error) {
				console.error('更新失败', error);
			}
		})
	}
})