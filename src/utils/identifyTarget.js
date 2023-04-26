const identifyTarget = (blueprint_spec) => {
  try {
    const { nodes } = blueprint_spec
    const startNode = nodes.find((node) => node.type.toLowerCase() === 'start')
    const { parameters } = startNode
    if (parameters && parameters.target) {
      return [true, parameters.target]
    }
    return [false,]
  } catch (e) {
    console.log('Error: ', e)
    return [false,]
  }
}

module.exports = {
  identifyTarget
}