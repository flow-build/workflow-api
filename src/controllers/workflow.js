const _ = require('lodash');
const { getEngine, getCockpit } = require('../engine');

const saveWorkflow = async (ctx, next) => {
	console.log('[KW] Called saveWorkflow');
	const engine = getEngine();
	const { name, description, blueprint_spec } = ctx.request.body;
	try {
		const workflow = await engine.saveWorkflow(name, description, blueprint_spec);
		ctx.status = 201;
		ctx.body = {
			workflow_id: workflow.id,
			workflow_url: `${ctx.header.host}${ctx.url}/${workflow.id}`
		};
	} catch (err) {
		ctx.status = 400;
		ctx.body = { message: `Failed at ${err.message}`, error: err };
	}
};

const getWorkflowsForActor = async (ctx, next) => {
	console.log('[KW] Called getWorkflowsForActor');

	const cockpit = getCockpit();
	const actor_data = ctx.state.actor_data;
	const workflows = await cockpit.getWorkflowsForActor(actor_data);
	ctx.status = 200;
	ctx.body = _.map(workflows, (workflow) => {
		const result = workflow;
		delete result.blueprint_spec;
		return result;
	});
};

const fetchWorkflow = async (ctx, next) => {
	console.log('[KW] Called fetchWorkflow');

	const engine = getEngine();
	const workflow_id = ctx.params.id;
	const workflow = await engine.fetchWorkflow(workflow_id);
	if (workflow) {
		ctx.status = 200;
		ctx.body = workflow.serialize();
	} else {
		ctx.status = 404;
	}
};

const fetchWorkflowByName = async (ctx, next) => {
	console.log('[KW] Called fetchWorkflowByName');

	const engine = getEngine();
	const workflow_name = ctx.params.name;
	const workflow = await await engine.fetchWorkflowByName(workflow_name);
	if (workflow) {
		ctx.status = 200;
		ctx.body = workflow.serialize();
	} else {
		ctx.status = 404;
	}
};

const deleteWorkflow = async (ctx, next) => {
	console.log('[KW] Called deleteWorkflow');

	const engine = getEngine();
	const workflow_id = ctx.params.id;
	const num_deleted = await engine.deleteWorkflow(workflow_id);
	if (num_deleted == 0) {
		ctx.status = 404;
	} else {
		ctx.status = 204;
	}
};

const fetchWorkflowProcessList = async (ctx, next) => {
	console.log('[KW] Called fetchWorkflowProcessList');

	const cockpit = getCockpit();
	const workflow_id = ctx.params.id;
	const filters = { workflow_id: workflow_id };
	const processes = await cockpit.fetchProcessList(filters);
	ctx.status = 200;
	ctx.body = _.map(processes, (process) => {
		const result = process.serialize();
		delete result.blueprint_spec;
		return result;
	});
};

const createProcess = async (ctx, next) => {
	console.log('[KW] Called createProcess');

	const engine = getEngine();
	const workflow_id = ctx.params.id;
	const actor_data = ctx.state.actor_data;
	const input = ctx.request.body;
	const process = await engine.createProcess(workflow_id, actor_data, input);
	if (process) {
		ctx.status = 201;
		ctx.body = {
			process_id: process.id,
			process_url: `${ctx.header.host}${ctx.url}/${process.id}`
		};
	} else {
		ctx.status = 404;
	}
};

const createProcessByName = async (ctx, next) => {
	console.log('[KW] Called createProcessByName');

	const engine = getEngine();
	const workflow_name = ctx.params.name;
	const actor_data = ctx.state.actor_data;
	const input = ctx.request.body;
	const process = await engine.createProcessByWorkflowName(workflow_name, actor_data, input);
	if (process) {
		ctx.status = 201;
		ctx.body = {
			process_id: process.id,
			process_url: `${ctx.header.host}${ctx.url.replace("workflows", "processes")}/${process.id}`
		};
	} else {
		ctx.status = 404;
	}
};

const createAndRunProcessByName = async (ctx, next) => {
	console.log('[KW] Called createAndRunProcessByName');

	const engine = getEngine();
	const workflow_name = ctx.params.workflowName;
	const actor_data = ctx.state.actor_data;
	const input = ctx.request.body;
	const process = await engine.createProcessByWorkflowName(workflow_name, actor_data, input);
	if (process && process.id) {
		engine.runProcess(process.id, actor_data);
		ctx.status = 201;
		ctx.body = {
			process_id: process.id,
			process_url: `${ctx.header.host}${ctx.url.replace("workflows", "processes")}/${process.id}`
		};
	} else {
		ctx.status = 404;
	}
};

 const validateBlueprint = async(ctx,next) => {
	console.log('[KW] Called validateBlueprint');

	const engine = getEngine();
	const { blueprint_spec } = ctx.request.body;

	try {
		await engine.validateBlueprint(blueprint_spec);
		ctx.status = 200;
		ctx.body = {
			message: "Blueprint is valid"
		};
	} catch (err) {
		ctx.status = 400;
		ctx.body = { 
			error: 'Invalid blueprint',
			message: `Failed at ${err.message}`
		};
	}
}

const compareBlueprint = async(ctx,next) => {
	console.log('[KW] Called compareBlueprint');

	const engine = getEngine();
	const { name, blueprint_spec } = ctx.request.body;

	try {
		await engine.validateBlueprint(blueprint_spec);

		const current_workflow = await engine.fetchWorkflowByName(name);

		if(current_workflow) {
			const cur_wf_ordered_nodes = current_workflow.blueprint_spec.nodes.sort((a,b) => { return a.id > b.id ? -1 : 0 });
			const bp_ordered_nodes = blueprint_spec.nodes.sort((a,b) => { return a.id > b.id ? -1 : 0 })
			
			const cur_wf_ordered_lanes = current_workflow.blueprint_spec.lanes.sort((a,b) => { return a.id > b.id ? -1 : 0 });
			const bp_ordered_lanes = blueprint_spec.lanes.sort((a,b) => { return a.id > b.id ? -1 : 0 })
		
			const nodes = _.isEqual(cur_wf_ordered_nodes,bp_ordered_nodes);
			const lanes = _.isEqual(cur_wf_ordered_lanes,bp_ordered_lanes);
			const prepare = _.isEqual(current_workflow.blueprint_spec.prepare,blueprint_spec.prepare);
			const environment = _.isEqual(current_workflow.blueprint_spec.environment,blueprint_spec.environment);
			const requirements = _.isEqual(current_workflow.blueprint_spec.requirements,blueprint_spec.requirements);
		
			if(nodes && lanes && prepare && environment && requirements) {
				ctx.status = 200,
				ctx.body = {
					status: "No changes found",
					current_workflow: {
						id: current_workflow._id,
						version: current_workflow._version,
					}
				};
			} else {
				ctx.status = 202;
				ctx.body = {
					status: "Changes found, check comparison",
					current_workflow: {
						id: current_workflow._id,
						version: current_workflow._version,
					},
					comparison: {
						nodes: nodes,
						lanes: lanes,
						prepare: prepare,
						environment: environment,
						requirements: requirements
					}
				};
			}
		} else {
			ctx.status = 404,
			ctx.body = {
				status: "No workflow with this name"
			};
		}
		
	} catch (err) {
		ctx.status = 400;
		ctx.body = { 
			error: 'Invalid blueprint',
			message: `Failed at ${err.message}`
		};
	}
}

module.exports = {
	saveWorkflow,
	getWorkflowsForActor,
	fetchWorkflow,
	fetchWorkflowByName,
	fetchWorkflowProcessList,
	deleteWorkflow,
	createProcess,
	createProcessByName,
	createAndRunProcessByName,
	validateBlueprint,
	compareBlueprint
};
