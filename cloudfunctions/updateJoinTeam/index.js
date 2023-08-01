// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()
	console.log(123)
	if (event.docName) {
		var tmp ={
		
			openid: wxContext.OPENID,
			Name:event.myname,
			phone:event.myphone,
		}
		return cloud.database().collection(event.collectionName)
			.doc(event.docName)
			.update({
				data : 
				{
					member :db.command.inc(event.Add),
					teamMembers :db.command.push(tmp)
				}
			})
		//return event.docName
	} else {
		return event.collectionName
	}
}