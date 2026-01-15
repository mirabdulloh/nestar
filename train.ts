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

// function reverseInteger(num: number) {
// 	return num.toString().split('').reverse().join();
// }

// console.log(reverseInteger(1245666778899));

// Task ZO
// function areParenthesesBalanced(str: string): boolean {
// 	let balance = 0;

// 	for (const ch of str) {
// 		if (ch === '(') balance++;
// 		else if (ch === ')') {
// 			balance--;
// 			if (balance < 0) return false;
// 		}
// 	}

// 	return balance === 0;
// }

// console.log(areParenthesesBalanced('string(ichida(qavslar)soni()balansda'));

// Task ZP

// function countNumberAndLetters(str: string): string {
// 	let letter = 0;
// 	let number = 0;
// 	for (let i = 0; i < str.length; i++) {
// 		const ch = str[i];
// 		if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')) {
// 			letter++;
// 		} else if (ch >= '0' && ch <= '9') {
// 			number++;
// 		}
// 	}
// 	return `Letters: ${letter}, Numbers: ${number}`;
// }

// console.log(countNumberAndLetters('Hello World! 1234 @#2$%'));

// Task ZQ

// function findDuplicates(arr: number[]): number[] {
// 	const count = [];
// 	for (let i = 0; i < arr.length; i++) {
// 		for (let j = i + 1; j < arr.length; j++) {
// 			if (arr[i] === arr[j]) {
// 				if (!count.includes(arr[i])) {
// 					count.push(arr[i]);
// 				}
// 			}
// 		}
// 	}
// 	return count;
// }

// console.log(findDuplicates([1, 2, 3, 4, 5, 1, 2, 3]));

// Task ZR

function areArraysEqual(arr: number[], arr2: number[]): boolean {
	for (const x of arr) {
		if (!arr2.includes(x)) return false;
	}
	return true;
}
console.log(areArraysEqual([1, 2, 3, 4], [3, 1, 2]));
