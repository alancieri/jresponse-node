var { JPagination } = require('./JPagination')

class JCursor extends JPagination {

  constructor (req, total = 0, options = {}) {
    super(req, options)
    this.current = 0
    this.prev = 0
    this.next = 0
    this.build()
  }

  move (newCursor, limit = 0) {
    this.next = newCursor
    this.limit = limit
    let nextPage = this.replacePage('previous', this.prev, this.current)
    nextPage = this.replacePage('cursor', this.current, this.next, nextPage)
    console.log(nextPage)
    this.nextPage = nextPage
    return this.set()
  }

  build () {
    const query = this.req.query
    const defaultLimit = this.options.defaultLimit
    const maxItems = this.options.maxItems
    const cursorKey = this.options.cursorKey
    const limitKey = this.options.limitKey
    const prevKey = this.options.prevKey
    this.current = (query[cursorKey] !== undefined && query[cursorKey] !== '') ? query[cursorKey] : null
    this.prev = (query[prevKey] !== undefined && query[prevKey] !== '') ? query[prevKey] : null
    let limit = (query[limitKey] !== undefined) ? parseInt(query[limitKey]) : (query[limitKey] = defaultLimit)
    this.limit = (limit > maxItems) ? maxItems : limit
    return this.set()
  }

  set () {
    this.pagination = { current: this.current, prev: this.prev, limit: this.limit, next: this.next, nextPage: this.nextPage }
    return this
  }

  replacePage (key, value, replacement, url = null) {
    url = (url === null) ? this.req.protocol + '://' + this.req.get('host') + this.req.originalUrl : url
    if (url.indexOf(key) === -1) {
      const prefix = (url.indexOf('?') === -1) ? '?' : '&'
      return `${url}${prefix}${key}=${replacement}`
    }
    else return url.replace(`${key}=${value}`, `${key}=${replacement}`)
  }
}

module.exports.JCursor = JCursor
