module.exports = {
  name: "graphql_sample",
  description: "workflow for testing graphQL node",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        next: "GRAPHQL_QUERY",
        parameters: {
          input_schema: {},
        },
        lane_id: "free",
      },
      {
        id: "GRAPHQL_QUERY",
        type: "SystemTask",
        category: "graphQl",
        name: "graphQL query call",
        next: "GRAPHQL_MUTATION",
        lane_id: "free",
        parameters: {
          request: {
            baseUrl: "https://graphql.postman-echo.com",
            route: "/graphql",
            verb: "POST",
          },
          input: {
            action: "query",
            operation: "request",
            fields: ["headers"],
            headers: {
              "Contenc-Type": "application/json",
            },
          },
        },
      },
      {
        id: "GRAPHQL_MUTATION",
        type: "SystemTask",
        category: "graphQl",
        name: "graphQL mutation call",
        next: "CONFIG",
        lane_id: "free",
        parameters: {
          request: {
            baseUrl: "https://graphql.postman-echo.com",
            route: "/graphql",
            verb: "POST",
          },
          input: {
            action: "mutation",
            operation: "createPerson",
            fields: ["id", "name"],
            variables: {
              person: {
                value: {
                  name: "Anakin",
                  age: 42,
                },
                type: "PersonInput",
                required: true,
              },
            },
          },
        },
      },
      {
        id: "CONFIG",
        type: "SystemTask",
        category: "graphQl",
        name: "graphQL query call",
        next: "GRAPHQL_REF",
        lane_id: "free",
        parameters: {
          input: {
            route: "/graphql",
            verb: "POST",
            action: "query",
            operation: "hello",
            variables: {
              person: {
                value: { name: "friend" },
                type: "PersonInput",
                required: true,
              },
            },
            headers: {
              "Contenc-Type": "application/json",
            },
          },
        },
      },
      {
        id: "GRAPHQL_REF",
        type: "SystemTask",
        category: "graphQl",
        name: "graphQL query call",
        next: "END",
        lane_id: "free",
        parameters: {
          request: {
            baseUrl: { $ref: "parameters.url" },
            route: { $ref: "bag.route" },
            verb: { $ref: "bag.verb" },
          },
          input: {
            action: { $ref: "bag.action" },
            operation: { $ref: "bag.operation" },
            headers: { $ref: "bag.headers" },
            variables: { $ref: "bag.variables" },
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
    parameters: {
      url: "https://graphql.postman-echo.com",
    },
  },
};
