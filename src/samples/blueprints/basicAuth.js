module.exports = {
  name: "basicAuth",
  description: "blueprint for testing basic auth node",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        next: "BASIC",
        parameters: {
          input_schema: {},
        },
        lane_id: "1",
      },
      {
        id: "BASIC",
        type: "systemTask",
        category: "basicAuth",
        name: "HTTP basic auth node",
        next: "BASIC-REF",
        lane_id: "1",
        parameters: {
          input: {},
          request: {
            verb: "GET",
            baseUrl: 'https://postman-echo.com',
            route: '/basic-auth',
            auth: {
              username: 'postman',
              password: 'password'  
            }
          }
        },
      },
      {
        id: "BASIC-REF",
        type: "systemTask",
        category: "basicAuth",
        name: "HTTP basic auth node",
        next: "END",
        lane_id: "1",
        parameters: {
          input: {},
          request: {
            verb: "GET",
            baseUrl: { $ref: 'parameters.baseUrl' },
            route: { $mustache: '{{{parameters.route}}}-{{{parameters.project}}' },
            auth: {
              username: { $ref: 'parameters.username' },
              password: { $ref: 'parameters.password' }, 
            }
          }
        },
      },
      {
        id: "END",
        type: "Finish",
        name: "Finish node",
        next: null,
        lane_id: "1",
      },
    ],
    lanes: [
      {
        id: "1",
        name: "the_only_lane",
        rule: ["fn", ["&", "args"], true],
      },
    ],
    environment: {},
    parameters: {
      username: 'postman',
      password: 'password',
      baseUrl: 'https://postman-echo.com',
      route: '/basic',
      project: 'auth'
    }
  },
};
