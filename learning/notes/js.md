# JavaScript: структурированный конспект

## Основные правила и стиль кода

### `var`, `let`, `const`

В современном коде почти всегда используют `let` и `const`.

- `let` подходит, когда значение потом будет меняться.
- `const` подходит, когда переопределять переменную не нужно.
- `var` лучше не использовать в новом коде: у него функциональная область видимости, всплытие и несколько старых особенностей, из-за которых проще словить баг.

```js
let count = 0;
count += 1;

const userName = "Nick";
// userName = "John"; // TypeError: Assignment to constant variable
```

Важно: `const` не делает объект или массив полностью неизменяемым. Она защищает только саму ссылку.

```js
const user = { name: "Nick" };
user.name = "Max"; // это нормально

// user = {}; // так уже нельзя
```

### Всплытие и временная мёртвая зона

`var` всплывает и получает значение `undefined` до строки инициализации.

```js
console.log(test); // undefined
var test = "hello";
```

`let` и `const` тоже поднимаются на этапе создания области видимости, но до инициализации попадают во временную мёртвую зону. Поэтому доступ к ним раньше времени вызывает ошибку.

```js
// console.log(value); // ReferenceError
let value = 10;
```

### Точка с запятой и читаемость

JavaScript умеет автоматически подставлять точку с запятой, но иногда это даёт неожиданный результат. Поэтому на практике обычно либо ставят `;` везде, либо строго придерживаются одного стиля и знают, где опасные места.

```js
const message = "Hello";
const result = message.toUpperCase();
```

Опасный пример:

```js
const fn = () => "test"
[1, 2, 3].forEach(console.log);

// движок может воспринять это не так, как вы ожидаете
```

### `async` и `defer` у `<script>`

- `defer`:
  - файл загружается параллельно HTML;
  - выполняется после разбора HTML;
  - порядок между `defer`-скриптами сохраняется.
- `async`:
  - файл загружается параллельно HTML;
  - выполняется сразу после загрузки;
  - порядок между `async`-скриптами не гарантируется.

```html
<script src="./app.js" defer></script>
```

`defer` обычно безопаснее для обычных скриптов страницы.

**Кратко:**

- Для новых переменных используй `const` и `let`.
- `var` лучше оставить для чтения старого кода.
- Автоподстановка `;` существует, но слепо на неё надеяться не стоит.
- Для подключения обычных скриптов чаще всего подходит `defer`.

## Типы данных и преобразования

### Примитивы и объекты

В JavaScript есть 7 примитивных типов:

- `undefined`
- `null`
- `boolean`
- `number`
- `bigint`
- `string`
- `symbol`

И отдельно есть ссылочный тип: `object`.

Функции технически тоже объекты, хотя `typeof` для них возвращает `"function"`.

```js
console.log(typeof 42); // "number"
console.log(typeof "hello"); // "string"
console.log(typeof true); // "boolean"
console.log(typeof undefined); // "undefined"
console.log(typeof Symbol("id")); // "symbol"
console.log(typeof 10n); // "bigint"
console.log(typeof {}); // "object"
console.log(typeof (() => {})); // "function"
```

### Ловушка с `null`

Один из старых багов языка:

```js
console.log(typeof null); // "object"
```

Поэтому `typeof` не подходит для проверки на `null`.

```js
const value = null;

if (value === null) {
  console.log("Это null");
}
```

### Приведение типов

JavaScript часто сам приводит типы. Иногда это удобно, иногда это источник странных багов.

```js
console.log("5" + 2); // "52"
console.log("5" - 2); // 3
console.log(Boolean("")); // false
console.log(Boolean("text")); // true
console.log(Number("42")); // 42
console.log(Number("42px")); // NaN
```

💡 Совет: если важна точность и предсказуемость, приводи типы явно.

```js
const width = Number.parseInt("120px", 10);
const price = Number("499");
```

### `NaN`, `isNaN`, `Number.isNaN`

`NaN` означает, что число получить не удалось.

```js
console.log(Number("hello")); // NaN
```

Лучше использовать `Number.isNaN`, а не глобальный `isNaN`, потому что он не делает лишних преобразований.

```js
console.log(Number.isNaN(Number("hello"))); // true
console.log(Number.isNaN("hello")); // false
```

### `nullish coalescing` и логические операторы

`||` берёт первое "правдивое" значение. Это удобно, но есть подводный камень: `0`, `""` и `false` считаются ложными.

```js
console.log(0 || 100); // 100
```

Если нужно подставлять значение только для `null` и `undefined`, используй `??`.

```js
console.log(0 ?? 100); // 0
console.log(undefined ?? 100); // 100
```

**Кратко:**

- Основные типы надо знать наизусть.
- `typeof null === "object"` — старый баг языка.
- Не полагайся слишком сильно на неявные преобразования.
- Для проверки на `NaN` обычно нужен `Number.isNaN`.
- Для значений по умолчанию часто безопаснее `??`, чем `||`.

## Операторы и сравнения

### Основные группы операторов

В JavaScript часто используются:

- арифметические: `+`, `-`, `*`, `/`, `%`, `**`
- сравнения: `>`, `<`, `>=`, `<=`, `===`, `!==`
- логические: `&&`, `||`, `!`
- присваивание: `=`, `+=`, `-=`, `&&=`, `||=`, `??=`

```js
const total = 10 + 5 * 2; // 20
const isAdult = age >= 18;
```

### Строгое и нестрогое сравнение

Почти всегда используй `===` и `!==`.

```js
console.log(5 == "5"); // true
console.log(5 === "5"); // false
```

`==` приводит типы и может вести себя неочевидно.

### Инкремент и декремент

Префиксная форма сначала меняет значение, потом возвращает его. Постфиксная делает наоборот.

```js
let count = 1;

console.log(++count); // 2
console.log(count++); // 2
console.log(count); // 3
```

### Оператор расширения `...`

Он часто используется для копирования и объединения массивов и объектов.

```js
const baseButton = {
  text: "Buy",
  width: 200,
};

const redButton = {
  ...baseButton,
  color: "red",
};

console.log(redButton);
```

Важно: для объектов и массивов это поверхностная копия.

```js
const original = {
  settings: { theme: "dark" },
};

const copy = { ...original };
copy.settings.theme = "light";

console.log(original.settings.theme); // "light"
```

**Кратко:**

- Для сравнения почти всегда используй `===` и `!==`.
- `||` и `??` решают похожие, но не одинаковые задачи.
- `...` удобен, но делает только поверхностную копию.
- С префиксным и постфиксным `++` лучше быть внимательным.

## Строки

### Создание и шаблонные строки

Для обычных строк подойдут одинарные или двойные кавычки. Для подстановки значений и многострочного текста удобнее шаблонные строки.

```js
const name = "Nick";
const message = `Привет, ${name}!`;

console.log(message);
```

### Длина строки и доступ к символам

У строки есть свойство `length`.

```js
const text = "JavaScript";

console.log(text.length); // 10
console.log(text[0]); // "J"
console.log(text[text.length - 1]); // "t"
```

Строки неизменяемые. Нельзя просто заменить символ по индексу.

```js
const word = "cat";
// word[0] = "b"; // не сработает
```

### Полезные методы строк

```js
const text = "JavaScript";

console.log(text.toUpperCase()); // "JAVASCRIPT"
console.log(text.toLowerCase()); // "javascript"
console.log(text.includes("Script")); // true
console.log(text.startsWith("Java")); // true
console.log(text.endsWith("Script")); // true
console.log(text.slice(4)); // "Script"
console.log(text.replace("Java", "Type")); // "TypeScript"
```

### Поиск подстроки

Если нужен индекс, используй `indexOf`.

```js
const text = "frontend developer";

console.log(text.indexOf("dev")); // 9
console.log(text.indexOf("python")); // -1
```

Если нужен просто `true` / `false`, удобнее `includes`.

### Перебор строки

`for...of` перебирает строку по символам.

```js
for (const char of "JS") {
  console.log(char);
}
```

💡 Совет: для пользовательского текста учитывай Unicode. Один "видимый символ" не всегда равен одному индексу.

**Кратко:**

- Для подстановок удобнее шаблонные строки.
- У строки есть `length`, но сама строка неизменяема.
- Для поиска чаще всего хватает `includes`, `startsWith`, `endsWith`.
- Если нужен индекс, используй `indexOf`.

## Числа

### Обычные числа и `BigInt`

Тип `number` хранит и целые, и дробные значения.

```js
const count = 10;
const price = 19.99;
```

Для очень больших целых есть `BigInt`.

```js
const big = 9007199254740993n;
```

Смешивать `number` и `bigint` напрямую нельзя.

```js
// console.log(10n + 5); // TypeError
```

### Округление и `Math`

```js
console.log(Math.floor(5.9)); // 5
console.log(Math.ceil(5.1)); // 6
console.log(Math.round(5.5)); // 6
console.log(Math.trunc(5.9)); // 5
console.log(Math.max(5, 10, 3)); // 10
console.log(Math.min(5, 10, 3)); // 3
console.log(Math.abs(-10)); // 10
console.log(2 ** 5); // 32
```

### Проблема точности дробных чисел

В JavaScript дробные числа хранятся в двоичном формате, поэтому иногда результат выглядит странно.

```js
console.log(0.1 + 0.2); // 0.30000000000000004
```

Если нужно округлить результат:

```js
const value = Math.round((1.005 + Number.EPSILON) * 100) / 100;
console.log(value); // 1.01
```

### `toFixed`

`toFixed` округляет число, но возвращает строку.

```js
const price = 5.845;

console.log(price.toFixed(2)); // строка
```

### `parseInt`, `parseFloat`, `Number`

```js
console.log(Number("42")); // 42
console.log(Number.parseInt("42px", 10)); // 42
console.log(Number.parseFloat("12.5rem")); // 12.5
console.log(Number("42px")); // NaN
```

Важно:

- `Number()` требует, чтобы вся строка была числом.
- `parseInt()` и `parseFloat()` читают число с начала строки, пока могут.

```js
console.log(Number.parseInt("150px", 10)); // 150
console.log(Number.parseInt("px150", 10)); // NaN
```

**Кратко:**

- `number` покрывает почти все обычные задачи.
- Для очень больших целых используй `BigInt`.
- Дробные числа могут давать погрешность.
- `toFixed()` возвращает строку.
- `Number`, `parseInt`, `parseFloat` работают по-разному.

## Объекты

### Создание объекта

```js
const user = {
  name: "Nick",
  age: 30,
};
```

### Доступ к свойствам

Через точку:

```js
console.log(user.name);
```

Через квадратные скобки:

```js
console.log(user["age"]);
```

Скобки нужны, когда:

- имя свойства хранится в переменной;
- ключ содержит пробелы;
- ключ вычисляется динамически.

```js
const key = "name";

console.log(user[key]);

const settings = {
  ["theme-color"]: "black",
};
```

### Короткая запись свойств

```js
const name = "Nick";
const age = 30;

const user = { name, age };
```

### Удаление и проверка свойства

```js
const user = { name: "Nick", age: 30 };

delete user.age;

console.log("name" in user); // true
console.log("age" in user); // false
```

Если свойство может существовать, но иметь значение `undefined`, оператор `in` полезнее обычной проверки через `=== undefined`.

### Опциональная цепочка

Она спасает от ошибки, если какого-то вложенного свойства нет.

```js
const user = {};

console.log(user.address?.street); // undefined
```

### Копирование объектов

Поверхностная копия:

```js
const user = {
  name: "Nick",
  settings: {
    theme: "dark",
  },
};

const shallowCopy = { ...user };
```

Современная глубокая копия для обычных данных:

```js
const deepCopy = structuredClone(user);
```

Важно:

- `Object.assign()` и `...` копируют только верхний уровень.
- `JSON.parse(JSON.stringify(obj))` ломает `Date`, `Map`, `Set`, `undefined`, функции и не подходит как универсальный способ.

### `this` в методах объекта

`this` обычно указывает на объект слева от точки в момент вызова.

```js
const user = {
  name: "Nick",
  showName() {
    console.log(this.name);
  },
};

user.showName(); // "Nick"
```

Важно: у стрелочных функций своего `this` нет. Для методов объекта они обычно не подходят.

```js
const user = {
  name: "Nick",
  showName: () => {
    console.log(this.name);
  },
};
```

**Кратко:**

- Объекты хранят данные по ключам.
- Для динамических ключей используй квадратные скобки.
- `...` и `Object.assign()` делают поверхностную копию.
- `?.` помогает безопасно читать вложенные свойства.
- У стрелочных функций нет собственного `this`.

## JSON

JSON нужен для обмена данными между клиентом и сервером.

### `JSON.stringify`

Преобразует JavaScript-значение в строку JSON.

```js
const user = {
  name: "Nick",
  age: 30,
};

const json = JSON.stringify(user);
console.log(json); // {"name":"Nick","age":30}
```

### `JSON.parse`

Преобразует JSON-строку обратно в JavaScript-значение.

```js
const json = '{"name":"Nick","age":30}';
const user = JSON.parse(json);

console.log(user.name); // "Nick"
```

Важно:

- В JSON ключи и строки пишутся в двойных кавычках.
- `undefined`, функции и `symbol` в JSON не сериализуются как обычные поля.

**Кратко:**

- `JSON.stringify()` превращает данные в JSON-строку.
- `JSON.parse()` возвращает JavaScript-объект.
- JSON подходит для обмена данными, но не для хранения всей сложности JS-объектов.

## Функции

### Function Declaration

Это обычное объявление функции.

```js
function sum(a, b) {
  return a + b;
}
```

Такую функцию можно вызывать раньше места её объявления из-за всплытия.

### Function Expression

Функцию можно сохранить в переменную.

```js
const sum = function (a, b) {
  return a + b;
};
```

### Стрелочные функции

Короткая запись для функций.

```js
const sum = (a, b) => a + b;
```

Они удобны для колбэков, но важно помнить:

- у них нет собственного `this`;
- у них нет `arguments`;
- их нельзя использовать как конструктор с `new`.

### Возврат из функции

После `return` выполнение функции заканчивается.

```js
function getStatus(isReady) {
  if (!isReady) {
    return "not ready";
  }

  return "ready";
}
```

Если `return` нет, функция возвращает `undefined`.

### Параметры по умолчанию

```js
function greet(name = "Гость") {
  return `Привет, ${name}`;
}
```

### Остаточные параметры

Они собирают оставшиеся аргументы в массив.

```js
function sumAll(...numbers) {
  return numbers.reduce((acc, num) => acc + num, 0);
}

console.log(sumAll(1, 2, 3, 4)); // 10
```

### Колбэки

Колбэк — это функция, которую передают в другую функцию.

```js
function processUserInput(callback) {
  const name = "Nick";
  callback(name);
}

processUserInput((name) => {
  console.log(`Пользователь: ${name}`);
});
```

### Замыкания

Замыкание — это функция, которая помнит переменные из внешней области видимости даже после того, как внешняя функция уже закончила работу.

```js
function createCounter() {
  let count = 0;

  return function () {
    count += 1;
    return count;
  };
}

const counter = createCounter();

console.log(counter()); // 1
console.log(counter()); // 2
```

Аналогия: внешняя функция как будто выдаёт внутренней функции "рюкзак" с нужными данными.

### Рекурсия

Рекурсия — это когда функция вызывает саму себя.

```js
function factorial(n) {
  if (n <= 1) {
    return 1;
  }

  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
```

Важно: у рекурсии обязательно должно быть условие выхода.

### `bind`, `call`, `apply`

Эти методы позволяют управлять `this`.

```js
const user = {
  name: "Nick",
};

function showName(city) {
  console.log(`${this.name} from ${city}`);
}

showName.call(user, "Kyiv");
showName.apply(user, ["Kyiv"]);

const boundShowName = showName.bind(user, "Kyiv");
boundShowName();
```

### Каррирование и частичное применение

Каррирование — это превращение функции с несколькими аргументами в цепочку функций по одному аргументу.

```js
const curryAdd = (a) => (b) => (c) => a + b + c;

console.log(curryAdd(1)(2)(3)); // 6
```

Частичное применение — это когда часть аргументов уже заранее "прошита".

```js
const addTax = (tax) => (price) => price + price * tax;

const addVat = addTax(0.2);
console.log(addVat(100)); // 120
```

### Таймеры

```js
const timeoutId = setTimeout(() => {
  console.log("Выполнится один раз");
}, 1000);

clearTimeout(timeoutId);

const intervalId = setInterval(() => {
  console.log("Выполняется каждые 2 секунды");
}, 2000);

clearInterval(intervalId);
```

**Кратко:**

- Функции бывают объявлением, выражением и стрелочной формой.
- У стрелочных функций нет собственного `this`.
- `return` сразу завершает выполнение.
- Замыкания позволяют помнить внешние данные.
- `bind`, `call`, `apply` нужны для управления контекстом вызова.

## Конструкторы, `new` и генераторы

### Функция-конструктор

Через `new` можно создавать объект по шаблону.

```js
function User(name) {
  this.name = name;
  this.age = 30;
}

const user = new User("Nick");
console.log(user);
```

Что делает `new`:

1. создаёт новый объект;
2. привязывает `this` к нему;
3. выполняет функцию;
4. возвращает объект, если ты не вернул другой объект явно.

Важно: не нужно писать `this = {}` вручную. Это делает механизм `new`.

### Классы

В современном коде для этого чаще используют `class`, но под капотом всё равно работают прототипы.

### Генераторы

Генератор — это функция, которая может "останавливаться" и продолжать выполнение позже.

```js
function* idGenerator() {
  let id = 1;

  while (true) {
    yield id;
    id += 1;
  }
}

const generator = idGenerator();

console.log(generator.next().value); // 1
console.log(generator.next().value); // 2
```

Это полезно, когда значения нужно выдавать постепенно.

### Полифилы

Полифил — это код, который добавляет поддержку возможностей языка в старую среду.

```js
if (!Array.prototype.at) {
  Array.prototype.at = function (index) {
    if (index < 0) {
      return this[this.length + index];
    }

    return this[index];
  };
}
```

Важно: встроенные прототипы расширяют осторожно. В реальном проекте чаще используют готовые решения и сборку.

**Кратко:**

- `new` сам создаёт объект и привязывает `this`.
- Для новых проектов чаще выбирают `class`, а не старые конструкторы.
- Генераторы удобны для ленивой выдачи данных.
- Полифилы нужны для совместимости со старыми окружениями.

## Области видимости и строгий режим

### Области видимости

Есть три основные области видимости:

- глобальная;
- функциональная;
- блочная.

```js
const globalValue = "global";

function test() {
  const localValue = "local";

  if (true) {
    const blockValue = "block";
    console.log(blockValue);
  }

  console.log(localValue);
}
```

`let` и `const` живут в блоке. `var` живёт в функции.

### Строгий режим

Строгий режим делает поведение языка более предсказуемым и запрещает часть опасных вещей.

```js
"use strict";

// name = "Nick"; // ReferenceError
```

Важно: в ES-модулях строгий режим включён по умолчанию.

**Кратко:**

- `let` и `const` имеют блочную область видимости.
- `var` имеет функциональную область видимости.
- `use strict` помогает раньше ловить ошибки.
- В модулях строгий режим уже включён.

## Event Loop и асинхронная модель

JavaScript в браузере выполняет код в одном основном потоке. Но при этом умеет работать с асинхронными задачами через очередь задач и цикл событий.

### Что важно помнить

- Сначала выполняется синхронный код.
- Потом обрабатываются микрозадачи.
- Потом берётся следующая макрозадача.
- Перед следующей отрисовкой браузер может сделать рендер.

### Макрозадачи и микрозадачи

Макрозадачи:

- `setTimeout`
- `setInterval`
- DOM-события
- сетевые события

Микрозадачи:

- `Promise.then`
- `catch`
- `finally`
- `queueMicrotask`

```js
console.log(1);

setTimeout(() => console.log(2), 0);

Promise.resolve()
  .then(() => console.log(3));

console.log(4);

// 1, 4, 3, 2
```

### Почему это важно

Если не понимать event loop, легко ошибиться в порядке выполнения кода.

Мини-вывод: `Promise`-колбэки не "магически быстрее", они просто идут в очередь микрозадач.

**Кратко:**

- Синхронный код выполняется сразу.
- Микрозадачи идут раньше макрозадач.
- `Promise.then()` обычно выполнится раньше `setTimeout(..., 0)`.
- Event loop особенно важен при работе с UI и асинхронностью.

## Обработка ошибок

### `try...catch`

```js
try {
  const data = JSON.parse("{ invalid json }");
  console.log(data);
} catch (error) {
  console.error("Ошибка парсинга:", error.message);
}
```

### `throw`

Ошибку можно выбросить вручную.

```js
function divide(a, b) {
  if (b === 0) {
    throw new Error("На ноль делить нельзя");
  }

  return a / b;
}
```

### `finally`

Этот блок выполнится в любом случае.

```js
try {
  console.log("Работаем");
} catch (error) {
  console.error(error);
} finally {
  console.log("Очистка ресурсов");
}
```

Важно: `try...catch` ловит синхронные ошибки. Для `Promise` и `async/await` есть свои нюансы.

**Кратко:**

- `try...catch` нужен для обработки ошибок в рантайме.
- `throw` позволяет выбросить ошибку вручную.
- `finally` полезен для очистки.
- Ошибки лучше не замалчивать, а обрабатывать осмысленно.

## Массивы

### Создание и базовые операции

```js
const numbers = [1, 2, 3];

numbers.push(4);
numbers.pop();
numbers.unshift(0);
numbers.shift();
```

### Перебор и трансформация

```js
const numbers = [1, 2, 3, 4];

const doubled = numbers.map((num) => num * 2);
const evens = numbers.filter((num) => num % 2 === 0);
const sum = numbers.reduce((acc, num) => acc + num, 0);

console.log(doubled); // [2, 4, 6, 8]
console.log(evens); // [2, 4]
console.log(sum); // 10
```

### Поиск

```js
const users = [
  { id: 1, name: "Nick" },
  { id: 2, name: "Max" },
];

console.log(users.find((user) => user.id === 2));
console.log(users.some((user) => user.name === "Nick"));
console.log(users.every((user) => "id" in user));
```

### `slice`, `splice`, `at`

```js
const items = ["a", "b", "c", "d"];

console.log(items.slice(1, 3)); // ["b", "c"]

items.splice(1, 2, "x", "y");
console.log(items); // ["a", "x", "y", "d"]

console.log(items.at(-1)); // "d"
```

### Сортировка

По умолчанию `sort()` сортирует как строки.

```js
const numbers = [1, 10, 2];

console.log(numbers.sort()); // [1, 10, 2]
```

Для чисел нужен свой компаратор.

```js
const numbers = [1, 10, 2];

numbers.sort((a, b) => a - b);
console.log(numbers); // [1, 2, 10]
```

Важно: `sort()` мутирует массив.

```js
const sorted = [...numbers].sort((a, b) => a - b);
```

**Кратко:**

- `map`, `filter`, `reduce` — базовые инструменты для работы с массивами.
- `find` возвращает элемент, `filter` — массив элементов.
- `sort()` по умолчанию сортирует строки.
- Многие методы массив мутируют, и это надо учитывать.

## Деструктуризация

Деструктуризация позволяет удобно доставать значения из массива или объекта.

### Объекты

```js
const user = {
  name: "Nick",
  age: 30,
};

const { name, age } = user;
```

### Массивы

```js
const colors = ["red", "green", "blue"];

const [first, second] = colors;
```

### Значения по умолчанию и переименование

```js
const user = {
  name: "Nick",
};

const {
  name: userName,
  age = 18,
} = user;

console.log(userName, age);
```

### Деструктуризация в параметрах

```js
function printUser({ name, age }) {
  console.log(`${name}, ${age}`);
}
```

Важно: если аргумент может быть `undefined`, добавляй значение по умолчанию.

```js
function printUser({ name, age } = {}) {
  console.log(name, age);
}
```

**Кратко:**

- Деструктуризация делает код короче и чище.
- Можно задавать значения по умолчанию.
- Можно переименовывать свойства.
- В параметрах функции стоит помнить про безопасное значение по умолчанию.

## Условия и циклы

### `if`, тернарный оператор, `switch`

```js
const age = 20;

if (age >= 18) {
  console.log("Доступ разрешён");
} else {
  console.log("Доступ запрещён");
}

const status = age >= 18 ? "adult" : "minor";
```

```js
const role = "admin";

switch (role) {
  case "admin":
    console.log("Полный доступ");
    break;
  case "user":
    console.log("Обычный доступ");
    break;
  default:
    console.log("Роль не определена");
}
```

### Циклы

```js
for (let i = 0; i < 3; i += 1) {
  console.log(i);
}

let count = 0;
while (count < 3) {
  console.log(count);
  count += 1;
}
```

### `for...of` и `for...in`

`for...of` перебирает значения и хорошо подходит для массивов, строк, `Map`, `Set`.

```js
for (const value of [10, 20, 30]) {
  console.log(value);
}
```

`for...in` перебирает ключи объекта.

```js
const user = { name: "Nick", age: 30 };

for (const key in user) {
  console.log(key, user[key]);
}
```

Важно: `for...in` для массивов обычно не используют.

**Кратко:**

- `if` покрывает большинство условий.
- Тернарный оператор хорош для коротких выражений.
- `switch` удобен для набора конкретных вариантов.
- `for...of` и `for...in` решают разные задачи.

## Регулярные выражения

Регулярные выражения нужны для поиска и проверки строк по шаблону.

```js
const pattern = /\d+/;

console.log(pattern.test("abc123")); // true
console.log("abc123".match(pattern)); // ["123"]
```

### Частые флаги

- `g` — искать все совпадения
- `i` — игнорировать регистр
- `m` — многострочный режим

```js
const text = "JavaScript JS js";
console.log(text.match(/js/gi)); // ["JS", "js"]
```

### Частые конструкции

- `.` — любой символ, кроме перевода строки
- `\\d` — цифра
- `\\w` — буква, цифра или `_`
- `\\s` — пробельный символ
- `^` — начало строки
- `$` — конец строки
- `+` — один или больше
- `*` — ноль или больше
- `?` — ноль или один

Пример простой проверки email:

```js
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

console.log(emailPattern.test("test@example.com")); // true
```

Важно: регулярки мощные, но их легко сделать слишком сложными. Иногда обычные методы строки читаются лучше.

**Кратко:**

- RegExp полезны для поиска, проверки и замены.
- `test()` отвечает на вопрос "подходит или нет".
- `match()` возвращает совпадения.
- Не пытайся решать регулярками вообще всё подряд.

## DOM и BOM

### Что такое DOM

DOM — это объектное представление HTML-документа, с которым JavaScript может работать.

### Поиск элементов

```js
const title = document.querySelector("h1");
const items = document.querySelectorAll(".item");
```

### Изменение содержимого

```js
const title = document.querySelector("h1");

title.textContent = "Новый заголовок";
```

Если нужно вставить HTML, можно использовать `innerHTML`, но только с проверенным содержимым.

```js
container.innerHTML = "<strong>Hello</strong>";
```

Важно: для пользовательского ввода `innerHTML` опасен из-за XSS.

### Атрибуты, классы, стили

```js
const button = document.querySelector("button");

button.setAttribute("type", "button");
button.classList.add("is-active");
button.classList.toggle("hidden");
button.style.backgroundColor = "tomato";
```

### Создание и вставка элементов

```js
const list = document.querySelector(".list");
const item = document.createElement("li");

item.textContent = "Новый пункт";
list.append(item);
```

Другие варианты вставки:

- `prepend`
- `before`
- `after`
- `replaceWith`

### Удаление

```js
item.remove();
```

### Навигация по DOM

```js
const card = document.querySelector(".card");

console.log(card.parentElement);
console.log(card.children);
console.log(card.firstElementChild);
console.log(card.nextElementSibling);
```

### `dataset`

```html
<button data-id="42">Open</button>
```

```js
const button = document.querySelector("button");
console.log(button.dataset.id); // "42"
```

### BOM

BOM — это объекты браузера вне DOM, например:

- `window`
- `location`
- `history`
- `navigator`

```js
console.log(window.location.href);
```

### Shadow DOM

Shadow DOM позволяет изолировать структуру и стили компонента.

```js
const host = document.querySelector("#widget");
const shadowRoot = host.attachShadow({ mode: "open" });

shadowRoot.innerHTML = `
  <style>
    p { color: red; }
  </style>
  <p>Shadow DOM content</p>
`;
```

Мини-вывод: Shadow DOM особенно полезен для веб-компонентов и изоляции стилей.

**Кратко:**

- DOM нужен для работы со страницей.
- `querySelector` и `querySelectorAll` закрывают большую часть задач.
- `textContent` безопаснее `innerHTML`, если HTML не нужен.
- `classList`, `dataset`, `append` и `remove` используются постоянно.

## Размеры, координаты и прокрутка

### Размеры элемента

```js
const box = document.querySelector(".box");

console.log(box.offsetWidth);
console.log(box.offsetHeight);
console.log(box.clientWidth);
console.log(box.clientHeight);
```

### Координаты

```js
const rect = box.getBoundingClientRect();

console.log(rect.top, rect.left, rect.width, rect.height);
```

### Прокрутка

```js
console.log(window.scrollY);
console.log(window.scrollX);

window.scrollTo({
  top: 0,
  behavior: "smooth",
});
```

Важно: координаты из `getBoundingClientRect()` зависят от текущей прокрутки окна.

**Кратко:**

- `offset*` и `client*` отвечают за разные размеры.
- `getBoundingClientRect()` часто самый удобный способ получить координаты.
- Для плавной прокрутки можно использовать `scrollTo({ behavior: "smooth" })`.

## События

### Подписка на события

```js
const button = document.querySelector("button");

button.addEventListener("click", () => {
  console.log("Клик");
});
```

### Объект события

```js
button.addEventListener("click", (event) => {
  console.log(event.type);
  console.log(event.target);
  console.log(event.currentTarget);
});
```

### Всплытие и перехват

События обычно всплывают снизу вверх: от вложенного элемента к родителям.

```js
document.querySelector(".list").addEventListener("click", () => {
  console.log("Список");
});
```

Если нужен режим перехвата, его можно включить опцией.

```js
element.addEventListener("click", handler, { capture: true });
```

### `preventDefault` и `stopPropagation`

```js
link.addEventListener("click", (event) => {
  event.preventDefault();
});
```

```js
child.addEventListener("click", (event) => {
  event.stopPropagation();
});
```

### Делегирование событий

Очень полезный приём: ставим один обработчик на родителя и внутри смотрим, по чему именно кликнули.

```js
const list = document.querySelector(".list");

list.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");

  if (!button) {
    return;
  }

  console.log(button.dataset.action);
});
```

Это особенно удобно для динамического DOM.

### Частые события

- мышь: `click`, `dblclick`, `mousedown`, `mouseup`, `mousemove`
- клавиатура: `keydown`, `keyup`
- форма: `submit`, `input`, `change`, `focus`, `blur`

**Кратко:**

- Для событий почти всегда используют `addEventListener`.
- `event.target` и `event.currentTarget` — не одно и то же.
- Делегирование экономит обработчики и работает с динамическими элементами.
- `preventDefault` отменяет действие по умолчанию, `stopPropagation` останавливает всплытие.

## JavaScript и формы

### Доступ к форме

```js
const form = document.querySelector("form");
const emailInput = form.elements.email;
```

### Отправка формы

```js
form.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const email = formData.get("email");

  console.log(email);
});
```

### `input` и `change`

- `input` срабатывает сразу при изменении.
- `change` обычно срабатывает после подтверждения изменения или потери фокуса.

```js
emailInput.addEventListener("input", (event) => {
  console.log(event.target.value);
});
```

### Чекбоксы и выбранные значения

```js
const checkbox = document.querySelector('input[type="checkbox"]');

console.log(checkbox.checked);
```

### Валидация

```js
if (!emailInput.value.includes("@")) {
  emailInput.setCustomValidity("Введите корректный email");
} else {
  emailInput.setCustomValidity("");
}
```

Важно: не полагайся только на клиентскую валидацию. На сервере данные всё равно нужно проверять ещё раз.

**Кратко:**

- `submit` почти всегда перехватывают через `preventDefault()`, если форма обрабатывается JS.
- `FormData` удобно собирает данные формы.
- `input` и `change` нужны для разных сценариев.
- Клиентская валидация не заменяет серверную.

## Модули

Модули позволяют разбивать код на отдельные файлы.

### Экспорт

```js
export const API_URL = "https://example.com/api";

export function getUserName(user) {
  return user.name;
}
```

### Импорт

```js
import { API_URL, getUserName } from "./utils.js";
```

### Экспорт по умолчанию

```js
export default function initApp() {
  console.log("App started");
}
```

```js
import initApp from "./initApp.js";
```

Важно:

- путь к модулю в браузере обычно пишется явно, включая `.js`;
- модули работают в строгом режиме;
- каждое значение экспортируется один раз и потом импортируется по ссылке.

**Кратко:**

- Модули помогают держать код в порядке.
- Есть именованный экспорт и экспорт по умолчанию.
- ES-модули по умолчанию работают в строгом режиме.

## Классы и прототипы

### Класс

```js
class User {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Привет, я ${this.name}`);
  }

  static createGuest() {
    return new User("Гость");
  }
}

const user = new User("Nick");
user.sayHello();
```

### Наследование

```js
class Admin extends User {
  constructor(name, role) {
    super(name);
    this.role = role;
  }

  showRole() {
    console.log(this.role);
  }
}
```

### Прототипы

Методы класса на самом деле лежат в прототипе.

```js
console.log(Object.getPrototypeOf(user) === User.prototype); // true
```

### Проверка собственных свойств

```js
const user = new User("Nick");

console.log(Object.hasOwn(user, "name")); // true
console.log(Object.hasOwn(user, "sayHello")); // false
```

Важно: `hasOwnProperty` тоже работает, но `Object.hasOwn()` в современном коде выглядит чище.

**Кратко:**

- `class` — это удобный синтаксис над прототипами.
- Методы класса живут в прототипе.
- `static`-методы вызываются у самого класса.
- Наследование удобно, но использовать его стоит только там, где связь действительно логична.

## `Map`, `Set`, `WeakMap`, `WeakSet`

### `Map`

`Map` хранит пары ключ-значение и умеет использовать в качестве ключа почти что угодно.

```js
const user = { id: 1 };
const map = new Map();

map.set(user, "active");

console.log(map.get(user)); // "active"
```

### `Set`

`Set` хранит только уникальные значения.

```js
const ids = new Set([1, 2, 2, 3]);

console.log(ids); // Set(3) {1, 2, 3}
console.log(ids.has(2)); // true
```

### `WeakMap` и `WeakSet`

Они работают только с объектами и не мешают сборщику мусора удалять объект, если на него больше нет обычных ссылок.

Это удобно для приватных метаданных.

```js
const meta = new WeakMap();

function attachMeta(obj, value) {
  meta.set(obj, value);
}
```

Важно:

- `WeakMap` и `WeakSet` нельзя нормально перебрать.
- Их используют не для коллекций "на показ", а для внутренних технических задач.

**Кратко:**

- `Map` удобнее объекта, когда ключи не только строки.
- `Set` удобен для уникальных значений.
- `WeakMap` и `WeakSet` полезны для привязки данных к объектам без утечек памяти.

## Промисы

### Что такое промис

Промис — это объект, который представляет результат асинхронной операции: либо успешный, либо с ошибкой.

Состояния промиса:

- `pending`
- `fulfilled`
- `rejected`

### Создание промиса

```js
const promise = new Promise((resolve, reject) => {
  const isSuccess = true;

  if (isSuccess) {
    resolve("Готово");
  } else {
    reject(new Error("Что-то пошло не так"));
  }
});
```

### `then`, `catch`, `finally`

```js
promise
  .then((value) => {
    console.log(value);
    return value.toUpperCase();
  })
  .then((value) => {
    console.log(value);
  })
  .catch((error) => {
    console.error(error.message);
  })
  .finally(() => {
    console.log("Завершено");
  });
```

Важно:

- `then()` возвращает новый промис;
- если из `then()` вернуть значение, оно пойдёт дальше по цепочке;
- если выбросить ошибку, она перейдёт в ближайший `catch()`.

### `Promise.all`

Ждёт, пока выполнятся все промисы, и возвращает массив результатов в том же порядке.

```js
const p1 = Promise.resolve(1);
const p2 = Promise.resolve(2);

Promise.all([p1, p2]).then((values) => {
  console.log(values); // [1, 2]
});
```

Если хотя бы один промис упадёт, `Promise.all` тоже завершится с ошибкой.

### Другие полезные методы

```js
Promise.allSettled([p1, p2]);
Promise.race([p1, p2]);
Promise.any([p1, p2]);
```

Мини-вывод:

- `all` — когда нужны все успешные результаты;
- `allSettled` — когда нужен результат по каждому;
- `race` — кто быстрее завершится;
- `any` — первый успешный.

**Кратко:**

- Промис представляет результат асинхронной операции.
- `then`, `catch`, `finally` строят цепочку обработки.
- `Promise.all()` хорош, когда все задачи обязательны.
- Ошибки в цепочке нужно обрабатывать явно.

## `async/await`

`async/await` — это более удобная запись поверх промисов.

### `async`

`async`-функция всегда возвращает промис.

```js
async function getValue() {
  return 42;
}

getValue().then(console.log); // 42
```

Если внутри `async` выбросить ошибку, промис будет отклонён.

```js
async function fail() {
  throw new Error("Ошибка");
}
```

### `await`

`await` приостанавливает выполнение `async`-функции, пока промис не завершится.

```js
function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function run() {
  console.log("Старт");
  await wait(1000);
  console.log("Прошла 1 секунда");
}
```

### Обработка ошибок

```js
async function loadData() {
  try {
    const response = await fetch("/api/user");

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error.message);
    throw error;
  }
}
```

Важно: если `await` внутри цикла ждёт по одному запросу за раз, код может стать медленнее, чем нужно. Иногда лучше запускать задачи параллельно через `Promise.all`.

```js
const [user, posts] = await Promise.all([
  fetch("/api/user").then((res) => res.json()),
  fetch("/api/posts").then((res) => res.json()),
]);
```

**Кратко:**

- `async/await` делает асинхронный код проще для чтения.
- `await` можно использовать только внутри `async`-функции.
- Ошибки удобно ловить через `try...catch`.
- Для независимых задач часто лучше `Promise.all`, а не последовательные `await`.

## `fetch`

`fetch` — встроенный способ делать HTTP-запросы в браузере и в современных средах выполнения.

### GET-запрос

```js
async function getUsers() {
  const response = await fetch("/api/users");

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json();
}
```

### POST-запрос

```js
async function createUser(user) {
  const response = await fetch("/api/users", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(user),
  });

  if (!response.ok) {
    throw new Error(`Ошибка запроса: ${response.status}`);
  }

  return response.json();
}
```

Важно:

- `fetch` отклоняет промис не на любой HTTP-ошибке, а в основном на сетевой;
- статус `404` или `500` нужно проверять через `response.ok` или `response.status`;
- `response.json()` тоже возвращает промис.

💡 Совет: сначала проверь `response.ok`, потом читай тело ответа.

**Кратко:**

- `fetch` возвращает промис с объектом ответа.
- HTTP-ошибки нужно проверять вручную.
- `response.json()` асинхронный.
- Для отправки JSON не забудь `Content-Type: application/json`.
