
const XLSX = require('./excel.js') //引入
module.exports = {
    exportExcel(sheet, fileName) {
        // XLSX插件使用
        //自定义列宽
        const colWidth = [
            { wch: 13 },
            { wch: 26 },
            { wch: 7 },
            { wch: 10 },
            { wch: 11 },
            { wch: 35 },
            { wch: 13 },
            { wch: 25 },
            { wch: 10 },
            { wch: 10 },
            { wch: 13 },
            { wch: 13 },
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
        let filePath = `${wx.env.USER_DATA_PATH}/${fileName}.xlsx`
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
    //mask名字
    // M(name) {
    // 	return name.replace(/(?<=^[\u4e00-\u9fa5])[^\u4e00-\u9fa5](?=[\u4e00-\u9fa5]$)/g, "*")
    // },

}
