// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV }) // 使用当前云环境

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
	const wxContext = cloud.getWXContext()
  try {
    const collection = event.collection
    const arr = event.toChangeArr
		
    return await db.collection(collection).where({
      _id: db.command.in(arr)
    }).update({
			data: {
				status: '2'
			}
      
    })
  } catch (error) {
    return error
  }
}
