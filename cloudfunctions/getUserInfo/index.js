// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()
	 var myopenid=event.openid;
	// const Infoarr=[]
	
	return cloud.database().collection('UserInfo').where({
		_openid:myopenid
	}).get({
	})
}