export function getDataByPage(condition, pageInfo) {
  return new Promise(function (resolve, reject) {
    var records = []
    var length = pageInfo?.pageSize || 10
    for (let i = 0; i < length; i++) {
      records.push({
        'id': (pageInfo.currentPage || 1) + i,
        'name': `page_${pageInfo.currentPage} - item_${i}${condition?.keyword ? `(${condition.keyword})` : ''}`,
        'random': Math.floor(Math.random() * 1000000),
        'date': new Date().getTime()
      })
    }
    resolve({
      'pageSize': pageInfo?.pageSize || 10,
      'totalRecord': 3643,
      'currentPage': pageInfo?.currentPage || 1,
      'totalPage': 365,
      'records': records,
    })
  })
}

export function getArrayData() {
  return new Promise(function (resolve, reject) {
    var result = []

    for (let i = 0; i < 10; i++) {
      result.push({
        'id': i + 1,
        'name': `name_${i + 1}`,
        'random': Math.floor(Math.random() * 1000000),
        'date': new Date().getTime()
      })
    }

    resolve(result)
  })
}
