const _ = require("lodash");
const request = require('supertest');

const workflow_dtos = {
  save: {
    system_task_workflow: {
      name: "system workflow",
      description: "system workflow",
      blueprint_spec: {
        requirements: ["core"],
        prepare: [],
        nodes: [
          {
            id: "1",
            type: "Start",
            name: "Start node",
            parameters: {
              input_schema: {},
            },
            next: "2",
            lane_id: "1"
          },
          {
            id: "2",
            type: "Finish",
            name: "Finish node",
            next: null,
            lane_id: "1"
          }
        ],
        lanes: [
          {
            id: "1",
            name: "the_only_lane",
            rule: ["fn", ["&", "args"], true]
          }
        ],
        environment: {},
      }
    },
    user_task_workflow: {
      name: "user task workflow",
      description: "user task workflow",
      blueprint_spec: {
        requirements: ["core"],
        prepare: [],
        nodes: [
          {
            id: "1",
            type: "Start",
            name: "Start node",
            next: "2",
            parameters: {
              input_schema: {},
            },
            lane_id: "1"
          },
          {
            id: "2",
            type: "UserTask",
            name: "User Task node",
            next: "3",
            lane_id: "1",
            parameters: {
              action: "do something",
              input: {}
            }
          },
          {
            id: "3",
            type: "Finish",
            name: "Finish node",
            next: null,
            lane_id: "1"
          }
        ],
        lanes: [
          {
            id: "1",
            name: "the_only_lane",
            rule: ["fn", ["&", "args"], true]
          }
        ],
        environment: {},
      }
    },
    user_notify_task_workflow: {
      name: "user notify task workflow",
      description: "user notify task workflow",
      blueprint_spec: {
        requirements: [],
        prepare: [],
        nodes: [
          {
            id: "1",
            type: "Start",
            name: "Start node",
            next: "2",
            parameters: {
              input_schema: {},
            },
            lane_id: "1"
          },
          {
            id: "2",
            type: "UserTask",
            name: "User Task node",
            next: "3",
            lane_id: "1",
            parameters: {
              activity_manager: "notify",
              action: "notify something",
              input: {},
            }
          },
          {
            id: "3",
            type: "UserTask",
            name: "User Task node",
            next: "4",
            lane_id: "1",
            parameters: {
              action: "do something",
              input: {}
            }
          },
          {
            id: "4",
            type: "Finish",
            name: "Finish node",
            next: null,
            lane_id: "1"
          }
        ],
        lanes: [
          {
            id: "1",
            name: "the_only_lane",
            rule: ["fn", ["&", "args"], true]
          }
        ],
        environment: {},
      }
    },
    custom_task_workflow: {
      name: "custom node workflow",
      description: "custom workflow",
      blueprint_spec: {
        requirements: ["core"],
        prepare: [],
        nodes: [
          {
            id: "1",
            type: "Start",
            name: "Start node",
            next: "2",
            parameters: {
              input_schema: {},
            },
            lane_id: "1"
          },
          {
            id: "2",
            type: "SystemTask",
            category: "CustomTask",
            name: "Custom task",
            next: "3",
            lane_id: "1",
            parameters: {
              input: {}
            }
          },
          {
            id: "3",
            type: "UserTask",
            name: "User Task node",
            next: "4",
            lane_id: "1",
            parameters: {
              action: "do something",
              input: {
                internal_key: "result.custom_data"
              }
            }
          },
          {
            id: "4",
            type: "Finish",
            name: "Finish node",
            next: null,
            lane_id: "1"
          }
        ],
        lanes: [
          {
            id: "1",
            name: "the_only_lane",
            rule: ["fn", ["&", "args"], true]
          }
        ],
        environment: {},
      }
    },
    user_script_task: {
      name: "user_script_task workflow",
      description: "function lisp workflow",
      blueprint_spec: {
        requirements: [
          "core",
          "test_package"
        ],
        prepare: ["do",
          ["def", "test_function",
            ["fn", ["&", "args"], {"new_bag": "New Bag"}]],
          null
        ],
        nodes: [
          {
            id: "1",
            type: "Start",
            name: "Start node",
            next: "2",
            parameters: {
              input_schema: {},
            },
            lane_id: "1",
          },
          {
            id: "2",
            type: "ScriptTask",
            name: "Service node",
            next: "3",
            lane_id: "1",
            parameters: {
              input: {},
              script: {
                function: ["fn", ["&", "args"], ["test_function"]]
              }
            }
          },
          {
            id: "3",
            type: "UserTask",
            name: "User Task node",
            next: "4",
            lane_id: "1",
            parameters: {
              action: "do something",
              input: {},
            }
          },
          {
            id: "4",
            type: "SystemTask",
            category: "SetToBag",
            name: "Set to bag node",
            next: "5",
            lane_id: "1",
            parameters: {
              input: {
                any: {"$ref": "result.any"}
              }
            }
          },
          {
            id: "5",
            type: "Finish",
            name: "Finish node",
            next: null,
            lane_id: "1"
          }
        ],
        lanes: [
          {
            id: "1",
            name: "simpleton",
            rule: ["fn", ["&", "args"], true]
          }
        ],
        environment: {},
      }
    },
  },
  start_process: {
    input: {
      custom_input: "goes_here"
    }
  }
};

const _save = async (server, auth_header, body) => {
  return await request(server)
    .post("/workflows")
    .send(body)
    .set(...auth_header);
};

const _saveMany = async (server, auth_header, blueprint_spec, num) => {
  const workflows = [];
  for (const idx of _.range(num)) {
    const dto = {
      name: `name ${idx}`,
      description: `description ${idx}`,
      blueprint_spec: blueprint_spec
    };
    const res = await _save(server, auth_header, dto);
    const workflow = res.body;
    const workflow_id = workflow.workflow_id;
    const workflow_url = workflow.workflow_url;
    workflows.push({
      id: workflow_id,
      url: workflow_url,
      ...dto
    });
  }
  return workflows;
};

const _createProcess = async (server, auth_header, workflow_id, body) => {
  return await request(server)
    .post(`/workflows/${workflow_id}/create`)
    .send(body)
    .set(...auth_header);
};

const workflowRequests = (server, auth_header) => {
  return {
    save: async (body) => {
      return await _save(server, auth_header, body);
    },
    saveSystemTask: async (name, description) => {
      const dto = _.cloneDeep(workflow_dtos.save.system_task_workflow);
      dto.name = name || dto.name;
      dto.description = description || dto.description;
      return await _save(server, auth_header, dto);
    },
    saveUserTask: async (name, description) => {
      const dto = _.cloneDeep(workflow_dtos.save.user_task_workflow);
      dto.name = name || dto.name;
      dto.description = description || dto.description;
      return await _save(server, auth_header, dto);
    },
    saveCustomTask: async (name, description) => {
      const dto = _.cloneDeep(workflow_dtos.save.custom_task_workflow);
      dto.name = name || dto.name;
      dto.description = description || dto.description;
      return await _save(server, auth_header, dto);
    },
    saveUserScriptTask: async (name, description) => {
      const dto = _.cloneDeep(workflow_dtos.save.user_script_task);
      dto.name = name || dto.name;
      dto.description = description || dto.description;
      return await _save(server, auth_header, dto);
    },
    saveMany: async (blueprint_spec, num) => {
      return _saveMany(server, auth_header, blueprint_spec, num);
    },
    fetch: async (workflow_id) => {
      return await request(server)
        .get(`/workflows/${workflow_id}`)
        .set(...auth_header);
    },
    fetchForActor: async () => {
      return await request(server)
        .get("/workflows")
        .set(...auth_header);
    },
    delete: async (workflow_id) => {
      return await request(server)
        .delete(`/workflows/${workflow_id}`)
        .set(...auth_header);
    },
    createProcess: async(workflow_id, body) => {
      return await _createProcess(server, auth_header, workflow_id, body);
    },
    createProcessByWorkflowName: async (workflow_name, body) => {
      return await request(server)
        .post(`/workflows/name/${workflow_name}/create`)
        .send(body)
        .set(...auth_header);
    },
    createManyProcesses: async (body, blueprint_spec, num_workflows, num_processes_per_workflow) => {
      const map = {};
      const workflows = await _saveMany(server, auth_header,
        blueprint_spec, num_workflows);
      for (const workflow of workflows) {
        const workflow_id = workflow.id;
        // eslint-disable-next-line no-unused-vars
        for (const _process_idx of _.range(num_processes_per_workflow)) {
          const start_process_res = await _createProcess(server, auth_header,
            workflow_id, body);
          const process_id = start_process_res.body.process_id;
          map[process_id] = workflow;
        }
      }
      return map;
    },
    fetchProcessList: async (workflow_id) => {
      return await request(server)
        .get(`/workflows/${workflow_id}/processes`)
        .set(...auth_header);
    }
  };
};

module.exports = {
  workflow_dtos,
  workflowRequests
};
