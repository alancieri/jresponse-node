# JResponse for Node

Middleware for Node/Express. Use this middleware to get a standard output for the API Request.<br />
You can also use **JResponse** as a simple object to standardize the Express router response.<br />

When working with a large data set it obviously makes sense to offer pagination options to the endpoint.  
To avoid writing your own pagination output into every endpoint, JResponse provides you **JPagination**.
JPagination is inspired by the [Fractal Pagination](https://fractal.thephpleague.com/pagination "Pagination Fractal") for PHP, 
and it offers two solution for paginate the response: **[JPaginator](#jpaginator)** and **[JCursor](#jcursor)**
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

router.route('/').get((...args) => MyController.list(...args))
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

async function list (req, res) {
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

#### Output

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

#### Methods

- **res.JRes.sendSuccess**(_data_). Short success output, it will call the _sendResponse_ method with success as _true_
- **res.JRes.sendErrors**(_message_ [, _code_]). Short error output, it will call the _sendResponse_ method with success as _false_
- **res.JRes.appendError**(_message_ [, _code_]). Append the current error message to the JRes object, and will set the currect error code.
- **res.JRes.sendResponse**(_success_, _data_, _errors_). You can use this method in place of the previous ones
- **res.JRes.paginate**(_JPagination_). Get the pagination object in the response (see the **Pagination** section)

##### Customize the output

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

#### Use "JRes" and pass it to "res" Express object
You can use the JRes in order to format the response, without use the 'res' Express route object. In this call, you can call JResponse statically

```js
// MyController.js

import { MyModel } from '../models'
import { JResponse } from 'jresponse-node'

async function list (req, res) {
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

#### Static Methods

- **JResponse.success**(_data_). Short success output, it will call the _sendResponse_ method with success as _true_
- **JResponse.errors**(_errors_). Short error output, it will call the _sendResponse_ method with success as _false_
- **JResponse.send**(_success_, _data_, _errors_). You can use this method in place of the previous ones

### Pagination

Pagination is the process of dividing content into result-set and **JPagination** provides you with two solutions.

#### JPaginator

JPaginator is an auto form of pagination. TO perform the response it requires the Request object, and a total items count. 
This adds a _pagination_ node to the response, which will contain next/previous links if applicable.
Use the method **res.JRes.paginate(**<_JPagination_>**)** to append the pagination to JResponse.
This intelligence comes at the cost of having to count the number of entries in a database on each call.

For some data sets this might not be an issue, but for some it certainly will. 
If pure speed is an issue, consider using **JCursors** instead.

```js
// MyController.js

import { MyModel } from '../models'
import { JPaginator } from 'jresponse-node'

async function list (req, res) {
    const counter = await MyModel.findAndCountAll()
    const totalItems = counter.count // For example 10 items
    
    // Optionals parameters for the pagination
    const options = { 
      maxItems: 250, 
      metaKey: 'pagination', 
      limitKey: 'limit', 
      pageKey: 'page' 
    }
    
    // Instantiate the pagination
    let paging = new JPaginator(req, totalItems, options)
    
    const items = await MyModel.findAll({ limit: paging.limit, offset: paging.offset })
    
    return res.JRes.paginate(paging).sendSuccess(items)
}
```

For example, you can call the following address and see the output. 

```
http://localhost:3000/test?limit=2&page=1
```

##### Output
```json
{
	"success": true,
	"count": 2,
	"data": [
		{
			"test1": 1
		},
		{
			"test2": 2
		}
	],
	"errors": [],
	"pagination": {
		"limit": 2,
		"page": 1,
		"pages": 5,
		"offset": 0,
		"start": "http://localhost:3000/test?limit=2&page=1",
		"prev": null,
		"next": "http://localhost:3000/test?limit=2&page=2",
		"last": "http://localhost:3000/test?limit=2&page=5"
	}
}
```
##### Options

- **maxItems**. Set the max results per page. If the "limit" is greater than maxItems the limit will be equal to this value (default: 250)
- **metaKey**. Set the "pagination" key name for the JResponse object (default: "pagination") 
- **limitKey**. Set the "limit" key name for the JPagination object. If you change this name you will change also the key in the querystring (default: "limit").  
- **pageKey**. Set the "page" key name for the JPagination object. If you change this name you will change also the key in the querystring (default: "page").

#### JCursor

When we have large sets of data and running a _MyModel.findAndCountAll()_ isn't really an option, 
we need a proper way of fetching results. 
One of the approaches is to use cursors that will indicate to your backend where to start fetching results.
It's really easy to use.

```js
// MyController.js

import { MyModel } from '../models'
import { JCursor } from 'jresponse-node'

async function list (req, res) {
    let Cursor = new JCursor(req)
    
    Cursor.displayFilter('_id', 'nosql')
    
	let direction = Cursor.direction

	let items = await MyModel
		.find(Cursor.currentFilter, null, { sort: { '_id': Cursor.order } })
		.select({})
		.limit(Cursor.limit)
		.exec()
	
	if (items.length == 0)
	return res.JRes.sendErrors('No data')
	
	if (Cursor.direction == 'after') { items = items.reverse() }
	
	// Update maxId and sinceId values
	const beforeId = items[items.length - 1]._id
	const afterId = items[0]._id
	
	return res.JRes.paginate(Cursor, beforeId, afterId).sendSuccess(events, 200)
}

```

For example, you can call the following address and see the output. 

```
http://localhost:3000/items?limit=2
```

```json
{
	"success": true,
	"count": 2,
	"data": [
		{
			"_id": "5c793547ac87ecc484832811",
			"timestamp": "1551144090433",
			"name": "John"
		},
		{
			"_id": "5c793543ac87ecc484832810",
			"timestamp": "1551144090433",
			"name": "Mark"
		}
	],
	"errors": [],
	"pagination": {
		"before": "5c793543ac87ecc484832810",
		"after": "5c793547ac87ecc484832811",
		"limit": 2,
		"direction": "before",
		"order": -1,
		"nextUrl": "http://localhost:3001/items?limit=2&before=5c793543ac87ecc484832810",
		"prevUrl": "http://localhost:3001/items?limit=2&after=5c793547ac87ecc484832811",
		"currentFilter": null
	}
}
```

If you move to the next url, the response will be the following

```json
{
	"success": true,
	"count": 2,
	"data": [
		{
		"_id": "5c74949673c56000137ef4f0",
		"timestamp": "1551144090433",
		"name": "Robert"
		},
		{
		"_id": "5c6add371f089800163ca368",
		"timestamp": "1550507318112",
		"name": "Grete"
		}
	],
	"errors": [],
	"pagination": {
		"before": "5c6add371f089800163ca368",
		"after": "5c74949673c56000137ef4f0",
		"limit": 2,
		"direction": "before",
		"order": -1,
		"nextUrl": "http://localhost:3001/items?limit=2&before=5c6add371f089800163ca368",
		"prevUrl": "http://localhost:3001/items?limit=2&after=5c74949673c56000137ef4f0",
		"currentFilter": {
			"_id": {
				"$lt": "5c793543ac87ecc484832810"
			}
		}
	}
}
```

##### Methods
- **displayFilter**([_id_] [, _dialect_]). Display the filter node in pagination object response. 
You can use the returned value to set the query filter automatically. 
Set the _id_ with the identifier key for your collection (default "id")
Choose the proper _dialect_ for your database between "nosql", "sql", "plain" (default "nosql").

Output for **nosql**
```
"filter": {
	"_id": {
		"$lt": "5c793543ac87ecc484832810"
	}
}
```
Output for **sql**
```
"filter": {
	"_id": "< 5c793543ac87ecc484832810"
}
```
Output for **plain**
```
"filter": {
	"_id": "less than 5c793543ac87ecc484832810"
}
```
##### Options

The same of JPaginator
