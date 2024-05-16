// 全局微信变量
wx.$param = require('./param').param
// 封装的wx微信全局方法
wx.$ajax = function (option) {

	return new Promise(function (resolve, reject) {
		if (option.method == undefined || typeof option.method !== "string") {
			option.method = "POST"
		}
		if (option.url == undefined) {
			option.url = wx.$param.server["springboot"]
		}
		if (option.header == undefined || typeof option.header != 'object') {
			option.header = {
				'content-type': 'application/x-www-form-urlencoded'
			}
			// header: {
			// 	'content-type': 'application/json'
			// }
		}
		if (typeof option.url === 'string' && option.url.indexOf("http") == -1) {
			option.url = wx.$param.server["springboot"] + option.url
		}
		if (typeof option.loading == "boolean" && option.loading) {
			wx.showLoading({
				title: '加载中',
				duration: 60000,
				mask: true,
			})
		} else if (typeof option.loading == "string") {
			wx.showLoading({
				title: option.loading,
				duration: 10000,
				mask: true,
			})
		}
		// 携带cookie
		option.header["Authorization"] = wx.getStorageSync("JWT_Token")
		wx.request({
			url: option.url,
			data: option.data,
			method: option.method.toUpperCase(),
			header: option.header,
			success: (res) => {
				// http响应错误
				if (res.statusCode >= 400) {
					console.log("请求响应错误");
					//认证失败,清除本地token
					if (res.statusCode == 401) {
						console.log("认证失败,清除本地token 和 userInfo");
						wx.removeStorageSync('JWT_Token')
						wx.removeStorageSync('userInfo')
					}

					let msg = res.statusCode == 429 ? '\n操作频繁,请一分钟后再操作' : res.data.detail
					msg = msg ? msg : res.errMsg
					msg = String(res.statusCode) + " 错误" + msg
					//返回错误信息
					reject({
						when: "http_status_error",
						error: msg,
						detail: msg,
					})
					//显示错误信息
					if (option.showErr == false) return
					wx.showModal({
						title: '提示',
						content: msg,
						showCancel: false
					})
					return
				}
				if (res.data.code == 50000) {
					let msg = res.data.msg
					//返回错误信息
					reject({
						when: "请求错误",
						error: msg,
						detail: msg,
					})
					return;
				}
				// 只返回data
				if (res.data) {
					resolve(res.data)
				}
			},
			fail: (err) => {
				reject({
					when: "origin_error",
					error: err
				})
				wx.showModal({
					title: '错误提示',
					content: JSON.stringify(err),
					showCancel: false
				})
			},
			complete: (res) => {
				//不管成功还是失败,都显示一下
				console.log("complete response:" + option.url, res)
				if (!!option.loading) {
					wx.hideLoading()
				}
			}
		})
	})
}

/**
 * 页面转跳封装
 * @method wx.$navTo
 * @param {object|string}  e    如果是字符串，直接跳转；对象，就解析到e.target.dataset.url
 * @param {object} args         页面参数
 */
wx.$navTo = function (e, args) {
	if (e == undefined && arg == undefined) return
	console.log('func: navTo', e, args)
	let args_str = []

	//处理参数
	if (typeof args === 'object') {
		for (let i in args) {
			args_str.push(i + '=' + encodeURIComponent(args[i]))
		}
		args_str = '?' + args_str.join("&")
	} else {
		args_str = ''
	}

	if (typeof e == 'object') {
		if (e.target.dataset && e.target.dataset.url) {
			wx.navigateTo({
				url: e.target.dataset.url + args_str,
				fail: err => {
					console.warn(err)
					// wx.switchTab({
					//     url: e.target.dataset.url + args_str,
					//     fail: err => {
					//         console.err(err)
					//     }
					// })
				}
			})
		} else if (e.currentTarget.dataset && e.currentTarget.dataset.url) {
			wx.navigateTo({
				url: e.currentTarget.dataset.url + args_str,
				fail: err => {
					console.warn(err)
				}
			})
		}
	} else {
		wx.navigateTo({
			url: e + args_str,
			fail: err => {
				console.warn(err)
			}
		})
	}
}