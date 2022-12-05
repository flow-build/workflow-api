
const _ = require('lodash')

data = [ 
  { 
    id: 111, 
    created_at: "111", 
    data: { 
      bla: "111", 
      distribuidor: { 
        cod_filial: "111" 
      } 
    } 
  },
  { 
    id: 222, 
    created_at: "222", 
    data: { 
      bla: "222", 
      distribuidor: { 
        cod_filial: "222" 
      } 
    } 
  },
  { 
    id: 333, 
    created_at: "333", 
    data: { 
      bla: "333", 
      distribuidor: { 
        cod_filial: "333" 
      } 
    } 
  }
];

key = "data.distribuidor.cod_filial";
values = ["111", "222"];
const filteredData = []
data.forEach(function (item){
  if (_.get(item, key) === values[0]) {
    filteredData.push(item);
    values.shift()
  }
})
console.log("filteredData ->", filteredData)

