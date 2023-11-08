// pages/upLoadFile.js
const app=getApp()
Page({

	/**
	 * 页面的初始数据
	 */
	data: {
	number:'17325977262'
	},

	getPhoneNumber(e){
		console.log(e)
    let cloudID = e.detail.cloudID //开放数据ID      	
		console.log(cloudID)
    if (!cloudID) {
        wx.showToast('用户未授权')
        return
    }
    // 调用云函数获取手机号
    // wx.cloud.callFunction({
    //     name: 'getPhoneNum',
    //     data: {
    //       weRunData: wx.cloud.CloudID(e.detail.code),
    //     }
    //   })
    //   .then( res => {
    //       console.log('手机号', res.result)
    //   })
    //   .catch( err => {
    //     console.log('手机号err', err)
    //   })
  },

	/**
	 * 生命周期函数--监听页面加载
	 */
	onLoad(options) {
		var number =this.data.number.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
		this.setData({
			number
		})
		
		// this.data.apple.push(a); // 将对象 a 添加到数组中
		// this.data.apple.push(b); // 将对象 b 添加到数组中
		let c={}
		c['apple']=1
		this.setData({
			c
		})
		// console.log(this.data.apple[0])
		console.log(this.data.c)
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

		uploadfile: function(){
			var that = this
			wx.chooseMessageFile({
				count: 1,//能选择文件的数量
				type: 'file',//能选择文件的类型,我这里只允许上传文件.还有视频,图片,或者都可以
				success(res) {
				//	console.log(res)
					//文件临时路径
					const tempFilePaths = res.tempFiles[0].path
			//后缀名的获取
					const houzhui = tempFilePaths.match(/\.[^.]+?$/)[0];
			//存储在云存储的地址
					const cloudpath = 'word/' + new Date().getTime() + houzhui;
					//获取fileID
					wx.cloud.uploadFile({
						cloudPath: cloudpath,
						filePath: tempFilePaths,
						success: res => {
							console.log(res.fileID)
							//存储fileID，之后用的到
							that.setData({
								fileid:res.fileID
							})
						},
						fail: err => {
							console.log(err)
						},
					})
				}
			})
		},
		openfile:function(){
			var fileid = this.data.fileid;
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
					//根据https路径可以获得http格式的路径(指定文件下载后存储的路径 (本地路径)),根据这个路径可以预览
					wx.downloadFile({
						url: that.data.imgSrc,
						success: (res) => {
							console.log(res)
							that.setData({
								httpfile: res.tempFilePath
							})
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

		
	
	
	
})