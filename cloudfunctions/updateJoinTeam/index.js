// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
	env: cloud.DYNAMIC_CURRENT_ENV
}) // 使用当前云环境
const db = cloud.database()
// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()

	if (event.docName) {
		var tmp = {
			member: db.command.inc(event.Add),
			teamMembers: event.newJoinMembers ? event.newJoinMembers : db.command.push(wxContext.OPENID)
		}
		return cloud.database().collection(event.collectionName)
			.doc(event.docName)
			.update({
				data: tmp
			})
		//return event.docName
	} else {
		return event.collectionName
	}
}