const _ = require('lodash');

var characters = [
    { 'name': 'barney','initial':'B' ,'count': 1,  'pet': 'dog' },
    { 'name': 'fred', 'initial':'f' ,  'count': 5,  'pet': 'cat' },
    { 'name': 'barney','initial':'B' , 'count': 2,  'pet': 'fish' },
    { 'name': 'fred', 'initial':'f' ,  'count': 3,  'pet': 'goldfish' }
  ];
  
/*   var result=_.chain(characters).groupBy("name").map(function(v, i) {
    return {
      name: i,
      age: _.get(_.find(v, 'age'), 'age'),
      pet: _.map(v, 'pet')
    }
  }).value();

console.log(result); */
 /* var data=characters.reduce(function(acc, val, index,arr){
    //console.log('data',acc,'val',val,'index', index);
    var name = acc[val.name];
    console.log(name,acc);
    if (name){
        name.count+=val.count;
        
    }
    else{
        acc[val.name]=val;
        delete val.name;
    }
    return acc
},[]);
console.log(data);
  */

const ans =_.groupBy(characters,'name');
//console.log(ans);

//var data = character.reduce()

var result=_.chain(characters).groupBy("name").map(function(v,i){
    return {
        name:i,
        initial:_.get(_.find(v,'initial'),'initial',0),
        //count: v.map(v=>v.pet),
        count:_.sumBy(v,'count'),
        details:v
         }
  //  console.log(v);
});
console.log(JSON.stringify(result.value()));