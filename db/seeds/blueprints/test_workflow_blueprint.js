module.exports = {
   "requirements": ["core", "test_workflow_package"],
   "prepare": [],
    "nodes": [
      {
        "id": "1",
        "type": "Start",
        "name": "Start node",
        "next": "2",
        "parameters": {
          "input_schema": {},
        },
        "lane_id": "1"
      },
      {
        "id": "2",
        "type": "UserTask",
        "name": "User Task",
        "next": "3",
        "lane_id": "1",
        "parameters": {
          "action": "do something",
          "input": {
            "dates": {"$ref": "bag.dates"},
            "uuids": {"$ref": "bag.uuids"}
          }
        }
      },
      {
        "id": "3",
        "type": "SystemTask",
        "category": "SetToBag",
        "name": "Set To Bag Task",
        "next": "4",
        "lane_id": "1",
        "parameters": {
          "input": {
            "keyword": {"$ref": "result.keyword"},
            "n_js": {"$ref": "result.n_js"},
            "n_interp": {"$ref": "result.n_interp"}
          }
        }
      },
      {
        "id": "4",
        "type": "ScriptTask",
        "name": "Scripted Task",
        "next": "5",
        "lane_id": "1",
        "parameters": {
          "input": {
            "n_interp": {"$ref": "bag.n_interp"}
          },
          "script": {
            "package": "test_workflow_package",
            "function": "lisp_test_task",
            "type": "js"
          }
        }
      },
      {
        "id": "5",
        "type": "SystemTask",
        "category": "SetToBag",
        "name": "Set To Bag Task",
        "next": "6",
        "lane_id": "1",
        "parameters": {
          "input": {
            "dates": {"$ref": "result.dates"}
          }
        }
      },
      {
        "id": "6",
        "type": "SystemTask",
        "category": "SetToBag",
        "name": "Set To Bag Task",
        "next": "7",
        "lane_id": "1",
        "parameters": {
          "input": {
            "uuids": {"$ref": "result.uuids"}
          }
        }
      },
      {
        "id": "7",
        "type": "Flow",
        "name": "Flow node",
        "next": {
          "default": "2",
          "end": "8"
        },
        "lane_id": "1",
        "parameters": {
          "input": {
            "keyword": {"$ref": "bag.keyword"}
          }
        }
      },
      {
        "id": "8",
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
  "environment": {},
}
