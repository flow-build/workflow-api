const listConnections = async (spec) => {
  return spec.nodes
    .filter((node) => node.next)
    .reduce((acc, node) => {
      let result;
      if (node.next && typeof node.next === "object") {
        result = Object.values(node.next).reduce((a, next) => {
          const i = `${node.id} -> ${next}`;
          return [...a, i];
        }, []);
      } else {
        result = [`${node.id} -> ${node.next}`];
      }
      return acc.concat(result);
    }, []);
}

const listNodes = async (spec) => {
  return spec.nodes.map(node => node.id)
}

const trimExecutionData = async (execution) => {
  const flattenExecution = execution.flat();
  let nodes = [];
  let connections = [];
  for(let state of flattenExecution) {
    nodes.push(state._node_id);
    connections.push(`${state._node_id} -> ${state._next_node_id}`);
  }

  return {
    nodes: [...new Set(nodes)],
    connections: [...new Set(connections)]
  }
}

const listUncoverage = async(blueprintData, executionData) => {
  const rawList = await blueprintData.filter(
    (item) => !executionData.includes(item)
  );

  return [...new Set(rawList)]
}

module.exports = {
  listConnections,
  listNodes,
  trimExecutionData,
  listUncoverage
};


