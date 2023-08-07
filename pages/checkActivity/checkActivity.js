// pages/newActivity/newActivity.js
Page({

	/**
	 * 页面的初始数据
	 */
  data: {
		index: null,
		modalName: null,
		tempID:null,
		tempValue:null,
		arrayName:'',
		signInList:[], //签到表
		imgList: [], //活动图片
		people:[],  //活动人员
		checkbox: [{
      id: 0,
      name: '张三',
			checked: false,
			isCome:true,
			notGoodReason:''
    }, {
      id: 1,
      name: '李四',
			checked: true,
			isCome:true,
			notGoodReason:''
    }, {
      id: 2,
      name: '王五',
			checked: true,
			isCome:false,
			notGoodReason:''
    }, {
      id: 3,
      name: '赵六',
			checked: false,
			isCome:true,
			notGoodReason:''
    }, {
      id: 4,
      name: '赵四',
			checked: false,
			isCome:true,
			notGoodReason:''
    }, {
      id: 5,
      name: '沈六',
			checked: false,
			isCome:true,
			notGoodReason:''
    }]
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
  onLoad: function() {

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

	/**
	 * 生命周期函数--监听页面卸载
	 */
	onUnload() {

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
			item.notGoodReason = e.detail.value;
		}
		return item;
	});
	this.setData({
		checkbox: checkbox
	});
  },
})