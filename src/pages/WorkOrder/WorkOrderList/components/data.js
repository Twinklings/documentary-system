

// 状态
export const ORDERSTATUS = [
  {"name":"待回复",key:0},
  {"name":"已回复",key:1},
  {"name":"已完成",key:2},
]

export function currentTime() {
  var myDate = new Date();
  var year = myDate.getFullYear();
  var month = myDate.getMonth()+1;
  var day = myDate.getDate();
  var hour = myDate.getHours();
  var minute = myDate.getMinutes();
  var second = myDate.getSeconds();
  return year+'_'+month+'_'+day+'_ '+hour+':'+minute+':'+second;
}
