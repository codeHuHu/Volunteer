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