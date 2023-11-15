'use strict'

module.exports = {
	Z(num, length = 2) {
		return ("0000000000000000" + num).substr(-length);
	}
}

