"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareBlueprints = compareBlueprints;
const engine_1 = require("../engine");
const lodash_1 = require("lodash");
function compareBlueprints(workflow_name, blueprint_spec) {
    return __awaiter(this, void 0, void 0, function* () {
        const engine = (0, engine_1.getEngine)();
        let result = { changes: false };
        try {
            yield engine.validateBlueprint(blueprint_spec);
            const currentWorkflow = yield engine.fetchWorkflowByName(workflow_name);
            if (currentWorkflow) {
                const cur_wf_ordered_nodes = currentWorkflow.blueprint_spec.nodes.sort((a, b) => {
                    return a.id > b.id ? -1 : 0;
                });
                const bp_ordered_nodes = blueprint_spec.nodes.sort((a, b) => {
                    return a.id > b.id ? -1 : 0;
                });
                const cur_wf_ordered_lanes = currentWorkflow.blueprint_spec.lanes.sort((a, b) => {
                    return a.id > b.id ? -1 : 0;
                });
                const bp_ordered_lanes = blueprint_spec.lanes.sort((a, b) => {
                    return a.id > b.id ? -1 : 0;
                });
                const nodes = (0, lodash_1.isEqual)(cur_wf_ordered_nodes, bp_ordered_nodes);
                const lanes = (0, lodash_1.isEqual)(cur_wf_ordered_lanes, bp_ordered_lanes);
                const prepare = (0, lodash_1.isEqual)(currentWorkflow.blueprint_spec.prepare, blueprint_spec.prepare);
                const environment = (0, lodash_1.isEqual)(currentWorkflow.blueprint_spec.environment, blueprint_spec.environment);
                const requirements = (0, lodash_1.isEqual)(currentWorkflow.blueprint_spec.requirements, blueprint_spec.requirements);
                if (nodes && lanes && prepare && environment && requirements) {
                    result = {
                        changes: false,
                        currentWorkflow: {
                            id: currentWorkflow._id,
                            version: currentWorkflow._version
                        }
                    };
                }
                else {
                    result = {
                        changes: true,
                        currentWorkflow: {
                            id: currentWorkflow._id,
                            version: currentWorkflow._version
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
            }
            else {
                result = {
                    changes: true
                };
            }
        }
        catch (err) {
            result.error = err.toString();
        }
        return result;
    });
}
;
