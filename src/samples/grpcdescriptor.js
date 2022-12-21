module.exports = {
  descriptor: {
    "file": [
      {
        "name": "test/rpc.proto",
        "messageType": [
          {
            "name": "HelloRequest",
            "field": [
              {
                "name": "greeting",
                "number": 1,
                "label": "LABEL_OPTIONAL",
                "type": "TYPE_STRING",
                "jsonName": "greeting"
              }
            ]
          },
          {
            "name": "HelloResponse",
            "field": [
              {
                "name": "reply",
                "number": 1,
                "label": "LABEL_OPTIONAL",
                "type": "TYPE_STRING",
                "jsonName": "reply"
              }
            ]
          }
        ],
        "service": [
          {
            "name": "HelloService",
            "method": [
              {
                "name": "SayHello",
                "inputType": ".HelloRequest",
                "outputType": ".HelloResponse"
              }
            ]
          }
        ],
        "syntax": "proto3"
      }
    ]
  }
      
}