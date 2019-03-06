var { JPagination } = require('./JPagination')

class JCursor extends JPagination {

  constructor (req, options = {}) {
    super(req, options)

    this.direction = 'next'
    this.order = -1
    this.maxId = null
    this.sinceId = null
    this.nextUrl = null
    this.prevUrl = null
    this.filter = null
    this.build()
  }

  build () {
    const query = this.req.query
    this.maxId = (query.max_id !== undefined && query.max_id !== '') ? query.max_id : null
    this.sinceId = (query.since_id !== undefined && query.since_id !== '') ? query.since_id : null
    this.filter = null
    if (this.sinceId !== null) {
      this.direction = 'prev'
      this.order = 1
    }

    this.nextUrl = null
    this.prevUrl = null

    return this.set()
  }

  displayFilter (cursorKey = 'id', dialect = 'nosql') {

    this.filter = {}
    let operator
    let value

    if (this.maxId === null && this.sinceId === null)
      return Object.assign(this.pagination, { filter: null})

    if (this.maxId !== null && this.direction == 'next') {
      operator = '$lt'
      value = this.maxId
    }
    else if (this.sinceId !== null && this.direction == 'prev') {
      operator = '$gt'
      value = this.sinceId
    }

    let condition = {}
    if (dialect == 'nosql') {
      condition[operator] = value
    }

    if (dialect == 'plain') {
      condition = operator.replace('$lt', 'less than').replace('$gt', 'greater than') + ' ' + value
    }

    if (dialect == 'sql') {
      condition = operator.replace('$lt', '<').replace('$gt', '>') + ' ' + value
    }

    this.filter[cursorKey] = condition
    Object.assign(this.pagination, { filter: this.filter })
  }

  set (maxId = null, sinceId = null) {

    if (maxId !== null) { this.maxId = maxId }
    if (sinceId !== null) { this.sinceId = sinceId }

    if (this.maxId !== null) { this.nextUrl = this.replaceUrl({ 'max_id': this.maxId }) }
    if (this.sinceId !== null) { this.prevUrl = this.replaceUrl({ 'since_id': this.sinceId }) }

    Object.assign(this.pagination, {
      maxId: this.maxId,
      sinceId: this.sinceId,
      limit: this.limit,
      direction: this.direction,
      order: this.order,
      nextUrl: this.nextUrl,
      prevUrl: this.prevUrl
    })
    return this
  }

  replaceUrl (params) {
    const url = this.req.protocol + '://' + this.req.get('host') + this.req.path
    params = Object.assign({ 'limit': this.limit }, params)
    return url + '?' + Object.keys(params).map((key) => {
      return key + '=' + params[key]
    }).join('&')
  }

}

module.exports.JCursor = JCursor
