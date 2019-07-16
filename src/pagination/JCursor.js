var { JPagination } = require('./JPagination')

class JCursor extends JPagination {

  constructor (req, options = {}) {
    super(req, options)

    this.direction = 'before'
    this.order = -1
    this.before = null
    this.after = null
    this.nextUrl = null
    this.prevUrl = null
    this.filter = null
    this.build()
  }

  build () {
    const query = this.req.query
    this.before = (query.before !== undefined && query.before !== '') ? query.before : null
    this.after = (query.after !== undefined && query.after !== '') ? query.after : null
    this.filter = null
    if (this.after !== null) {
      this.direction = 'after'
      this.order = 1
    }

    this.nextUrl = null
    this.prevUrl = null

    return this.set()
  }

  displayFilter (cursorKey = 'id', dialect = 'nosql') {

    this.currentFilter = {}
    let operator
    let value

    if (this.before === null && this.after === null)
      return Object.assign(this.pagination, { currentFilter: null })

    if (this.before !== null && this.direction == 'before') {
      operator = '$lt'
      value = this.before
    }
    else if (this.after !== null && this.direction == 'after') {
      operator = '$gt'
      value = this.after
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

    this.currentFilter[cursorKey] = condition
    Object.assign(this.pagination, { currentFilter: this.currentFilter })
  }

  set (before = null, after = null) {

    if (before !== null) { this.before = before }
    if (after !== null) { this.after = after }

    if (this.before !== null) { this.nextUrl = this.replaceUrl({ 'before': this.before }) }
    if (this.after !== null) { this.prevUrl = this.replaceUrl({ 'after': this.after }) }

    Object.assign(this.pagination, {
      before: this.before,
      after: this.after,
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
