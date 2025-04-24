/* 

* TypeScript
Это язык программирования для статической типизации данных, является надмножеством JS. Это позволяет данному языку отлавливать ошибки и баги во время компиляции, ещё до запуска приложения.

Для описания глобальных типизаций лучше создавать отдельный файл - "types".

Если необходимо указать что функция не должна ничего возвращать, то её типом, после скобок для аргументов указывается "void".

Если функция возвращает ошибку или не заканчивает свое выполнение или же функция должна работать постоянно то для неё указывается тип "never". Пример:

function throwError(message: string): never {
  throw new Error(message);
}

function infiniteLoop(): never {
  while (true) {
    Бесконечный цикл
  }
}

В TS существуют 2 основных способа объявления типизации: type и interface.

interface - Используется для создания именованных структур данных. Он чаще всего используется для определения формы объектов, классов и интерфейсов.
type - Используется для определения пользовательских типов данных и алиасов типов. Он более общий и может использоваться для создания алиасов для любых типов данных, включая примитивы, объекты, объединенные или пересекающиеся типы и так далее.

Отличия: 

interface: Можно объединять интерфейсы с помощью оператора extends. Это позволяет создавать дополнительные интерфейсы на основе существующих.
type: Можно создавать новый тип, объединяя существующие с помощью операторов & (пересечение) и | (объединение), но не с помощью extends.
В последних обновления можно расширять интерфейс от класса если это не union тип (union тип - интерфейс который был создан из двух других или более). 

interface: Не поддерживает операторы & и | для объединения или пересечения типов.
type: Поддерживает операторы & и |, что делает его более гибким при определении составных типов данных.

interface: Используется для определения структуры класса и интерфейсов, которые класс должен реализовать.
type: Не может быть использован для определения структуры класса или требования реализации интерфейсов.

interface MyInterface {
  method(): void;
}

class MyClass implements MyInterface {
  method() {
    // Реализация
  }
}

interface: Не поддерживает объявление пересекающих интерфейсов.
type: Можно объявлять пересекающие типы (intersection types) с помощью оператора &, что позволяет комбинировать несколько типов в один.

С помощью "type" можно создавать свои кастомные определения. Пример:

type Name = string; Данная запись будет говорить о том что значение Name будет является типом строка и при установке соответствий будет задавать соответствующие ограничение.

Объекты так же можно типизировать. Пример:

let new: {name: string, age: number} = {
  name: "Nick",
  age: 20
}

Дженерики - механизм, который позволяет писать код, который будет работать с разными типами данных, сохраняя при этом информацию о типах во время компиляции. Дженерики обеспечивают повышение переиспользуемости кода и безопасности типов, позволяя писать более универсальные и безопасные функции и классы.
Пример:

function identity<T>(arg: T): T {
  return arg;
}

В этом примере, функция identity использует дженерик <T>, чтобы позволить передавать аргументы разных типов, но при этом возвращать значение того же типа, что и аргумент.

Типизация Props

Для того что бы задавать типизацию пропсов в компонент react, нужно создать объект "interface" в который будем передавать типы данных. Пример:

interface CardProps {
  width?: string; //знак вопроса после параметр говорит что этот пропс не обязательный.
  height?: string;
  children?: React.ReactChild | React.ReactNode
}

Если нужно что бы указанные пропсы были назначены одним из приведенных вариантов то мы можем задать варианты для данного пропса и передать его в интерфейс. Пример:

export enum CardVariant {
  outline = "outlined",
  primary = "primary",
}

interface CardProps {
  variant: CardVariant;
}

Если в интерфейсе могут быть данные любого типа, это принято указывать в дженерик буквой Т. T - это обобщенный тип, который представляет параметр типа, используемый при создании обобщенных функций или классов. Он позволяет создавать универсальные компоненты, которые могут работать с разными типами данных.

Пример с функцией:
function identity<T>(arg: T): T {
  return arg;
}

Вызов функции с разными типами
let result1 = identity<string>("Hello");
let result2 = identity<number>(42);


interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

Пример с классом:
class Box<T> {
  value: T;
  constructor(value: T) {
    this.value = value;
  }
}

Использование класса с разными типами
let box1 = new Box<string>("Hello");
let box2 = new Box<number>(42);

Если есть несколько данных разного типа, то к букве Т добавляется К. Так же, если есть необходимость что бы К был определенного типа, то это можно указать через extends. K означало бы, что функция может принимать два разных типа данных и возвращать один из них. В данном случае, параметр K представлял бы второй тип данных, который может быть возвращен функцией.
Пример:

class User <T, K extends number>

function identity<T, K>(arg: T, defaultValue: K): T | K {
  if (arg !== null && arg !== undefined) {
    return arg;
  } else {
    return defaultValue;
  }
}

const result1: string | number = identity("Hello", 42); // Возвращает строку
const result2: string | number = identity(null, 42);   // Возвращает 42

Типизация Компонентов
Компоненты типизируются с помощью двоеточия, после объявления компонента ставится двоеточие после имени компонента, указываем в какому типу относится наш компонент. Например, если наш компонент является функциональным то он помечается как React.FunctionalComponen или FC сокращенно. Пример:

const UserPage: FC = () => {
}

Если компонент принимает в себя типизированные аргументы (записанные в интерфейсе) то мы указываем это через "дженерики".

Пример:

interface TodoItemProps {
	todo:ITodo
}

const TodoItem: FC<TodoItemProps> = ({todo}) => {
} 

Пример обобщенной функции:

function firstElement<T>(arr: T[]): T {
  return arr[0];
}

let firstString = firstElement(["apple", "banana", "cherry"]); firstString имеет тип string

Пример обобщенного класса:

typescript
Copy code
class Pair<T, U> {
  constructor(public first: T, public second: U) {}
}

let pair = new Pair(1, "one"); pair имеет тип Pair<number, string>

interface может быть расширен и наследован другими интерфейсами, так же может быть как пример для классов, в таком случае интерфейс будет говорить о том какие поля непременно должны содержатся в классе. Пример:

interface User {
	name: string,
	age: number,
}

interface Pass {
	getPass(): string,
}

class NewClass implements User, Pass {
	name: string = "Nick"
	age: number = 20
}

getPass(){
	return `${this.name}${this.age}`
}

Типизация Хуков

Хуки в react так же можно типизировать. Для этого после имени хука в дженерик указываем какого типа данные мы ожидаем в нем увидеть и тип предаваемых данных. Пример:

const [users, setUsers] = useState<IUser[]>([]);

В данном примере мы ожидаем получить массив с определенными полями данных типизированными в описанном интерфейсе.

Типизация Событий

События так же можно типизировать. Делается это похожим образом с типизацией компонента, после двоеточия указываем тип события, а так же в дженерик указываем какой тип данных ожидается увидеть для работы. Пример:

const clickHandler = (e: React.MouseEvent<HTMLButtonElement>) => {
  console.log(inputRef.current?.value);
};

const dragHandler = (e: React.DragEvent<HTMLDivElement>) => {
  console.log("moving");
};

Другое

Тип "any" говорит о том что данные могут быть любого типа. Использование данного типа крайне не рекомендуется так как они несут в себе проблемы безопасности, из за того что валидация типов полностью избегается, однако, данный тип может быт полезен в случаях, когда  работа с кодом, который не имеет достаточной информации о типах, или когда нужно быстро написать прототип или временное решение. 

Тип "unknown" - это тип данных, который аналогичен any, но предоставляет большую безопасность типов. Переменные типа unknown могут хранить значения любого типа, но перед использованием их необходимо явно проверить или привести к нужному типу.
Пример:

function multiply(a: unknown, b: unknown): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a * b; // Безопасное умножение
  } else {
    throw new Error('a and b must be numbers');
  }
}

При работе с классами в попытке присвоить в конструкторе новое поле через this, его нужно объявить перед функцией конструктор, иначе это вызовет ошибку. Пример:

class User {
	name: string;

  constructor(name:string) {
    this.name = name
  }
}

В классах так же можно определять модификаторы типа :

public - значение по умолчанию, говорит о том что мы имеем полный доступ элементу
private - элемент с таким модификатором не может быть доступен вне класса, ни  наследники, ни объекты созданные с помощью данного класса не будут иметь доступ к методам и значениям
protected - доступ только для наследников класса
readonly - элемент доступный только для чтения

Пример:

class User {
	public name: string;
  constructor(name:string) {
  }

	private someMethod(){}
}

C помощью модификаторов так же можно будет использовать сокращенную запись для конструктора, без использования this. Пример:

class User {
  constructor(
    public name: string,
    public age: number,
  ) {}
}

В TS можно ограничить редактирование массивов с помощью определенных манипуляций, например:

const number:ReadonlyArray<number> = [1,2,3,4,5,6] // В данном примере мы имеем доступ к массиву но только для чтения, любые попытки его редактировать вызовут ошибки.

Функциональные перегрузки. Это возможность TypeScript предоставлять разные сигнатуры функции, в зависимости от передаваемых параметров, и предоставлять разные варианты типов возвращаемых значений. Функциональные перегрузки используются для точного определения типов параметров и возвращаемых значений в случае, когда функция имеет разные поведения в зависимости от аргументов.
Пример:

function greet(name: string): string;
function greet(name: string, age: number): string;

function greet(name: string, age?: number): string {
  if (age !== undefined) {
    return `Hello, ${name}! You are ${age} years old.`;
  } else {
    return `Hello, ${name}!`;
  }
}

const result1 = greet("Alice");          // Работает с одним аргументом
const result2 = greet("Bob", 30);        // Работает с двумя аргументами

Enum - это пользовательский тип данных, который представляет собой набор именованных констант (членов перечисления).
Пример: 

enum EnumRoles {
	ADMIN, GUEST, USER
}

interface IUser {
	role: EnumRoles
}

const user: IUser = {
	role: ADMIN
}

Так же у enum имеет похожего брата "const enum", отличие в том что обычный enum создает объект во время выполнения кода в то время как const enum непосредственно вставляет объект в код, тем самым обеспечивая лучшую производительность.

При использовании enum мы можем так же работать с "реверс мапингом". Он в данном случае позволяет найти символическое имя члена перечисления на основе его численного значения, что может быть полезно в различных сценариях, включая работу с данными, которые используют численные коды, а не символические имена.
Пример:

enum Day {
  Sunday,    // 0
  Monday,    // 1
  Tuesday,   // 2
  Wednesday, // 3
  Thursday,  // 4
  Friday,    // 5
  Saturday   // 6
}

const dayValue = 3; // Это численное значение соответствует Day.Wednesday

const dayName = Day[dayValue]; // Получаем имя члена перечисления

console.log(dayName); // Вывод: "Wednesday"

Утверждения. Используются когда необходимо явно указать что за элемент используется в работе. Пример:

const inputElement = document.querySelector("input")
const val1 = (inputElement as HTMLInputElement).value
const val2 = (<HTMLInputElement>inputElement).value

Так же существует утверждение "не null | undefined". Необходимо когда надо указать что значение будет не тем ни другим с помощью знака "!". Пример: 

const getLength = (text: string | null):number => {
	return text!.length
}

Утилиты типов. Это специальные инструменты которые позволяют работать с существующими типами а именно дают возможности такие как преобразование, объединение, фильтрация и другие манипуляции с типами. Делается это путем расширения от типа с указанием нужной утилиты. Пример: 

interface ICar {
	id: number
	name: string
	price: number 
	buildY: number
}

interface iCarCreate extends Omit<ICar, "id">{} - делает все поля кроме id обязательными 
interface iCarId extends Pick<ICar, "id">{} - Берет в новый интерфейс только поле id 
interface iOptionalCar extends Partial<ICar>{} - делает все поля не обязательными 
interface iRequiredCar extends Required<ICar>{} - делает все поля обязательными 
interface iReadOnly extends Readonly<ICar>{} - делает все поля доступными только для чтения 

type TCarPrice = "price"
type TCarRecord = Record<TCarPrice, string | number> - делает указанные поля универсальными, т.е могут быть как строкой так и числом 

type TGetName = () => string
type Return = ReturnType<TGetName> - извлекает тип возвращаемого значения функции

type Any = Extract<"max" | "andrey", "adnrey" | "misha"> - создает тип, который извлекает из типа T только типы, которые можно найти в типе U, в данном случае вернут andrey
type Any = Exclude<"max" | "andrey", "adnrey" | "misha"> - Создает тип, который исключает из типа T все типы, которые можно найти в типе U, т.е вернут только max

type NotNull = NotNullable<string | number | null | undefined> - возвращает все, кроме null и undefined 

Декораторы - это экспериментальная в TypeScript. Они представляют собой специальные функции, которые могут быть применены к классам, методам, свойствам и параметрам, чтобы расширить или изменить их поведение. Пример:

	Простой декоратор класса
function classDecorator(constructor: Function) {
	console.log("Class decorator called.");
}

@classDecorator
class ExampleClass {
	// ...
}

	Декоратор метода
function methodDecorator(target: any, key: string, descriptor: PropertyDescriptor) {
	console.log("Method decorator called.");
}

class ExampleClass {
	@methodDecorator
	someMethod() {
		// ...
	}
}

Создание типов на основании условий. 

type TIsNumber<T> = T extends number ? "yes" : "no"
type Type1 = TIsNumber<number>
type Type1 = TIsNumber<string>

type TBrand = "bmw" | "mercedes" | "opel"
type TPrice = "$100000" | "$400000" | "$20000"

type TCar = `${TBrand} ${TPrice}`

Infer. "infer" - это ключевое слово, которое используется в контексте условных типов (conditional types). Оно позволяет извлекать и назначать типы из других типов на основе условий. Это мощный механизм, который позволяет создавать более гибкие и обобщенные типы в вашем коде. Пример: 

	Извлечение ключей объекта:

type T2Data = keyof typeof data

	Извлечение типов значений полей объекта:

type TObjectInfer<T> = T extends { [key: string]: infer U } ? U : never;

const data = {
  x: 1,
  y: "2",
  z: function () {},
};

type TData = TObjectInfer<typeof data>;
const d: TData = function () {}; // ошибка

Тае же можно добиться подобного функционала такой записью:

type TTest = typeof data[keyof typeof data] 

	Извлечение типа элементов массива:

type ArrayElementType<T> = T extends (infer U)[] ? U : never;

const arr = [1, 2, 3, 4];
type ElementType = ArrayElementType<typeof arr>; // ElementType будет иметь тип number

	Извлечение типа Promise:

type PromiseReturnType<T> = T extends Promise<infer U> ? U : never;

async function fetchData() {
  return fetch('https://example.com/data').then((response) => response.json());
}

const result = fetchData();
type Data = PromiseReturnType<typeof result>;

	Получение типа аргумента функции обратного вызова:

type CallbackArgumentType<T> = T extends (callback: (arg: infer U) => void) => void ? U : never;

function handleData(callback: (data: { name: string }) => void) {
  const data = { name: 'John' };
  callback(data);
}

const callbackType: CallbackArgumentType<typeof handleData> = { name: 'Alice' };

Абстрактный класс. Абстрактные классы предоставляют средство для создания базовой структуры, которая может быть использована другими классами, при этом они сами не могут быть инстанциированы. Они могут содержать как абстрактные методы, которые должны быть реализованы в подклассах, так и конкретные методы с реализацией. Вот более подробное объяснение и примеры. Пример:

abstract class Shape {
  abstract calculateArea(): number; // Абстрактный метод

  display(): void {
    console.log("Displaying shape");
  }
}

Пример использования: 

class Circle extends Shape {
  radius: number;

  constructor(radius: number) {
    super();
    this.radius = radius;
  }

  calculateArea(): number {
    return Math.PI * this.radius * this.radius;
  }
}

const circle = new Circle(5);
circle.display(); // Вызов конкретного метода
console.log("Circle Area:", circle.calculateArea()); // Реализация абстрактного метода

Когда использовать абстрактные классы:

Создание общей структуры: Если у вас есть несколько классов, которые должны иметь общую структуру, но различаются в реализации, то абстрактные классы могут помочь создать эту общую структуру.

Гарантированная реализация методов: Абстрактные классы гарантируют, что все подклассы реализуют определенные методы, что может быть полезно для соблюдения интерфейсов.

Предотвращение инстанциирования: Если вы хотите, чтобы класс был использован только в качестве базового класса, а не напрямую инстанциирован, вы можете сделать его абстрактным. 

*/
