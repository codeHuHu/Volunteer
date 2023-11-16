'use strict'

module.exports = {
	//补零操作
	Z(num, length = 2) {
		return ("0000000000000000" + num).substr(-length);
	},
	//mask名字
	// M(name) {
	// 	return name.replace(/(?<=^[\u4e00-\u9fa5])[^\u4e00-\u9fa5](?=[\u4e00-\u9fa5]$)/g, "*")
	// },

}

