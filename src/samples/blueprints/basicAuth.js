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
            baseUrl: 'https://dsd-fdte.atlassian.net/rest/api/2',
            route: '/search?jql=project=AVA&maxResults=2&fields=summary',
            auth: {
              username: 'gustavo.haramura@fdte.io',
              password: '542GavjnxBjsxZKCldVq2E22'  
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
            route: { $mustache: '{{{parameters.route}}}?jql=project={{parameters.project}}&maxResults=5&fields=summary' },
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
      username: 'gustavo.haramura@fdte.io',
      password: '542GavjnxBjsxZKCldVq2E22',
      baseUrl: 'https://dsd-fdte.atlassian.net/rest/api/2',
      route: '/search',
      project: 'AVA'
    }
  },
};
