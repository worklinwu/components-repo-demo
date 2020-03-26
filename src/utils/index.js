import { cloneDeep } from 'lodash'

export function dateFormat(time, format = 'yyyy-MM-dd') {
  let date
  if (typeof time === 'object') {
    date = time
  } else {
    if ((typeof time === 'string') && (/^[0-9]+$/.test(time))) {
      time = parseInt(time)
    }
    if ((typeof time === 'number') && (time.toString().length === 10)) {
      time = time * 1000
    }
    date = new Date(time)
  }
  let matchResult
  const opt = {
    '[Yy]+': date.getFullYear().toString(),
    'M+': (date.getMonth() + 1).toString(),
    '[Dd]+': date.getDate().toString(),
    '[Hh]+': date.getHours().toString(),
    'm+': date.getMinutes().toString(),
    '[Ss]]+': date.getSeconds().toString()
  }
  for (const k in opt) {
    matchResult = new RegExp('(' + k + ')').exec(format)
    if (matchResult) {
      format = format.replace(matchResult[1], (matchResult[1].length === 1) ? (opt[k]) : (opt[k].padStart(matchResult[1].length, '0')))
    }
  }
  return format
}

/**
 * 时间格式化
 * @param {number} time
 * @param {string} option
 * @returns {string}
 */
export function formatTime(time, option) {
  if (('' + time).length === 10) {
    time = parseInt(time) * 1000
  } else {
    time = +time
  }
  const d = new Date(time)
  const now = Date.now()

  const diff = (now - d) / 1000

  if (diff < 30) {
    return '刚刚'
  } else if (diff < 3600) {
    // less 1 hour
    return Math.ceil(diff / 60) + '分钟前'
  } else if (diff < 3600 * 24) {
    return Math.ceil(diff / 3600) + '小时前'
  } else if (diff < 3600 * 24 * 2) {
    return '1天前'
  }
  if (option) {
    return parseTime(time, option)
  } else {
    return (
      d.getMonth() +
      1 +
      '月' +
      d.getDate() +
      '日' +
      d.getHours() +
      '时' +
      d.getMinutes() +
      '分'
    )
  }
}

/**
 * 转换url中的参数
 * @param {string} url
 * @returns {Object}
 */
export function param2Obj(url) {
  const search = url.split('?')[1]
  if (!search) {
    return {}
  }
  return JSON.parse(
    '{"' +
    decodeURIComponent(search)
      .replace(/"/g, '\\"')
      .replace(/&/g, '","')
      .replace(/=/g, '":"')
      .replace(/\+/g, ' ') +
    '"}'
  )
}

/**
 * Show plural label if time is plural number
 * @param {number} time
 * @param {string} label
 * @return {string}
 */
function pluralize(time, label) {
  if (time === 1) {
    return time + label
  }
  return time + label + 's'
}

/**
 * 距离指定时间进过多久
 * @param {number} time
 */
export function timeAgo(time) {
  const between = Date.now() / 1000 - Number(time)
  if (between < 3600) {
    return pluralize(~~(between / 60), ' 分钟')
  } else if (between < 86400) {
    return pluralize(~~(between / 3600), ' 小时')
  } else {
    return pluralize(~~(between / 86400), ' 天')
  }
}

/**
 * 数字格式化
 * like 10000 => 10k
 * @param {number} num
 * @param {number} digits
 */
export function numberFormatter(num, digits) {
  const si = [
    { value: 1E18, symbol: 'E' },
    { value: 1E15, symbol: 'P' },
    { value: 1E12, symbol: 'T' },
    { value: 1E9, symbol: 'G' },
    { value: 1E6, symbol: 'M' },
    { value: 1E3, symbol: 'k' }
  ]
  for (let i = 0; i < si.length; i++) {
    if (num >= si[i].value) {
      return (num / si[i].value + 0.1).toFixed(digits).replace(/\.0+$|(\.[0-9]*[1-9])0+$/, '$1') + si[i].symbol
    }
  }
  return num.toString()
}

/**
 * 文件大小格式化
 * @param value
 * @returns {string}
 */
export function fileSizeFormatter(value) {
  if (value == null || value === '' || value === 0) {
    return '0 Bytes'
  }
  const unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const originSize = parseFloat(value)
  const index = Math.floor(Math.log(originSize) / Math.log(1024))
  let size = originSize / Math.pow(1024, index)
  //  保留的小数位数
  size = size.toFixed(2)
  return size + unitArr[index]
}

/**
 * 金额格式化
 * 10000 => "10,000"
 * @param {number} num
 */
export function toThousandFilter(num) {
  return (+num || 0).toString().replace(/^-?\d+/g, m => m.replace(/(?=(?!\b)(\d{3})+$)/g, ','))
}

/**
 * Upper case first char
 * @param {String} string
 */
export function uppercaseFirst(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

export function getSource(source, type) {
  const regex = new RegExp(`<${type}[^>]*>`)
  let openingTag = source.match(regex)

  if (!openingTag) {
    return ''
  } else {
    openingTag = openingTag[0]
  }

  return source.slice(
    source.indexOf(openingTag) + openingTag.length,
    source.lastIndexOf(`</${type}>`)
  )
}

const charSet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

export function getUuid(length = 32) {
  const charSetLen = charSet.length
  let outStr = ''
  for (let i = 0; i < length; i++) {
    outStr = outStr.concat(
      charSet.charAt(Math.floor(Math.random(0, 1) * charSetLen))
    )
  }
  return outStr
}

/**
 * 数组结构转换为树结构数据
 * @param arrayData 源数据
 * @param parentId 父节点字段
 * @param parentKey 父节点key值
 * @param childrenKey 子节点的key值
 * @param idKey id的key值
 * @returns {Array}
 */
export function arrayToTree(arrayData, parentId = '', parentKey = 'parentId', childrenKey = 'children', idKey = 'id') {
  const arr = cloneDeep(arrayData)

  const rootList = arr.filter((item) => {
    // 服务端返回的数据, parent没有的情况可能返回 null 值, 统一转换成 ''
    if (item[parentKey] === null) {
      item[parentKey] = ''
    }
    if (item[parentKey] === parentId) {
      return item
    }
  })

  function listToTreeData(rootItem, arr, parentKey, idKey) {
    arr.forEach((item) => {
      if (item[parentKey] === rootItem[idKey]) {
        if (!rootItem[childrenKey]) {
          rootItem[childrenKey] = []
        }
        rootItem[childrenKey].push(item)
      }
    })

    if (rootItem[childrenKey] && rootItem[childrenKey].length > 0) {
      rootItem[childrenKey].forEach((item) => {
        listToTreeData(item, arr, parentKey, idKey)
      })
    } else {
      return false
    }
  }

  rootList.map((rootItem) => {
    listToTreeData(rootItem, arr, parentKey, idKey)
    return rootItem
  })

  return rootList
}

/**
 * 树结构数据转换为数组格式
 * @param treeData
 * @param parentKey
 * @param childrenKey
 * @returns {Array}
 */
export function treeToArray(treeData, parentKey = 'pid', childrenKey = 'children') {
  if (!treeData || treeData.length === 0) {
    return []
  }
  let result = []
  for (let i = 0; i < treeData.length; i++) {
    if (treeData[i][childrenKey] && treeData[i][childrenKey].length) {
      result = result.concat(treeToArray(treeData[i][childrenKey], parentKey, childrenKey))
    }
    delete treeData[i][childrenKey]
    result.push(treeData[i])
  }
  return result
}

/**
 * 寻找树节点
 */
export function findTreeData(treeData, targetId, idKey = 'id', childrenKey = 'children') {
  let result = null
  for (let i = 0; i < treeData.length; i++) {
    if (treeData[i][idKey] === targetId) {
      result = treeData[i]
    } else if (treeData[i][childrenKey] && treeData[i][childrenKey].length) {
      result = findTreeData(treeData[i].children, targetId, idKey, childrenKey)
    }
    if (result) {
      break
    }
  }

  return result
}

/**
 * 计算树的深度
 */
export function treeDeep(treeData) {
  const childrenDepth = []
  const queue = treeData instanceof Array ? treeData : [treeData]
  let index = 0

  if (!queue.length) {
    return 0
  }

  while (queue[index]) {
    childrenDepth.push(treeDeep(queue[index].children || []))
    index++
  }
  return Math.max(...childrenDepth) + 1
}

/**
 * 树过滤
 */
export function treeFilter(treeData, filterMethod) {
  if (!(treeData instanceof Array)) {
    return treeData
  }
  let data = cloneDeep(treeData)
  for (let i = 0; i < data.length; i++) {
    if (data[i].children && data[i].children.length) {
      data[i].children = treeFilter(data[i].children, filterMethod)
    }
  }
  data = filterMethod(data)
  return data
}

/**
 * 解析pdf的html内容, 不支持嵌套结构的数据
 */
export function htmlParser(htmlStr) {
  htmlStr = htmlStr.replace(/<!DOCTYPE.*?>/, '')
  htmlStr = htmlStr.replace(/\n/g, '')

  const patternTag = '<(table|p)\\s?(.*?)>(.*?)<\\/(?:table|p)>'
  const patternAttr = '(\\S+?)=[\\\'|\\"](.*?)[\\\'|\\"]'
  const tags = htmlStr.match(new RegExp(patternTag, 'g'))

  return tags.map(tag => {
    const regexpResult = new RegExp(patternTag, 'g').exec(tag)
    const attrStr = regexpResult[2]
    const tagObject = {
      tag: regexpResult[1],
      content: htmlDecode(regexpResult[3]),
      attr: {}
    }

    // 解析属性
    attrStr.match(new RegExp(patternAttr, 'g')).forEach(attr => {
      const regexpAttrResult = new RegExp(patternAttr, 'g').exec(attr)
      if (regexpAttrResult && regexpAttrResult[1] && regexpAttrResult[2]) {
        tagObject.attr[regexpAttrResult[1]] = regexpAttrResult[2]
      }
    })

    return tagObject
  })
}

/**
 * html编码转换
 * @param str
 * @returns {void | string | never}
 */
export function htmlDecode(str) {
  return str.replace(/&#(x)?([^&]{1,5});?/g, function($, $1, $2) {
    return String.fromCharCode(parseInt($2, $1 ? 16 : 10))
  })
}

/**
 * 区域代码解构
 * @param code
 * @returns {string[]}
 */
export function areaDecode(code) {
  if (!code || typeof code !== 'string' || code.length !== 6) {
    return ['', '', '']
  }

  // 区域是六位数字 例如 code:350203 表示 福建省,厦门市,思明区. 每两位代表一个级别, 如果是 '00', 表示全部或者空值.
  const province = code.substr(0, 2) + '0000'
  const city = code.substr(2, 2) === '00' ? '' : code.substr(0, 4) + '00'
  const district = code.substr(4, 2) === '00' ? '' : code

  return [province, city, district]
}

/**
 * 区域代码重构
 * @returns {string[]}
 * @param codeArray
 */
export function areaEncode(codeArray) {
  let result
  for (let i = codeArray.length; i >= 0; i--) {
    if (codeArray[i]) {
      result = codeArray[i]
      break
    }
  }
  return result
}

export function arrayToMap(array, mapKey) {
  const mapValue = {}
  array.forEach(item => {
    mapValue[item[mapKey].toString()] = item
  })
  return mapValue
}

export function getTreeNodePath(treeData, target, targetKey = 'id', childrenKey = 'children') {
  let result = []
  if (!(treeData instanceof Array)) {
    treeData = [treeData]
  }
  for (let i = 0; i < treeData.length; i++) {
    if (treeData[i][targetKey] === target) {
      result.push(treeData[i])
      break
    }
    if (treeData[i].children && treeData[i].children.length) {
      result = result.concat(getTreeNodePath(treeData[i][childrenKey], target, targetKey, childrenKey))
      if (result.length) {
        result.unshift(treeData[i])
        break
      }
    }
  }
  return result
}

/**
 * post 方式下载文件
 * @param url
 * @param params
 */
export function postDownload(url, params) {
  const form = document.createElement('form')
  form.style.display = 'none'
  form.target = '_blank'
  form.method = 'post'
  form.action = url
  Object.keys(params).forEach(key => {
    if (params[key]) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = params[key]
      form.appendChild(input)
    }
  })
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

/**
 * get 方式下载文件
 * @param url
 * @param params
 */
export function getDownload(url, params) {
  const form = document.createElement('form')
  form.style.display = 'none'
  form.target = '_blank'
  form.method = 'get'
  form.action = url
  Object.keys(params).forEach(key => {
    if (params[key]) {
      const input = document.createElement('input')
      input.type = 'hidden'
      input.name = key
      input.value = params[key]
      form.appendChild(input)
    }
  })
  document.body.appendChild(form)
  form.submit()
  document.body.removeChild(form)
}

/**
 * 数据比对, 并标记比对的差异
 * 在处理复杂的对象(一个数据下有关联其他对象的数据), 为了避免全量更新数据, 需要对数据进行比对, 把两个 model 中的差异用 rowState 记录
 * rowState( 0:无变更  1:新增  2:删除  3:修改 )
 * @param model
 * @param originModel
 */
// export function modelCompare (model, originModel) {
//   let result = cloneDeep(model)
//
//   // 新增
//   if (!!model && !originModel) {
//     result.rowState = '1'
//   }
//   // 删除
//   if (!model && !!originModel) {
//     result = cloneDeep(originModel)
//     result.rowState = '2'
//   }
//   // 修改
//   if (isEqual(model, originModel)) {
//     result.rowState = '0'
//   } else {
//     result.rowState = '3'
//   }
//
//   // 处理子级
//   Object.keys(model).forEach(fieldKey => {
//     let fieldValue = model[fieldKey]
//     // 如果该字段是数组
//     if (fieldValue instanceof Array && fieldValue.length) {
//       // TODO 如果是删除的节点怎么判断
//       fieldValue.forEach(item => {
//         // 判断是否是修改
//         let originItem = originModel && originModel[fieldKey].filter(originItem => originItem.id === item.id)
//         // 如果存在就递归判断两者的状态
//         item = modelCompare(item, originItem && !!originItem.length && originModel[0])
//       })
//     }
//   })
// }

export function setHeightToBottom(dom, bottomOffset = 20) {
  dom.style.height = (document.body.clientHeight - dom.offsetTop - 50 - bottomOffset) + 'px'
}

/**
 * 对象字段映射
 * @param model
 * @param fieldMap
 * @returns {*}
 */
export function modelKeyMap(model, fieldMap) {
  const _model = { ...model }
  Object.entries(fieldMap).forEach(([key, mapKey]) => {
    _model[mapKey] = _model[key]
    delete _model[key]
  })
  return _model
}
