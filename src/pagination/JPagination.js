class JPagination {
  constructor (req, options = {}) {
    this.options = {
      maxItems: 250,
      defaultLimit: 50,
      metaKey: 'pagination',
      limitKey: 'limit',
      pageKey: 'page'
    }
    Object.assign(this.options, options)
    this.req = req
    this.pagination = {}
    let query = this.req.query
    this.limit = (query[this.options.limitKey] !== undefined && !isNaN(query[this.options.limitKey]))
      ? parseInt(query[this.options.limitKey])
      : (query[this.options.limitKey] = this.options.defaultLimit)
    this.limit = (this.limit > this.options.maxItems) ? this.options.maxItems : this.limit
    this.offset = 0
  }

  get () {
    let pagination = {}
    pagination[this.options.metaKey] = this.pagination
    return pagination
  }

  getLimit () { return this.pagination.limit }

  getOffset () { return (this.pagination.offset !== undefined) ? this.pagination.offset : null}
}

module.exports.JPagination = JPagination
