module.exports = {
  name: "grpc_node",
  description: "workflow for testing grpc node",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        next: "GRPC_REFLECT",
        parameters: {
          input_schema: {
            type: "object",
            required: ["server", "service", "method", "payload"],
            properties: {
              data: { type: "array" },
              dictionary: { type: "object" },
            }
          },
        },
        lane_id: "free",
      },
      {
        id: "GRPC_REFLECT",
        type: "SystemTask",
        category: "grpc",
        name: "gRPC call using server reflection",
        next: "GRPC_DESCRIPT",
        lane_id: "free",
        parameters: {
          input: {
            server: { $js: "() => bag.server || grpc.postman-echo.com" },
            service: { $js: "() => bag.service || HelloService" },
            method: { $js: "() => bag.method || SayHello" },
            payload: { $ref: "bag.payload" },
            useReflection: true
          },
        },
      },
      {
        id: "GRPC_DESCRIPT",
        type: "SystemTask",
        category: "grpc",
        name: "gRPC call using JSON descriptor",
        next: "END",
        lane_id: "free",
        parameters: {
          input: {
            server: { $js: "() => bag.server || grpc.postman-echo.com" },
            service: { $js: "() => bag.service || HelloService" },
            method: { $js: "() => bag.method || SayHello" },
            payload: { $ref: "bag.payload" },
            useReflection: false,
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
          },
        },
      },
      {
        id: "END",
        type: "Finish",
        name: "Finish node",
        next: null,
        lane_id: "free",
      },
    ],
    lanes: [
      {
        id: "free",
        name: "the_only_lane",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
  },
};
