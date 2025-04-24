// 1-я задача
function foo() {
     const x = 10;
     return {
         x: 20,
         bar: () => {
             console.log(this.x);
         },
         baz: function () {
             console.log(this.x);
         }
     };
 }

 const obj1 = foo();
 obj1.bar();
 obj1.baz();

 const obj2 = foo.call({ x: 30 });
 
 let y = obj2.bar; 
 let z = obj2.baz; 
 y();
 z();
 
 obj2.bar();
 obj2.baz();

// 2-я задача
const a = {x: 1};

//[[Prototype]]
a.__proto__ = {}
console.log(a.hasOwnProperty('__proto__')) // true
console.log(a.__proto__.hasOwnProperty('__proto__')) // true

// Прототипное наследование (внутренне устройство)
// https://habr.com/ru/articles/518360/

// 3-я
"use strict";

const obj = {
    child: {
      i: 10,
      b: () => console.log(this.i, this),
      c() {
        console.log(this.i, this);
      },
    }
};

obj.child.b(); // logs undefined, Window { /* … */ } (or the global object)
obj.child.c(); // logs 10, Object { /* … */ }

// 4-я
console.log(1)

setTimeout(() => {
    console.log(2)
})

Promise.resolve().then(() => console.log('micro'))
Promise.resolve().then(() => console.log('micro1'))
Promise.resolve().then(() => console.log('micro2'))

const p = new Promise((res) => {
    console.log(3)
    setTimeout(() => {
        console.log(4)
        res()
    })
})

setTimeout(() => {
    console.log(5)
})

p.then(() => {
    console.log(6)
}).then(() => {
    console.log(7)
})

console.log(8)

// 5-я
Promise.reject('a') // 
    .then(p=>p+'1',p=>p+'2') // 
    .catch(p=>p+'b') //
    .catch(p=>p+'с') //
    .then(p=>p+'d1') // 
    .then('d2') //
    .then(p=>p+'d3') // 
    .finally(p=>p+'e') // 
    .then(p=>console.log(p)) // ?

// 6-я
// Fiber
// requestAnimationFrame
// каррирование

// 7-я
Типы и интерфейсы - разница.

1) Объекты: описывать объекты можно и так и так. И тип и интерфейс будут взаимозаменяемы.

2) Функции: описывать функции можно так и так.

  type SumB = (a: number, b: number) => number;

  const sum: SumB = (a, b) => a + b

  interface SumA {
    (a: number, b: number): number;
  }

3) Наследование от типа

  Раньше нельзя было так сделать, а теперь можно.

  type B = {
    name: string;
  }

  interface A extends B {
    
  }

  const b: A = {
    name: string;
  }

4) Алиасы для примитивов - только через типы.

  type UniqueId = string;

  interface User {
    id: UniqueId;
  }

5) Для массива можно и так и так (алиас).
  
  type NamesA = string[]; // так короче и понятнее

  interface NamesB {
    [key: number]: string;
  }

6) Кортежи тоже только через типы.

  type State = [number, (n: number) => void];

  const s: State = [123, (n) => {}]

7) Объединения

  type A = {
    age: number;
  }

  type B = {
    name: string;
  }

  type C = A | B;

  const obj: C = { // одно из поле или оба поля
        age: 132, 
        name: '12321'
    } // и через интерфейс так не сделать

    interface D extends A | B {} // нельзя
    interface D extends С {} // и так нельзя, т.к. внутри объединение

  interface D extends A, B {} // так можно, но придется указывать оба поля


8 )  Типы в отличие от интерфейсов не могут быть объявлены несколько раз

  type A = {
    age: number;
  }

  type A = {} // ошибка


  // А так можно, нужны будут оба поля
  interface A {
    age: number;  
  }

  interface A {
    name: string;  
  }

// 8-я
infer // что такое в TS