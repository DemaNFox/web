# TypeScript

## Что такое TypeScript

TypeScript это надмножество JavaScript, которое добавляет в язык статическую типизацию и дополнительные возможности для описания структуры данных.

Если говорить совсем просто, TypeScript помогает раньше замечать ошибки. Не в браузере, не в проде, а еще на этапе написания кода и компиляции.

Важно понимать правильную мысль:

- TypeScript не заменяет JavaScript
- TypeScript компилируется в JavaScript
- TypeScript не убирает все возможные баги
- он в первую очередь помогает ловить ошибки, связанные со структурой данных и контрактами между частями кода

То есть TypeScript это не "магия, которая делает проект безошибочным", а инструмент, который делает код более предсказуемым и удобным в поддержке.

### Что он дает на практике

- IDE лучше понимает код
- автодополнение становится точнее
- рефакторинг делать безопаснее
- легче работать в большой команде
- проще понять, что функция принимает и что возвращает
- меньше случайных ошибок из серии "ожидали строку, а пришел объект"

### Где TypeScript особенно полезен

Он особенно хорошо раскрывается:

- в средних и больших проектах
- в командной разработке
- в React-приложениях
- в Node.js backend
- в библиотеках и SDK

На маленьком учебном проекте польза может быть не так заметна. Но чем сложнее кодовая база, тем сильнее становится преимущество TypeScript.

### Что TypeScript не делает

TypeScript не проверяет все в рантайме.

Например, если ты получил данные с сервера, TypeScript не может "магически" гарантировать, что сервер действительно прислал именно тот формат, который ты описал типом. Для этого уже нужны runtime-проверки, валидация или схемы.

То есть:

- TypeScript проверяет код во время разработки
- JavaScript выполняется уже в рантайме

### Мини-аналогия

JavaScript это дорога без разметки: ехать можно быстро, но легко ошибиться.

TypeScript это та же дорога, но с разметкой, знаками и ограждениями. Машина не становится идеальной, но ехать безопаснее и понятнее.

### Кратко:

- TypeScript это надмножество JavaScript со статической типизацией.
- Он помогает раньше находить ошибки и лучше описывать код.
- Это инструмент для надежности и поддержки, а не замена логики приложения.

### Типичные ошибки

- Думать, что TypeScript убирает все баги автоматически.
- Пытаться типизировать проект формально, не понимая смысл типов.
- Считать TypeScript отдельным языком без связи с JavaScript.

---

## Базовые типы

В TypeScript есть набор базовых типов, с которых обычно все начинается:

- `string`
- `number`
- `boolean`
- `null`
- `undefined`
- `symbol`
- `bigint`

Примеры:

```ts
const userName: string = 'Nick'
const age: number = 25
const isAdmin: boolean = false
```

Во многих случаях TypeScript умеет вывести тип сам:

```ts
const title = 'TypeScript'
// TypeScript сам поймет, что это string
```

Это называется **type inference**. То есть тип можно не писать везде вручную, если он и так очевиден.

### Массивы

```ts
const numbers: number[] = [1, 2, 3]
const names: Array<string> = ['Ann', 'Bob']
```

Оба варианта рабочие.

### Кортежи

Кортеж это массив с фиксированным количеством элементов и заранее известными типами по позициям.

```ts
const user: [number, string] = [1, 'Nick']
```

Здесь:

- первый элемент должен быть `number`
- второй элемент должен быть `string`

Кортежи полезны, когда порядок элементов важен.

### Literal types

Иногда нужно указать не просто "строку", а конкретно одну из нескольких строк.

```ts
let status: 'loading' | 'success' | 'error'

status = 'loading'
```

Это удобно для состояний, режимов и вариантов поведения.

### Кратко:

- В TypeScript есть стандартные примитивные типы и типы коллекций.
- Не всегда нужно писать тип вручную: часто помогает type inference.
- Literal types полезны, когда допустимы только конкретные значения.

### Типичные ошибки

- Пытаться аннотировать вообще каждую переменную, даже когда тип и так очевиден.
- Путать кортеж с обычным массивом.
- Использовать слишком широкий тип там, где лучше literal union.

---

## Аннотация типов и вывод типов

TypeScript умеет сам выводить типы из контекста. Это очень полезная возможность, потому что код не становится перегруженным.

Пример:

```ts
const price = 100
// price имеет тип number
```

Но бывают случаи, когда тип лучше указать явно:

- если функция публичная
- если тип неочевиден
- если нужен точный контракт
- если код должен быть понятен другому разработчику без догадок

Пример с явным описанием:

```ts
function formatPrice(value: number): string {
  return `${value} USD`
}
```

### Баланс важнее фанатизма

Хороший TypeScript-код это не код, где вручную прописан каждый тип. Хороший TypeScript-код это код, где:

- очевидное выводится автоматически
- важное описано явно

То есть не нужно воевать с inference. Нужно использовать его там, где он делает код чище.

### Кратко:

- TypeScript умеет сам выводить многие типы.
- Явную аннотацию полезно писать для важных публичных контрактов.
- Хороший стиль это баланс между краткостью и ясностью.

### Типичные ошибки

- Либо писать типы абсолютно везде, либо не писать их нигде.
- Надеяться только на inference в сложных функциях и API.
- Делать сигнатуры функций неявными, хотя они важны для проекта.

---

## Функции: параметры, return type, void и never

Функции в TypeScript типизируют по параметрам и по возвращаемому значению.

```ts
function sum(a: number, b: number): number {
  return a + b
}
```

Здесь:

- `a` и `b` должны быть числами
- функция возвращает `number`

### void

`void` обычно используют для функций, которые ничего не возвращают.

```ts
function logMessage(message: string): void {
  console.log(message)
}
```

Это не значит, что функция вообще ничего не делает. Это значит, что нам не нужен результат ее выполнения.

### never

`never` используют в более редких случаях. Этот тип означает, что функция **никогда не завершает выполнение нормально**.

Например:

```ts
function throwError(message: string): never {
  throw new Error(message)
}

function infiniteLoop(): never {
  while (true) {
    // Бесконечный цикл
  }
}
```

Разница между `void` и `never` важная:

- `void` означает "функция завершилась, но ничего не вернула"
- `never` означает "функция вообще не дошла до нормального завершения"

### Опциональные параметры

```ts
function greet(name: string, title?: string): string {
  if (title) {
    return `${title} ${name}`
  }

  return `Hello, ${name}`
}
```

`title?: string` означает, что параметр необязательный.

### Значения по умолчанию

```ts
function createMessage(text: string, prefix = 'Info'): string {
  return `[${prefix}] ${text}`
}
```

### Rest-параметры

```ts
function total(...values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0)
}
```

### Перегрузка функций

В TypeScript можно описывать несколько сигнатур одной функции.

```ts
function format(value: number): string
function format(value: string): string
function format(value: number | string): string {
  return String(value).trim()
}
```

Перегрузки полезны, когда одна и та же функция поддерживает несколько сценариев вызова. Но злоупотреблять ими не стоит: часто union тип проще и понятнее.

### Кратко:

- Типы функций описывают входные параметры и возвращаемое значение.
- `void` значит "ничего не возвращаем".
- `never` значит "нормального завершения нет".
- Перегрузки нужны не всегда: часто достаточно union типов.

### Типичные ошибки

- Путать `void` и `never`.
- Забывать типизировать возвращаемые значения важных функций.
- Использовать перегрузки там, где проще написать union и обычную проверку.

---

## Объекты, type и interface

В TypeScript объекты можно описывать прямо на месте:

```ts
const user: { name: string; age: number } = {
  name: 'Nick',
  age: 25,
}
```

Но для переиспользования почти всегда удобнее выносить описание в `type` или `interface`.

### interface

```ts
interface User {
  name: string
  age: number
}
```

### type

```ts
type User = {
  name: string
  age: number
}
```

На базовом уровне оба варианта часто решают одну и ту же задачу.

### В чем разница на практике

`interface` чаще используют:

- для формы объектов
- для классов и `implements`
- когда хотят возможность declaration merging

`type` чаще используют:

- для union типов
- для intersection типов
- для алиасов примитивов
- для кортежей
- для более сложных композиционных типов

### Что важно понимать

Неверно говорить, что `interface` "для объектов", а `type` "для всего остального", как будто между ними жесткая стена.

На практике:

- и `interface`, и `type` могут описывать объект
- `type` более универсален как алиас
- `interface` удобен там, где важна расширяемость и понятная объектная форма

### Extends и intersections

`interface` можно расширять через `extends`:

```ts
interface User {
  name: string
}

interface Admin extends User {
  role: 'admin'
}
```

`type` можно комбинировать через `&`:

```ts
type User = {
  name: string
}

type Admin = User & {
  role: 'admin'
}
```

### Declaration merging

У `interface` есть важная особенность: его можно объявить несколько раз, и TypeScript объединит поля.

```ts
interface Settings {
  theme: string
}

interface Settings {
  language: string
}

const settings: Settings = {
  theme: 'dark',
  language: 'ru',
}
```

С `type` так не получится.

### Что выбрать

Если нужна простая практическая рекомендация:

- для формы объектов можно выбирать `interface`
- для union, mapped и составных типов чаще удобнее `type`

Но в реальном проекте важнее не догма, а единообразный стиль команды.

### Кратко:

- `type` и `interface` во многом похожи, но не идентичны.
- `interface` удобен для объектных контрактов и расширения.
- `type` удобен для алиасов, union и intersection типов.

### Типичные ошибки

- Думать, что `interface` всегда лучше или что `type` всегда современнее.
- Не понимать, что `type` может описывать не только объекты.
- Смешивать оба подхода хаотично без общего стиля проекта.

---

## Union, intersection и narrowing

Одно из сильных мест TypeScript это работа с составными типами.

### Union types

Union означает: значение может быть одним из нескольких типов.

```ts
let id: string | number

id = 'user-1'
id = 100
```

Это очень полезно, когда данные реально могут приходить в нескольких вариантах.

### Intersection types

Intersection означает: значение должно удовлетворять сразу нескольким типам.

```ts
type WithId = {
  id: number
}

type WithName = {
  name: string
}

type User = WithId & WithName

const user: User = {
  id: 1,
  name: 'Nick',
}
```

### Narrowing

Если у нас union тип, TypeScript не всегда знает, какой именно вариант сейчас внутри переменной. Поэтому нужно сузить тип.

Пример:

```ts
function printId(id: string | number): void {
  if (typeof id === 'string') {
    console.log(id.toUpperCase())
    return
  }

  console.log(id.toFixed(0))
}
```

После `typeof id === 'string'` TypeScript понимает, что внутри этой ветки `id` уже точно строка.

### Проверка через in

```ts
type Admin = {
  name: string
  permissions: string[]
}

type Guest = {
  name: string
  expiresAt: Date
}

function printUserInfo(user: Admin | Guest): void {
  if ('permissions' in user) {
    console.log(user.permissions.join(', '))
    return
  }

  console.log(user.expiresAt.toISOString())
}
```

### Discriminated unions

Это очень удобный паттерн, когда у каждого варианта есть общее поле-дискриминатор.

```ts
type LoadingState = {
  status: 'loading'
}

type SuccessState = {
  status: 'success'
  data: string[]
}

type ErrorState = {
  status: 'error'
  error: string
}

type RequestState = LoadingState | SuccessState | ErrorState

function renderState(state: RequestState): string {
  switch (state.status) {
    case 'loading':
      return 'Loading...'
    case 'success':
      return `Loaded ${state.data.length} items`
    case 'error':
      return state.error
  }
}
```

Это очень частая и очень полезная модель для UI и API-состояний.

### Кратко:

- Union типы описывают альтернативы.
- Intersection типы объединяют требования нескольких типов.
- Narrowing помогает TypeScript понять, с каким вариантом мы реально работаем.

### Типичные ошибки

- Создавать union, а потом не делать проверки перед использованием значения.
- Пытаться обращаться к полям, которых нет у всех вариантов union-типа.
- Не использовать discriminated unions там, где они сильно упрощают код.

---

## any и unknown

Эти два типа часто путают, но ведут они себя очень по-разному.

### any

`any` по сути отключает проверку типов.

```ts
let value: any = 'hello'

value = 42
value.toUpperCase()
value.notExistingMethod()
```

TypeScript почти перестает тебя защищать.

Иногда `any` действительно встречается:

- при миграции старого проекта
- при быстром прототипировании
- когда тип временно неизвестен

Но в нормальном коде его стоит избегать.

### unknown

`unknown` тоже означает "мы пока не знаем тип", но он безопаснее.

```ts
function multiply(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * b
  }

  throw new Error('a and b must be numbers')
}
```

Здесь TypeScript заставляет сначала проверить значение, и только потом использовать его как конкретный тип.

### Простое правило

Если `any` это "делай что хочешь", то `unknown` это "сначала докажи, что ты знаешь, с чем работаешь".

### Кратко:

- `any` отключает большую часть пользы TypeScript.
- `unknown` безопаснее и требует проверки перед использованием.
- Если выбираешь между ними, почти всегда лучше `unknown`.

### Типичные ошибки

- Использовать `any` просто потому, что так быстрее.
- Слишком рано приводить `unknown` к конкретному типу без проверки.
- Засорять проект `any`, а потом удивляться, что TS почти не помогает.

---

## Type assertions и assertions functions

Иногда разработчик знает о значении больше, чем знает TypeScript. Тогда используют приведение типа.

```ts
const input = document.querySelector('input') as HTMLInputElement
```

Или так:

```ts
const input = document.querySelector('input') as HTMLInputElement | null
```

### Осторожно с assertions

`as` не проверяет значение в рантайме. Он просто говорит компилятору: "доверься мне".

Если ты ошибся, код все равно может упасть во время выполнения.

Поэтому assertion это не замена реальной проверке.

### Non-null assertion

Иногда можно встретить `!`:

```ts
const app = document.getElementById('app')!
```

Это значит: "я уверен, что здесь не `null` и не `undefined`".

Использовать это стоит аккуратно. Если уверенность ложная, будет runtime-ошибка.

### User-defined type guards

Можно писать свои функции-проверки:

```ts
type User = {
  id: number
  name: string
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  )
}
```

Потом:

```ts
function printUser(value: unknown): void {
  if (isUser(value)) {
    console.log(value.name)
  }
}
```

Это уже намного надежнее, чем слепо писать `as User`.

### Кратко:

- `as` это подсказка компилятору, а не runtime-проверка.
- `!` убирает `null` и `undefined` только на уровне типов.
- Для безопасной работы с неизвестными значениями полезны type guards.

### Типичные ошибки

- Использовать `as` как универсальный способ "заткнуть" TypeScript.
- Ставить `!` везде подряд вместо нормальной проверки.
- Путать приведение типа с реальной валидацией данных.

---

## Generics

Дженерики нужны для того, чтобы писать переиспользуемый код, который работает с разными типами, но при этом сохраняет информацию об этих типах.

### Базовый пример

```ts
function identity<T>(arg: T): T {
  return arg
}

const result1 = identity<string>('Hello')
const result2 = identity<number>(42)
```

Здесь `T` это параметр типа.

Смысл такой:

- функция принимает значение какого-то типа `T`
- и возвращает значение того же типа `T`

### Почему это лучше, чем any

Если бы здесь был `any`, мы бы потеряли информацию о типе.

```ts
function identityAny(arg: any): any {
  return arg
}
```

С generics TypeScript понимает связь между входом и выходом.

### Generics в интерфейсах

```ts
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => string
}
```

Теперь этот интерфейс можно использовать с разными типами:

```ts
const stringList: ListProps<string> = {
  items: ['a', 'b', 'c'],
  renderItem: (item) => item.toUpperCase(),
}
```

### Generics в классах

```ts
class Box<T> {
  constructor(public value: T) {}
}

const stringBox = new Box('Hello')
const numberBox = new Box(42)
```

### Несколько параметров типа

```ts
function pair<T, K>(first: T, second: K): [T, K] {
  return [first, second]
}

const result = pair('id', 10)
```

### Constraints через extends

Иногда generic должен подходить не под любой тип, а только под тот, который удовлетворяет условию.

```ts
function getLength<T extends { length: number }>(value: T): number {
  return value.length
}
```

Теперь передавать можно только то, у чего есть `length`.

### keyof и generics

Очень частый и полезный паттерн:

```ts
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key]
}

const user = {
  id: 1,
  name: 'Nick',
}

const name = getProperty(user, 'name')
```

Здесь `K` может быть только одним из ключей объекта `T`.

### Когда generics не нужны

Не нужно добавлять generic просто ради "умности". Если тип конкретный и не предполагает переиспользование, обычный тип лучше.

### Кратко:

- Generics позволяют писать гибкий и типобезопасный код.
- Они сохраняют связь между входными и выходными типами.
- Constraints помогают ограничить generic только нужными сценариями.

### Типичные ошибки

- Использовать `any` там, где нужен generic.
- Добавлять generics без реальной пользы.
- Забывать ограничивать generic, если код ожидает конкретные свойства.

---

## Enum и literal unions

`enum` это пользовательский тип с набором именованных значений.

```ts
enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  GUEST = 'GUEST',
}

const role: UserRole = UserRole.ADMIN
```

### Где enum удобен

- когда нужен набор именованных констант
- когда проект уже использует этот стиль
- когда важно читаемое и централизованное описание вариантов

### Но есть важный нюанс

Во многих современных TypeScript-проектах вместо `enum` часто используют union из строковых литералов:

```ts
type UserRole = 'ADMIN' | 'USER' | 'GUEST'
```

Почему так делают:

- проще интеграция с обычным JavaScript
- меньше неожиданностей при компиляции
- легче читать

То есть `enum` не "плохой", но это не всегда лучший выбор по умолчанию.

### const enum

В исходных заметках есть `const enum`, но с ним нужно быть осторожным.

Он может быть полезен для оптимизации, но иногда создает сложности в зависимости от сборки, транспиляции и инструментов проекта. Поэтому использовать его стоит только если команда понимает последствия.

### Кратко:

- `enum` описывает набор именованных значений.
- Во многих проектах строковые literal unions оказываются проще.
- `const enum` требует осторожности и понимания сборки.

### Типичные ошибки

- Использовать `enum` автоматически везде подряд.
- Не учитывать, как `enum` влияет на скомпилированный код.
- Выбирать `const enum`, не проверив ограничения проекта и сборщика.

---

## Utility Types

TypeScript содержит полезные встроенные utility types, которые помогают быстро преобразовывать уже существующие типы.

Это очень практичная часть языка.

### Partial

Делает все поля необязательными.

```ts
interface User {
  id: number
  name: string
  email: string
}

type UserPatch = Partial<User>
```

Теперь `UserPatch` можно использовать, например, для частичного обновления пользователя.

### Required

Делает все поля обязательными.

```ts
type FullUser = Required<User>
```

### Readonly

Делает свойства доступными только для чтения.

```ts
type ReadonlyUser = Readonly<User>
```

### Pick

Берет только выбранные поля.

```ts
type UserPreview = Pick<User, 'id' | 'name'>
```

### Omit

Исключает указанные поля.

```ts
type UserWithoutEmail = Omit<User, 'email'>
```

### Record

Позволяет описать объект, где набор ключей известен заранее, а значения имеют один и тот же тип.

```ts
type Theme = 'light' | 'dark'

const themeLabels: Record<Theme, string> = {
  light: 'Светлая',
  dark: 'Темная',
}
```

### ReturnType

Извлекает тип возвращаемого значения функции.

```ts
function createUser() {
  return {
    id: 1,
    name: 'Nick',
  }
}

type CreatedUser = ReturnType<typeof createUser>
```

### Exclude и Extract

```ts
type Role = 'admin' | 'user' | 'guest'

type PublicRole = Exclude<Role, 'admin'>
type PrivateRole = Extract<Role, 'admin' | 'user'>
```

### NonNullable

Убирает `null` и `undefined`.

```ts
type SafeValue = NonNullable<string | null | undefined>
```

### Когда utility types особенно полезны

Они хороши тогда, когда:

- не хочется дублировать существующий тип
- нужно быстро получить производный тип
- важно сохранить связь с базовым контрактом

### Кратко:

- Utility types позволяют строить новые типы из уже существующих.
- Это уменьшает дублирование и делает код гибче.
- `Partial`, `Pick`, `Omit`, `Record` и `ReturnType` особенно часто встречаются на практике.

### Типичные ошибки

- Писать новый тип вручную там, где хватает utility type.
- Чрезмерно усложнять типы вложенными utility constructions без необходимости.
- Терять читаемость ради "типовой магии".

---

## Классы в TypeScript

TypeScript поддерживает классы и добавляет к ним типизацию.

```ts
class User {
  name: string

  constructor(name: string) {
    this.name = name
  }

  getGreeting(): string {
    return `Hello, ${this.name}`
  }
}
```

### Поля должны быть объявлены

Если ты используешь `this.name`, свойство должно быть описано в классе заранее, если оно не объявлено прямо через параметр конструктора.

Это важная вещь, которая часто ломает код новичкам.

### Модификаторы доступа

#### public

Доступен везде. Это поведение по умолчанию.

#### private

Доступен только внутри самого класса.

#### protected

Доступен внутри класса и его наследников.

#### readonly

Поле можно прочитать, но нельзя изменить после инициализации.

Пример:

```ts
class Account {
  public name: string
  private password: string
  protected role: string
  readonly id: number

  constructor(id: number, name: string, password: string, role: string) {
    this.id = id
    this.name = name
    this.password = password
    this.role = role
  }
}
```

### Сокращенная запись в конструкторе

TypeScript позволяет объявлять и инициализировать поля прямо через параметры конструктора.

```ts
class UserProfile {
  constructor(
    public name: string,
    public age: number,
    private token: string
  ) {}
}
```

Это очень удобная и частая запись.

### Implements

Класс может реализовывать интерфейс.

```ts
interface HasPassword {
  getPassword(): string
}

class Admin implements HasPassword {
  constructor(private password: string) {}

  getPassword(): string {
    return this.password
  }
}
```

### Abstract classes

Иногда нужна база, от которой можно наследоваться, но нельзя создать экземпляр напрямую.

```ts
abstract class Animal {
  abstract makeSound(): string

  move(): string {
    return 'Moving...'
  }
}

class Dog extends Animal {
  makeSound(): string {
    return 'Woof'
  }
}
```

### Кратко:

- TypeScript добавляет к классам типизацию и модификаторы доступа.
- Поля нужно объявлять явно или через параметры конструктора.
- `implements` и `abstract` помогают строить более строгие объектные контракты.

### Типичные ошибки

- Использовать `this.someField`, не объявив поле.
- Путать `private` и `protected`.
- Применять классы там, где достаточно простых объектов и функций.

---

## Indexed access, keyof и typeof

Это очень практичные инструменты, которые помогают строить типы из уже существующих значений и структур.

### keyof

`keyof` получает union из ключей объекта.

```ts
interface User {
  id: number
  name: string
  email: string
}

type UserKey = keyof User
// 'id' | 'name' | 'email'
```

### typeof

`typeof` в типах позволяет получить тип на основе уже существующего значения.

```ts
const settings = {
  theme: 'dark',
  language: 'ru',
}

type Settings = typeof settings
```

### Indexed access types

Можно вытащить тип конкретного свойства:

```ts
type UserName = User['name']
```

А можно вытащить тип элемента массива:

```ts
type Users = User[]
type SingleUser = Users[number]
```

### Почему это важно

Такие конструкции позволяют меньше дублировать типы и сильнее связывать их с реальным кодом.

### Кратко:

- `keyof` получает ключи типа.
- `typeof` позволяет строить тип на основе значения.
- Indexed access types вытаскивают подтипы по ключу или индексу.

### Типичные ошибки

- Дублировать тип вручную там, где можно взять его через `typeof`.
- Не использовать `keyof` в generic-функциях для безопасной работы с ключами.
- Путать `typeof` в runtime-JavaScript и `typeof` в type positions.

---

## Conditional types, infer и template literal types

Это уже более продвинутый слой TypeScript, но он очень мощный.

### Conditional types

Они работают по принципу "если тип соответствует условию, вернуть один тип, иначе другой".

```ts
type IsNumber<T> = T extends number ? 'yes' : 'no'

type A = IsNumber<number> // 'yes'
type B = IsNumber<string> // 'no'
```

### infer

`infer` используют внутри conditional types, чтобы извлечь часть типа.

Пример: достаем тип элемента массива.

```ts
type ArrayItem<T> = T extends (infer U)[] ? U : never

type StringItem = ArrayItem<string[]>
// string
```

Еще пример: достаем тип результата функции.

```ts
type MyReturnType<T> = T extends (...args: any[]) => infer R ? R : never

type Result = MyReturnType<() => number>
// number
```

### Template literal types

Они позволяют собирать типы строк из частей.

```ts
type Brand = 'bmw' | 'audi'
type Price = '$10000' | '$20000'

type CarLabel = `${Brand} ${Price}`
```

Теперь `CarLabel` это union из конкретных комбинаций строк.

### Где это реально полезно

- в типизированных ключах
- в naming conventions
- в API helper types
- в библиотеках
- в продвинутом построении контрактов

Но здесь есть важное правило: если тип становится слишком умным и его уже трудно читать, лучше упростить.

### Кратко:

- Conditional types позволяют строить типы по условию.
- `infer` помогает извлекать части других типов.
- Template literal types работают с составными строковыми типами.

### Типичные ошибки

- Усложнять типовую систему сильнее, чем это окупается.
- Использовать `infer` и conditional types просто ради "красоты".
- Писать настолько сложные типы, что их уже не понимает команда.

---

## Декораторы

Декораторы это продвинутая и отдельная тема.

Исторически в TypeScript долго существовали экспериментальные декораторы, которые включались через `experimentalDecorators`. Сейчас вокруг декораторов важно быть особенно внимательным, потому что есть различия между старым experimental-подходом и более современным стандартным направлением JavaScript.

Поэтому практическая рекомендация такая:

- использовать декораторы только если проект уже на них опирается
- перед использованием смотреть настройки `tsconfig` и стек проекта
- не считать декораторы "обязательной частью" повседневного TypeScript

Пример старого decorator-style кода:

```ts
function sealed(constructor: Function): void {
  Object.seal(constructor)
  Object.seal(constructor.prototype)
}

@sealed
class ExampleClass {}
```

### Почему здесь нужна осторожность

Декораторы это не базовый ежедневный инструмент вроде `interface`, `type` или generics. Это скорее отдельная продвинутая тема, которая зависит от версии TypeScript, стандартов JavaScript и инфраструктуры проекта.

### Кратко:

- Декораторы существуют, но это продвинутая и чувствительная к конфигурации тема.
- В обычном приложении без них можно спокойно жить.
- Использовать их стоит осознанно, а не "потому что выглядит мощно".

### Типичные ошибки

- Подключать декораторы без понимания конфигурации проекта.
- Смешивать legacy decorators и современные подходы без проверки совместимости.
- Учить декораторы раньше, чем базовые темы TypeScript.

---

## Типизация React с TypeScript

В исходных заметках много внимания React, поэтому этот блок тоже важен.

Смысл здесь очень простой: TypeScript помогает явно описывать:

- props
- state
- события
- refs
- hooks

### Типизация props

Обычно props описывают через `interface` или `type`.

```tsx
interface CardProps {
  width?: string
  height?: string
  children?: React.ReactNode
}

export function Card({ width, height, children }: CardProps) {
  return <div style={{ width, height }}>{children}</div>
}
```

### Почему ReactNode лучше, чем ReactChild

Для `children` чаще всего используют `React.ReactNode`, потому что он покрывает больше реальных вариантов:

- строку
- число
- элемент
- массив элементов
- `null`
- `undefined`

### Enum или literal union для вариантов компонента

Вместо enum часто достаточно literal union:

```tsx
type CardVariant = 'outlined' | 'primary'

interface CardProps {
  variant: CardVariant
}
```

Но если проект уже использует `enum`, это тоже допустимо.

### Нужно ли использовать React.FC

Раньше `React.FC` использовали очень часто. Сейчас это уже не обязательный и не всегда лучший путь.

Современный практический стиль обычно такой:

- просто типизировать props
- не использовать `React.FC` без причины

Пример:

```tsx
interface TodoItemProps {
  title: string
}

export function TodoItem({ title }: TodoItemProps) {
  return <li>{title}</li>
}
```

Это читается проще и обычно вполне достаточно.

### Generics в компонентах

Иногда компонент должен работать с разными типами данных.

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

export function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map(renderItem)}</>
}
```

Использование:

```tsx
<List
  items={['a', 'b', 'c']}
  renderItem={(item) => <div key={item}>{item}</div>}
/>
```

### Типизация useState

Во многих случаях `useState` сам выводит тип:

```tsx
const [count, setCount] = useState(0)
```

Но если начальное значение не дает нужной информации, тип лучше указать явно.

```tsx
interface User {
  id: number
  name: string
}

const [users, setUsers] = useState<User[]>([])
const [selectedUser, setSelectedUser] = useState<User | null>(null)
```

### Типизация событий

```tsx
function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
  console.log(event.currentTarget.textContent)
}

function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
  console.log(event.target.value)
}

function handleDrag(event: React.DragEvent<HTMLDivElement>) {
  console.log('moving')
}
```

### Типизация useRef

```tsx
const inputRef = useRef<HTMLInputElement | null>(null)

function focusInput() {
  inputRef.current?.focus()
}
```

### Когда TS особенно полезен в React

- в формах
- в reusable-компонентах
- в таблицах и списках
- в hooks
- в API-данных
- в сложных props-контрактах

### Кратко:

- В React с TypeScript чаще всего типизируют props, state, refs и события.
- Для `children` обычно используют `React.ReactNode`.
- `React.FC` не обязателен и часто не нужен.

### Типичные ошибки

- Использовать `React.FC` по привычке, не понимая, зачем он нужен.
- Описывать `children` слишком узким типом.
- Не указывать generic для `useState`, когда начальное значение неинформативно.

---

## Практические рекомендации по стилю TypeScript

### 1. Не воюй с языком

Если TypeScript на что-то жалуется, не нужно первым делом ставить `as any`.

Сначала лучше понять:

- правда ли тип описан неверно
- не слишком ли широкий контракт
- не забыта ли проверка значения

### 2. Не делай типы слишком умными

Иногда можно построить очень мощную типовую систему, но если ее не понимает команда, цена слишком высока.

Типы должны помогать читать и поддерживать код, а не превращать файл в математическую задачу.

### 3. Используй unknown для внешних данных

Если данные пришли снаружи:

- API
- `localStorage`
- сторонняя библиотека

Лучше сначала считать их `unknown`, а потом проверять.

### 4. Не дублируй типы руками

Если тип можно получить через:

- `typeof`
- `keyof`
- `ReturnType`
- utility types

лучше переиспользовать существующую информацию, чем копировать контракт вручную.

### 5. Думай о модели данных

Сильный TypeScript начинается не с редких фич языка, а с хорошей модели данных:

- понятные имена
- правильные связи
- точные поля
- хорошие discriminated unions

### Кратко:

- TypeScript должен делать код понятнее, а не тяжелее.
- Безопасность важнее, чем быстрые "затычки" через `any`.
- Хорошая модель данных часто полезнее, чем самые продвинутые типовые трюки.

### Типичные ошибки

- Сразу подавлять ошибки через `as any`.
- Усложнять типы ради демонстрации "экспертности".
- Игнорировать архитектуру данных и пытаться лечить все одной типизацией.

---

## Частые подводные камни

### TypeScript не валидирует данные с сервера сам по себе

Если сервер прислал неверную структуру, типы не спасут автоматически. Для этого нужны проверки в рантайме.

### Широкие типы делают код слабее

Если вместо:

```ts
type Status = 'loading' | 'success' | 'error'
```

написать:

```ts
let status: string
```

мы теряем часть пользы от TypeScript.

### Слишком много assertions опасны

Каждый `as Something` это по сути место, где ты говоришь компилятору "не мешай". Иногда это оправдано, но если таких мест много, значит модель типов построена плохо.

### Типы не заменяют нормальные названия и структуру кода

Можно сделать очень сложный тип, но если доменная модель хаотичная, проект понятнее не станет.

### Кратко:

- TypeScript не заменяет runtime-валидацию.
- Слишком широкие типы ослабляют защиту.
- Чрезмерные assertions почти всегда сигнализируют о проблеме в модели типов.

### Типичные ошибки

- Полагаться только на компилятор для внешних данных.
- Писать `string`, `object` и `any` там, где можно описать точнее.
- Исправлять симптомы assertions, а не причину проблемы.

---

## Итог

TypeScript это не просто "JavaScript с типами". Это инструмент, который помогает описывать данные, строить понятные контракты и делать код более устойчивым к изменениям.

Если смотреть на практику, то самые полезные темы TypeScript это не самые экзотические. В реальной работе особенно часто нужны:

1. базовые типы
2. функции и return types
3. `type` и `interface`
4. union types и narrowing
5. generics
6. utility types
7. типизация React и API-данных

Продвинутые вещи вроде `infer`, template literal types и decorators тоже полезны, но обычно они идут уже после уверенной базы.

Если запомнить одну мысль, то она такая:

**Хороший TypeScript не тот, где больше всего сложных типов, а тот, где типы делают код понятнее и безопаснее.**

### Кратко:

- TypeScript помогает строить более надежный и понятный код.
- Основа силы TypeScript это хорошие контракты и точные модели данных.
- Продвинутые типы полезны, но только когда они реально упрощают проект.

---

## Что изучать дальше

После этого конспекта полезно отдельно углубиться в:

- `tsconfig` и строгий режим `strict`
- mapped types
- discriminated unions
- `satisfies`
- module augmentation
- runtime-схемы и валидацию данных
- типизацию API-клиентов
- типизацию кастомных React hooks

---

## Официальные источники

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [TypeScript Handbook: Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html)
- [TypeScript Handbook: More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html)
- [TypeScript Handbook: Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html)
- [TypeScript Handbook: Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html)
- [TypeScript Handbook: Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Handbook: Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [TypeScript Handbook: Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
- [TypeScript Handbook: Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript Handbook: Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html)
- [TypeScript Handbook: Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)
