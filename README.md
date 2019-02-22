# JResponse for Node

Middleware for Node/Express. Use this middleware in order to get a standard output for the API Request. 
You can also use JResponse as a common javascript object to even your responses and send it to router response (see the last paragraph).  

### Install

```
npm i jresponse-node
```

### Usage

#### Set the middleware (app.use() or router.use())
The module will append the formatted response to the res object of ExpressJS. 

##### ES6
```js
// routes.js ES6

import { Router } from 'express'
import MyController from './controllers/MyController'
import { setJResponse } from 'jresponse-node'

const router = new Router()

router.use(setJResponse())

router.route('/')
  .get((...args) => MyController.list(...args))
```

##### ES5
```js
// routes.js ES5

var express = require('express')
var router = express.Router()
var MyController = require('./controllers/MyController')
var jresponse = require('./../jresponse-node')

router.use(jresponse.setJResponse())

router.route('/')
  .get((...args) => MyController.list(...args))
  
```

#### Use 'JRes' instead the 'res' object in Express

##### ES6
```js
// MyController.js

import { MyModel } from '../models'

async list (req, res) {
    const items = await MyModel.findAll()
    return res.JRes.sendSuccess(items)
  }
```
##### ES5
```js
// MyController.js

var MyModel = require('../models/MyModel')
const list = function (req, res) {
    MyModel.findAll()
    .then(items => {
		return res.JRes.sendSuccess(items)
    })
  }
```

### Output

the JRes object will return always the same output: **success**, **count**, **data**, and **errors**

```json
{
    "success": true,
    "count": 4,
    "data": [
        {
            "_id": "5c66b96f1b66bc00096ced46",
            "_otherId": "5c656fa71b66bc00096ced3d",
            "itemId": "849823662150",
            "itemRef": "15",
            "otherData": "data"
        },
        { 
            "_id": "5c66b96f1b66bc00096ced57",
            // ... 
        },
        // ...
    ],
    "errors": []
}
```
- **success**: (_boolean) true or false. True if there is not errors.
- **count** (_integer_). The size of data array.
- **data** (_array_). The data expected from request. If there are errors, it will be empty.
- **errors** (_array_). The errors occurred in the request. If there are some errors, success will be false.

### Methods

- **res.JRes.sendSuccess**(_data_). Short success output, it will call the _sendResponse_ method with success as _true_
- **res.JRes.sendErrors**(_message_ [, _code_]). Short error output, it will call the _sendResponse_ method with success as _false_
- **res.JRes.appendError**(_message_ [, _code_]). Append the current error message to the JRes object, and will set the currect error code.
- **res.JRes.sendResponse**(_success_, _data_, _errors_). You can use this method in place of the previous ones

#### Customize the output

- **res.JRes.merge**(_data_). Merge the data object passed to the function (_object_ or _array_) with the default JResponse object
- **res.JRes.key**(_key_, _value_). Add the key and the value to the default JResponse object

```js
res.JRes.merge([{ page: 1, }, { reference: '01REF999' }])

// or

res.JRes.set('page', 1)
res.JRes.set('reference', '01REF999')

```
##### Output

```json
{
	"success": true,
	"count": 1,
	"data": [
		{
		    "_id": "5c66b96f1b66bc00096ced46",
		    "_otherId": "5c656fa71b66bc00096ced3d",
		    "itemId": "849823662150",
		    "itemRef": "15",
		    "otherData": "data"
		}
	],
	"errors": [],
	"page": 1,
	"reference": "01REF999"
}

```

### Use 'JRes' and pass it to 'res' Express object
You can use the JRes in order to format the response, without use the 'res' Express route object. In this call, you can call JResponse statically

```js
// MyController.js

import { MyModel } from '../models'
import { JResponse } from 'jresponse-node'

async list (req, res) {
    try {
        const orders = await MyModel.findAll()
        const result = JResponse.success(orders)
        return res.status(200).send(result)
    } catch(e) {
        const result = JResponse.errors(e.message)
        return res.status(404).send(result)
    }
}
```

### Static Methods

- **JResponse.success**(_data_). Short success output, it will call the _sendResponse_ method with success as _true_
- **JResponse.errors**(_errors_). Short error output, it will call the _sendResponse_ method with success as _false_
- **JResponse.send**(_success_, _data_, _errors_). You can use this method in place of the previous ones
