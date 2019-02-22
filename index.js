const setJResponse = () => {
  return (req, res, next) => {
    res.JRes = new JResponse(res)
    next()
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

    this.code = (code !== undefined && code !== null) ? code : this.code
    this.response.count = this.response.data.length
    return this.res.status(this.code).send(this.response)
  }

  sendSuccess (data, code) {
    data = (data === null) ? [] : data
    Array.isArray(data) ? this.response.data = this.response.data.concat(data) : this.response.data.push(data)
    this.code = (code !== undefined && code !== null) ? code : 200
    return this.sendResponse(true)
  }

  sendErrors (errors, code) {
    errors = (errors === null) ? [] : errors
    Array.isArray(errors) ? this.response.errors = this.response.errors.concat(errors) : this.response.errors.push(errors)
    this.response.success = false
    this.code = (code !== undefined && code !== null) ? code : 400
    return this.sendResponse(false)
  }

  appendError (errors, code) {
    errors = (errors === null) ? [] : errors
    Array.isArray(errors) ? this.response.errors = this.response.errors.concat(errors) : this.response.errors.push(errors)
    this.code = (code !== undefined && code !== null) ? code : 400
    return true
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
module.exports.setJResponse = setJResponse
