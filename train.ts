// Task ZJ

import { count } from "console";

function reduceNestedArray(arr:any[]){
    let count = 0;

    for(let i=0;i<arr.length; i++){
        if (Array.isArray(arr[i])) {
            count += reduceNestedArray(arr[i]);
          } else {
            count += arr[i];
          }
        
    }
    return count
}

console.log(reduceNestedArray([1, [1, 2, [4]]]));
