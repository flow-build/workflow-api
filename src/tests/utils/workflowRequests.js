const _ = require("lodash");
const request = require("supertest");

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
      blueprint_spec: blueprint_spec,
    };
    const res = await _save(server, auth_header, dto);
    const workflow = res.body;
    const workflow_id = workflow.workflow_id;
    const workflow_url = workflow.workflow_url;
    workflows.push({
      id: workflow_id,
      url: workflow_url,
      ...dto,
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

const requests = (server, auth_header) => {
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
    createProcess: async (workflow_id, body) => {
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
      const workflows = await _saveMany(server, auth_header, blueprint_spec, num_workflows);
      for (const workflow of workflows) {
        const workflow_id = workflow.id;
        // eslint-disable-next-line no-unused-vars
        for (const process_idx of _.range(num_processes_per_workflow)) {
          const start_process_res = await _createProcess(server, auth_header, workflow_id, body);
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
    },
  };
};

module.exports = {
  workflow_dtos,
  requests,
};
