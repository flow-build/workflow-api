module.exports = {
  name: "timersDueDate",
  description: "Sample implementation of timers using dueDate notation",
  blueprint_spec: {
    requirements: ["core"],
    prepare: [],
    nodes: [
      {
        id: "START",
        type: "Start",
        name: "Start node",
        next: "CONFIG",
        parameters: {
          input_schema: {},
        },
        lane_id: "1",
      },
      {
        id: "CONFIG",
        name: "Put dates in bag, date 2 needs to be later than date1",
        next: "TIMER",
        type: "SystemTask",
        lane_id: "1",
        category: "setToBag",
        parameters: {
          input: {
            date1: {
              $js: "() => { const curDate = new Date(); return new Date(curDate.getTime() + 5 * 1000) };",
            },
            date2: {
              $js: "() => { const curDate = new Date(); return new Date(curDate.getTime() + 10 * 1000) };",
            },
          },
        },
      },
      {
        id: "TIMER",
        type: "SystemTask",
        category: "timer",
        name: "Intermediate Event Timer with dueDate notation & $ref",
        next: "USERTASK",
        lane_id: "1",
        parameters: {
          input: {},
          dueDate: { $ref: "bag.date1" },
        },
      },
      {
        id: "USERTASK",
        type: "UserTask",
        name: "User Task with boundary event, duration notation & $ref",
        next: "END",
        lane_id: "1",
        parameters: {
          action: "do something",
          input: {},
        },
        events: [
          {
            family: "target",
            category: "timer",
            dueDate: { $ref: "bag.date2" },
          },
        ],
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
        rule: { $js: "() => true" },
      },
    ],
    environment: {},
  },
};
