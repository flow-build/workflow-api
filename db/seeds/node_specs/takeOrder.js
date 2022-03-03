module.exports = {
  id: "3",
  type: "SystemTask",
  name: "Take the order",
  category: "HTTP",
  next: "4",
  lane_id: "1",
  parameters: {
    input: {
      status: "pending",
      qty: {
        $ref: "result.activities[0].data.qty",
      },
      flavors: {
        $ref: "result.activities[0].data.flavors",
      },
      comments: {
        $ref: "result.activities[0].data.comments",
      },
    },
    request: {
      url: "https://5faabe16b5c645001602b152.mockapi.io/order",
      verb: "POST",
      headers: {
        ContentType: "application/json",
      },
    },
  },
};
