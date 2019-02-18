# JResponse for Node
## jresponse-node
Node/Express Standard Output for each API Request

### Usage

```js
import { Order } from '../models'
import JResponse from '../helpers/jresponse'

// use JResponse constructor
// Note: require the res object in constructor
async list1 (req, res) {
    let response = new JResponse(res)
    try {
        const orders = await Order.findAll()
        return response.sendSuccess(orders)
    } catch(e) {
        return response.sendErrors(e.message, e.status)
    }
}
```

```js
async list2 (req, res) {
    try {
        const orders = await Order.findAll()
        const result = JResponse.success(orders)
        return res.status(200).send(result)
    } catch(e) {
        const result = JResponse.errors(e.message)
        return res.status(404).send(result)
    }
}
```

### Output

```json
{
    "success": true,
    "count": 4,
    "data": [
        {
            "_id": "5c66b96f1b66bc00096ced46",
            "_channelId": "5c656fa71b66bc00096ced3d",
            "orderId": "849823662150",
            "orderRef": "15",
            ...
        { 
            ... 
        }
    ],
    "errors": []
}

