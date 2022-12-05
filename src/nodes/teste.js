const _ = require('lodash')

data = [ 
  { 
    id: 111, 
    created_at: "xxxx", 
    data: { 
      bla: "xxxx", 
      distribuidor: { 
        cod_filial: "123" 
      } 
    } 
  },
  { 
    id: 222, 
    created_at: "xxxx", 
    data: { 
      bla: "xxxx", 
      distribuidor: { 
        cod_filial: "999" 
      } 
    } 
  },
  { 
    id: 1412222, 
    created_at: "xxxx", 
    data: { 
      bla: "xxxx", 
      distribuidor: { 
        cod_filial: "999" 
      } 
    } 
  }
];

key = "data.distribuidor.cod_filial";
values = ["999", "444"];

const filteredData = []
data.forEach(function (item){
  if (_.get(item, key) === values[0]) {
    filteredData.push(item)
  }
  console.log(filteredData)
})

