/*--------------- model namespace ---------------*/

export const NUser = "NUser";

/*--------------- reducers ---------------*/
export const RSetState = "RSetState";
export const QueryWhetherLogon = "QueryWhetherLogon"; //判断是否 授权手机号登录
/*--------------- effects ---------------*/
// 通用
export const EPost = "EPost"; //创建
export const EGet = "EGet"; //获取
export const EPut = "EPut"; //更新
export const EDelete = "EDelete"; //删除
export const EPutDefault = "EPutDefault"; //设置默认
export const EGetInfo = "EGetInfo"; //获取服务详情
export const EGetDetail = "EGetDetail"; //获取订单详情
export const EPutMoney = "EPutMoney"; //申请退款
export const EGetDefault = "EPutDefault"; //获取默认就诊人
export const EGetAddress = "EGetAddress"; //获取默认地址
export const EPutInfo = "EPutInfo"; //修改就诊信息
export const EPutOrder = "EPutOrder"; //取消订单
export const EPutSure = "EPutSure"; //确认收货
export const EGetComment = "EGetComment"; //获取评论列表
