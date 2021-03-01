module.exports = {
    requirements: ["core"],
    prepare: [],
    environment: {},
    lanes: [
        {
            id: "free",
            name: "free for all",
            rule: ["fn", ["&", "args"], true]
        }
    ],
    nodes: [
        {
            id: "1",
            name: "Start testing schemas",
            type: "Start",
            lane_id: "free",
            next: "2",
            parameters: {
                input_schema: {
                    type: "object",
                    properties: {
                        id: {type: "string", format: "uuid"},
                        name: {type: "string"},
                        cpf: {type: "string", format: "cpf"}
                    },
                    required: ["name"]
                }
            }
        },
        {
            id: "2",
            name: "Order Pizza",
            type: "userTask",
            lane_id: "free",
            next: "3",
            parameters: {
                action: "ORDER_PIZZA",
                input: {},
                activity_manager: "commit",
                activity_schema: {
                    type: "object",
                    properties: {
                        qty: {type: "number"},
                        flavors: {type: "array",items: {type: "string"}},
                        comments: {type: "string"}
                    },
                    required: ["qty", "flavors"],
                    additionalProperties: false
                }
            }
        }, {
            id: "3",
            name: "take the order",
            type: "systemTask",
            category: "http",
            lane_id: "free",
            next: "4",
            parameters: {
                input: {
                    qty: {
                        $ref: "result.activities[0].data.qty"
                    },
                    status: "pending",
                    flavors: {
                        $ref: "result.activities[0].data.flavors"
                    },
                    comments: {
                        $ref: "result.activities[0].data.comments"
                    }
                },
                request: {
                    url: "https://5faabe16b5c645001602b152.mockapi.io/order",
                    verb: "POST",
                    headers: {
                        ContentType: "application/json"
                    }
                }
            },
            result_schema: {
                type: "object",
                properties: {
                    id: {type: "number"},
                    flavors: {type: "string"}
                },
                additionalProperties: false
            }
        },
        {
            id: "4",
            name: "bag order",
            type: "systemTask",
            category: "setToBag",
            lane_id: "free",
            next: "99",
            parameters: {
                input: {
                    order: {"$ref": "result.data"}
                }
            }
        },{
            id: "99",
            name: "Finish - Order delivered",
            type: "Finish",
            lane_id: "free",
            next: null
        }
    ]
}