'use strict'

module.exports = {
	//补零操作
	Z(num, length = 2) {
		return ("0000000000000000" + num).substr(-length);
	}
}

