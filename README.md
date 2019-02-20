# JResponse for Node

Middleware for Node/Express. Use this middleware in order to get a standard output the API Request. 
You can also use JResponse as a common javascript object to even your responses and send it to router response (see the last paragraph).  

### Install

```
npm i jresponse-node
```

### Usage

#### Set the middleware (app.use() or router.use())
The module will append the formatted response to the res object of ExpressJS. 

```js
// routes.js

import { Router } from 'express'
import MyController from './controllers/MyController'
import { setJResponse } from 'jresponse-node'

const router = new Router()

router.use(setJResponse())

router.route('/')
  .get((...args) => MyController.list(...args))
```

#### Use 'JRes' instead the 'res' object in Express

```js
// MyController.js

import { MyModel } from '../models'

async list (req, res) {
    const items = await MyModel.findAll()
    return res.JRes.sendSuccess(items)
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
            ... 
        },
        ...
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

