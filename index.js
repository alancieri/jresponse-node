var _ = require('underscore-node');

const setJResponse = () => {
  return (req, res, next) => {
    res.JRes = new JResponse(res)
    next()
  }
}

class JResponse {
  constructor (res) {
    this.res = res
    this.code = 200
    this.response = {
      success: true, count: 0, data: [], errors: []
    }
  }

  static success (data = []) {
    data = (_.isArray(data)) ? data : [data]
    return JResponse.send(true, data, [])
  }

  static errors (errors) {
    errors = (_.isArray(errors)) ? errors : [errors]
    return JResponse.send(false, [], errors)
  }

  static send (success, data, errors) {
    let response = { success: true, count: 0, data: [], errors: [] }
    if (!_.isEmpty(errors)) {
      response.success = false
      response.errors = errors
    }
    if (!_.isEmpty(data)) {
      response.data = data
      response.count = response.data.length
    }
    return response
  }

  sendResponse (success, data, errors) {
    if (_.isUndefined(this.code)) { this.code = 200 }
    if (_.isUndefined(this.response)) { this.response = { success: true, count: 0, data: [], errors: [] } }
    if (!_.isUndefined(errors) && !_.isEmpty(errors)) {
      this.response.success = false
      this.code = 400
      if (!_.isArray(errors)) {
        this.response.errors.push(errors)
      } else {
        this.response.errors = errors
      }
    }
    if (!_.isUndefined(data) && !_.isEmpty(data)) {
      if (!_.isArray(data)) {
        this.response.data.push(data)
      } else {
        this.response.data = data
      }
    }
    this.response.count = this.response.data.length
    if (!_.isUndefined(this.res)) {
      return this.res.status(this.code).send(this.response)
    } else {
      return this.response
    }
  }

  sendSuccess (data) {
    if (!_.isUndefined(data) && !_.isEmpty(data)) {
      this.response.data = (_.isArray(data)) ? data : this.response.data.push(data)
    }
    return this.sendResponse(true, this.response.data)
  }

  sendErrors (error, code) {
    if (!_.isUndefined(error) && !_.isEmpty(error)) {
      this.response.errors.push(error)
    }
    this.response.success = false
    this.code = !_.isUndefined(code) ? code : 400
    return this.sendResponse(false, [], this.response.errors)
  }

  appendError (error, code) {
    this.code = !_.isUndefined(code) ? code : 400
    this.response.errors.push(error)
  }
}

module.exports.JResponse = JResponse;
module.exports.setJResponse = setJResponse;

