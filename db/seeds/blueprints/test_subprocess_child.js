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
            name: "Start child process",
            type: "Start",
            lane_id: "free",
            next: "2",
            parameters: {
                input_schema: {}
            }
        },
        {
            id: "2",
            name: "timer wait 15 seconds",
            type: "systemTask",
            category: "timer",
            lane_id: "free",
            next: "3",
            parameters: {
                input: {},
                timeout: 15
            }
        }, {
            id: "3",
            name: "bag some data",
            type: "systemTask",
            category: "setToBag",
            lane_id: "free",
            next: '99',
            parameters: {
                input: {
                    order: {
                        status: "pending",
                        qty: 2,
                        flavors: ["peperoni","supreme"],
                        comments: "whatever"
                    }
                }
            }
        },
        {
            id: "99",
            name: "Finish - child",
            type: "Finish",
            lane_id: "free",
            next: null,
            parameters: {
                input: {
                    order: { $ref: 'bag.order' }
                }
            }
        }
    ]
}