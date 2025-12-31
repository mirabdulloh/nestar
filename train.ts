// Task ZJ
// import { count } from "console";

// function reduceNestedArray(arr:any[]){
//     let count = 0;

//     for(let i=0;i<arr.length; i++){
//         if (Array.isArray(arr[i])) {
//             count += reduceNestedArray(arr[i]);
//           } else {
//             count += arr[i];
//           }

//     }
//     return count
// }

// console.log(reduceNestedArray([1, [1, 2, [4]]]));

// Task ZK

// function delayHelloWorld(limit: number): Promise<number> {
//     let count = 0;

//     return new Promise((resolve) => {
//       const id = setInterval(() => {
//         count++;
//         console.log(`${count === limit ? " " : count }`);

//         if (count === limit) {
//           clearInterval(id);
//           resolve(count);
//         }
//       }, 1000);
//     });
//   }

//   delayHelloWorld(5).then(console.log);

// Task ZL

// function stringToKebab(str: string): string {
// 	return str.trim().toLowerCase().replace(/\s+/g, '-');
// }
// console.log(stringToKebab('I love Kebab'));

// Task ZM

function reverseInteger(num: number) {
	return num.toString().split('').reverse().join();
}

console.log(reverseInteger(1245666778899));
