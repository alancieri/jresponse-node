const setJResponse = () => {
  return (req, res, next) => {
    res.JRes = new JResponse(res)
    next()
  }
}

class JPagination {
  constructor (req, total = 0, options = {}) {
    this.pagination = {}
    this.options = {
      maxItems: 250,
      metaKey: 'pagination',
      limitKey: 'limit',
      pageKey: 'page'
    }
    this.req = req
    Object.assign(this.options, options)
    this.set(total)
  }

  set (total) {
    const query = this.req.query
    const maxItems = this.options.maxItems
    const limitKey = this.options.limitKey
    const pageKey = this.options.pageKey

    let limit = (query[limitKey] !== undefined && !isNaN(query[limitKey])) ? parseInt(query[limitKey]) : (query[limitKey] = maxItems)
    limit = (limit > maxItems) ? maxItems : limit
    let page = (query[pageKey] !== undefined && !isNaN(query[pageKey])) ? parseInt(query[pageKey]) : query[pageKey] = 1
    let pages = (total > 0) ? Math.ceil(total / limit) : 1

    if (page >= pages) { page = pages }
    if (page <= 1) { page = 1 }

    let offset = limit * (page - 1)
    const urls = this.getUrls(page, pages)
    this.pagination = { limit, page, pages, offset, start: urls.start, prev: urls.prev, next: urls.next, last: urls.last }
  }

  getUrls (page, pages) {
    this.page = page
    let start = this.replacePage(1)
    let last = (page < pages) ? this.replacePage(pages) : null
    let prev = (page > 1) ? this.replacePage((page - 1)) : null
    let next = (page < pages) ? this.replacePage((page + 1)) : null
    return { start, prev, next, last }
  }

  replacePage (replacement) {
    let url = this.req.protocol + '://' + this.req.get('host') + this.req.originalUrl
    if (url.indexOf(this.options.pageKey) === -1) {
      const prefix = (url.indexOf('?') === -1) ? '?' : '&'
      return `${url}${prefix}${this.options.pageKey}=${replacement}`
    }
    else return url.replace(`${this.options.pageKey}=${this.page}`, `${this.options.pageKey}=${replacement}`)
  }

  get () {
    let pagination = {}
    pagination[this.options.metaKey] = this.pagination
    return pagination
  }
}

class JResponse {
  constructor (res) {
    this.res = res
    this.code = null
    this.response = {
      success: true, count: 0, data: [], errors: []
    }
  }

  static success (data = []) {
    data = (Array.isArray(data)) ? data : [data]
    return JResponse.send(true, data, [])
  }

  static errors (errors = []) {
    errors = (Array.isArray(errors)) ? errors : [errors]
    return JResponse.send(false, [], errors)
  }

  static send (success = true, data = [], errors = []) {
    data = (data === null) ? [] : data
    data = (Array.isArray(data)) ? data : [data]

    errors = (errors === null) ? [] : errors
    errors = (Array.isArray(errors)) ? errors : [errors]

    let response = { success: true, count: data.length, data: data, errors: errors }
    response.success = !!(errors.length == 0)
    return response
  }

  sendResponse (success = true, data = [], errors = [], code = null) {
    data = (data === null) ? [] : data
    Array.isArray(data) ? this.response.data = this.response.data.concat(data) : this.response.data.push(data)

    errors = (errors === null) ? [] : errors
    Array.isArray(errors) ? this.response.errors = this.response.errors.concat(errors) : this.response.errors.push(errors)

    if (this.response.errors.length > 0) {
      this.response.success = false
    }

    this.code = (code !== undefined && code !== null && !isNaN(code)) ? code : this.code

    this.response.count = this.response.data.length
    return this.res.status(this.code).send(this.response)
  }

  sendSuccess (data, code) {
    data = (data === null) ? [] : data
    Array.isArray(data) ? this.response.data = this.response.data.concat(data) : this.response.data.push(data)
    this.code = (code !== undefined && code !== null && !isNaN(code)) ? code : 200
    return this.sendResponse(true)
  }

  sendErrors (errors, code) {
    errors = (errors === null) ? [] : errors
    Array.isArray(errors) ? this.response.errors = this.response.errors.concat(errors) : this.response.errors.push(errors)
    this.response.success = false
    this.code = (code !== undefined && code !== null && !isNaN(code)) ? code : 400
    return this.sendResponse(false)
  }

  appendError (errors, code) {
    errors = (errors === null) ? [] : errors
    Array.isArray(errors) ? this.response.errors = this.response.errors.concat(errors) : this.response.errors.push(errors)
    this.code = (code !== undefined && code !== null && !isNaN(code)) ? code : 400
    return true
  }

  paginate (optinal) {
    if (optinal === undefined || optinal === null) return
    if (optinal instanceof JPagination) { this.merge(optinal.get()) }
    return this
  }

  merge (list = []) {
    list = (list === null) ? [] : list
    list = !Array.isArray(list) ? [list] : list
    if (list.length == 0) return false
    for (const item of list)
      for (var key in item)
        if (item.hasOwnProperty(key))
          this.set(key, item[key])
  }

  set (key, value) {
    if (key === null || value === null
      || key === undefined || value === undefined
      || typeof key !== 'string') return false
    this.response[key] = value
    return true
  }

}

module.exports.JResponse = JResponse
module.exports.JPagination = JPagination
module.exports.setJResponse = setJResponse
