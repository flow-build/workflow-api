const test_workflow_package =
  ["do",

  [ "js", ["`", "function lisp_test_task(args) { \
    const n_interp = args[0].n_interp;\
    let dates = [];\
    for(let i = 0; i<n_interp; i++){\
      dates.push(new Date());\
    };\
    const result = {dates: dates};\
    return result;  \
  }"]],

  null];

module.exports = {
  test_workflow_package
}
