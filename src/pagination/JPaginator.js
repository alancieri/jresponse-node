var { JPagination } = require('./JPagination')

class JPaginator extends JPagination {
  constructor (req, total = 0, options = {}) {
    super(req, options)
    this.pagination = {}
    this.build(total)
  }

  build (total) {
    const query = this.req.query
    const pageKey = this.options.pageKey

    let page = (query[pageKey] !== undefined && !isNaN(query[pageKey])) ? parseInt(query[pageKey]) : query[pageKey] = 1
    let pages = (total > 0) ? Math.ceil(total / this.limit) : 1

    if (page >= pages) { page = pages }
    if (page <= 1) { page = 1 }
    this.total = total
    this.page = page
    this.pages = pages
    this.offset = this.limit * (this.page - 1)
    this.urls = this.getUrls()
    return this.set()
  }

  set () {
    this.pagination = {
      total: this.total, limit: this.limit, offset: this.offset, page: this.page, pages: this.pages,
      start: this.urls.start, prev: this.urls.prev, next: this.urls.next, last: this.urls.last
    }
    return this
  }

  getUrls () {
    let page = this.page
    let pages = this.pages
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
}

module.exports.JPaginator = JPaginator
