module.exports = {
  "id": "5",
  "type": "UserTask",
  "name": "Prepare Pizza",
  "next": "6",
  "lane_id": "2",
  "parameters": {
    "input": {
      "order": {
        "$ref": "bag.order"
      }
    },
    "action": "PREPARE_PIZZA"
  }
}