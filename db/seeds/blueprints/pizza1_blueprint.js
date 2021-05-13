module.exports = {
  "requirements": ["core"],
  "prepare": [],
   "nodes": [
     {
       "id": "1",
       "type": "Start",
       "name": "Start Pizza 1 WF",
       "next": "2",
       "parameters": {
         "input_schema": {}
       },
       "lane_id": "1"
     },
     {
       "id": "2",
       "type": "SystemTask",
       "name": "Order Pizza",
       "category": "setToBag",
       "next": "3",
       "lane_id": "1",
       "parameters": {
         "input": {
           "client": { "$ref": "bag.name" },
           "client1": "teste",
           "pizzas": {
             "qty": 2,
             "flavors": [
               "mussarela","pepperoni"
             ],
             "olives": false
           }
         }
       }
     },
     {
       "id": "3",
       "type": "SystemTask",
       "name": "Take the order",
       "category": "setToBag",
       "next": "4",
       "lane_id": "1",
       "parameters": {
         "input": {
           "orderNo": { "$js": "() => Math.floor(Math.random() * 100); "}
         }
       }
     },
     {
       "id": "4",
       "type": "SystemTask",
       "name": "Prepare Pizza",
       "category": "Timer",
       "next": "5",
       "lane_id": "1",
       "parameters": {
         "input": {},
         "timeout": 5
       }
     },
     {
       "id": "5",
       "type": "SystemTask",
       "category": "SetToBag",
       "name": "Bring Pizza",
       "next": "6",
       "lane_id": "1",
       "parameters": {
         "input": {
           "comment": { "$mustache": "check if there are {{bag.pizzas.qty}} pizzas in the bag" }
         }
       }
     },
     {
       "id": "6",
       "type": "SystemTask",
       "category": "setToBag",
       "name": "Receive Pizza",
       "next": "7",
       "lane_id": "1",
       "parameters": {
         "input": {
           "confirm": { "$ref": "bag.orderNo" }
         }
       }
     },
     {
       "id": "7",
       "type": "Finish",
       "name": "Finish node",
       "next": null,
       "lane_id": "1"
     }
   ],
 "lanes": [
   {
     "id": "1",
     "name": "the_only_lane",
     "rule": ["fn", ["&", "args"], true]
   }
 ],
 "environment": {}
}
