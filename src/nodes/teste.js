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
  }
];

key = "data.distribuidor.cod_filial";
values = ["999"];



const filterArr = data.filter((item) => _.get(item, key) === values[0])
console.log(filterArr)
