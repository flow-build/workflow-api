data = [ 
  { 
    id: 111, 
    created_at: "xxxx", 
    data: { 
      bla: "xxxx", 
      field: { 
        xyz: "123" 
      } 
    } 
  },
  { 
    id: 222, 
    created_at: "xxxx", 
    data: { 
      bla: "xxxx", 
      field: { 
        xyz: "999" 
      } 
    } 
  }
];

key = "data.field.xyz";
values = "123";



function filterByKey(key){
  return function filter(data){
    return data.key === key;
  }
}

const filteredData = data.filter(filterByKey(values));
console.log(filteredData)
//const filterArr = data.filter((item) => item.data.field.xyz === values[0])

//filteredData = data.filter((item) => { return data.some((value) => { return value.turma === item})});
//console.log(filterArr)