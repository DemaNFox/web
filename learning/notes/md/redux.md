# Redux и Redux Toolkit

## Что такое Redux

Redux это библиотека для управления состоянием приложения.

Если говорить просто, Redux нужен тогда, когда состояние становится настолько общим и связанным между разными частями приложения, что передавать его через `props` уже неудобно.

Обычная ситуация без Redux выглядит так:

- данные живут высоко в дереве компонентов
- потом эти данные приходится протаскивать вниз через много уровней
- разные части интерфейса хотят читать и менять одни и те же данные
- логика обновления состояния начинает расползаться по приложению

Redux решает эту проблему за счет одного общего хранилища и предсказуемых правил обновления.

Главная идея Redux очень простая:

1. есть общее состояние приложения
2. напрямую его не меняют
3. приложение отправляет описание того, что произошло
4. специальная функция решает, каким должно стать новое состояние

Это делает поведение приложения более понятным. Когда в проекте появляется ошибка, проще ответить на вопросы:

- что произошло
- кто это инициировал
- как изменился `state`

Сейчас важно сразу отметить одну вещь: сегодня Redux почти всегда используют не в "классическом" виде, а через **Redux Toolkit**. Это официальный и рекомендуемый способ работы с Redux.

Классический Redux все еще полезно понимать, потому что он объясняет базовую механику. Но в реальных проектах чаще стартуют с Redux Toolkit.

### Когда Redux действительно нужен

Redux полезен не для каждого приложения.

Обычно он нужен, если:

- состояние используется во многих несвязанных компонентах
- есть сложная логика обновления данных
- много асинхронных запросов
- нужно кэшировать серверные данные
- важно иметь предсказуемую архитектуру
- проект растет, и локального `useState` уже не хватает

Если приложение маленькое, а состояние локальное и простое, Redux может оказаться лишним.

Например:

- открыть и закрыть модалку
- переключить вкладку
- хранить значение одного `input`

Такие вещи часто удобнее держать локально в компоненте.

### Чем Redux отличается от Context

`Context` и Redux часто путают, но это разные инструменты.

`Context` решает в первую очередь проблему передачи данных через дерево компонентов.

Redux решает задачу управления состоянием:

- как его обновлять
- где хранить логику
- как обрабатывать асинхронность
- как отслеживать изменения
- как подключать middleware и DevTools

То есть `Context` отвечает на вопрос "как передать данные вниз", а Redux отвечает на вопрос "как организовать сложное состояние приложения".

### Кратко:

- Redux это библиотека для предсказуемого управления состоянием.
- Он особенно полезен в средних и больших приложениях.
- Сегодня основной способ работы с Redux это Redux Toolkit.
- Не каждое состояние нужно класть в Redux.

### Типичные ошибки

- Тянуть Redux в маленькое приложение, где достаточно `useState` и `props`.
- Класть в Redux все подряд, включая локальные UI-мелочи.
- Считать, что Redux нужен только потому, что проект написан на React.

---

## Базовые понятия Redux

Чтобы понимать Redux, нужно хорошо держать в голове пять слов:

- `store`
- `state`
- `action`
- `dispatch`
- `reducer`

Разберем их по очереди.

### Store

`store` это объект-хранилище, внутри которого лежит состояние приложения.

У него есть несколько основных задач:

- хранить текущее состояние
- отдавать это состояние через `getState()`
- принимать действия через `dispatch()`
- уведомлять подписчиков об изменении состояния

Важно: `store` это не сам `state`, а контейнер, который этим состоянием управляет.

### State

`state` это обычный JavaScript-объект с данными приложения.

Например:

```js
const state = {
  user: {
    id: 1,
    name: 'Nick',
  },
  cart: {
    items: [],
    totalPrice: 0,
  },
}
```

Redux не диктует, как именно должен выглядеть `state`, но есть хорошая практика:

- хранить данные понятно и плоско
- не дублировать одно и то же
- не складывать в `state` то, что можно вычислить

### Action

`action` это обычный объект, который описывает событие в приложении.

Обычно он выглядит так:

```js
{
  type: 'cart/itemAdded',
  payload: {
    id: 10,
    title: 'Book',
    price: 500,
  },
}
```

У `action` обязательно должен быть `type`.

`payload` не обязателен. Он нужен, если вместе с событием надо передать данные.

Примеры:

```js
dispatch({ type: 'counter/increment' })

dispatch({
  type: 'user/nameChanged',
  payload: 'Alice',
})
```

### Dispatch

`dispatch` это функция, через которую действие отправляется в Redux.

```js
store.dispatch({ type: 'counter/increment' })
```

Если говорить образно, `dispatch` это "отправка сообщения" в систему:

- что-то произошло
- вот описание этого события
- теперь обновите состояние по правилам

### Reducer

`reducer` это функция, которая получает:

- предыдущее состояние
- `action`

И возвращает новое состояние.

```js
function counterReducer(state = { value: 0 }, action) {
  switch (action.type) {
    case 'counter/increment':
      return { ...state, value: state.value + 1 }
    case 'counter/decrement':
      return { ...state, value: state.value - 1 }
    default:
      return state
  }
}
```

Здесь важно понять главную мысль: `reducer` не должен менять старый объект состояния напрямую. Он должен вернуть новое значение.

### Поток данных в Redux

Весь Redux держится на однонаправленном потоке данных:

1. пользователь делает действие в интерфейсе
2. компонент вызывает `dispatch(action)`
3. `store` передает `action` в `reducer`
4. `reducer` возвращает новый `state`
5. React получает обновленные данные и перерисовывает интерфейс

Этот поток делает поведение приложения предсказуемым.

### Мини-ассоциация для запоминания

Можно запомнить так:

- `state` это данные
- `action` это описание события
- `dispatch` это отправка события
- `reducer` это правило обновления
- `store` это место, где все это живет

### Кратко:

- `store` хранит состояние и умеет принимать действия.
- `action` описывает, что произошло.
- `dispatch` отправляет действие.
- `reducer` решает, каким будет новое состояние.
- Данные в Redux текут в одном направлении.

### Типичные ошибки

- Думать, что `store` и `state` это одно и то же.
- Считать, что у любого `action` обязательно есть `payload`.
- Пытаться менять `state` напрямую внутри обычного Redux reducer.
- Хранить в `state` вычисляемые значения, которые лучше получать через селекторы.

---

## Три ключевых принципа Redux

У Redux есть три классических принципа.

### 1. Один источник истины

Состояние приложения хранится в одном общем дереве состояния.

Это не значит, что весь мир обязан лежать в одном огромном объекте без структуры. Это значит, что у приложения есть один центр, из которого берутся общие данные.

### 2. State доступен только для чтения

Нельзя просто взять и поменять `state` напрямую.

Чтобы изменить данные, нужно отправить `action`.

Это полезно, потому что изменение состояния становится явным. Оно не происходит "магически" где-то в глубине кода.

### 3. Изменения описываются чистыми функциями

Новое состояние вычисляется с помощью `reducer`.

Reducer должен быть предсказуемым:

- получил одни и те же аргументы
- вернул один и тот же результат

Внутри reducer нельзя:

- делать HTTP-запросы
- запускать таймеры
- обращаться к `Math.random()` ради логики состояния
- мутировать существующий `state`

Reducer это не место для побочных эффектов.

### Почему это важно

Именно эти ограничения делают Redux удобным для:

- отладки
- тестирования
- логирования действий
- DevTools
- понимания, как приложение пришло к текущему состоянию

### Кратко:

- В Redux есть единый источник общего состояния.
- Изменения происходят только через `action`.
- Обновление состояния описывают чистые функции `reducer`.

### Типичные ошибки

- Выполнять асинхронный код прямо внутри reducer.
- Вызывать `Date.now()` или `Math.random()` внутри reducer без явной необходимости.
- Смешивать логику обновления состояния и побочные эффекты в одном месте.

---

## Иммутабельность и почему она важна

Одна из самых важных тем в Redux это **иммутабельность**.

Простыми словами: старый объект состояния нельзя менять напрямую. Вместо этого нужно создать новое состояние на основе старого.

Почему это важно:

- Redux и React легче понимают, что данные изменились
- сравнение по ссылке работает быстро
- проще отслеживать ошибки
- меньше скрытых побочных эффектов

Неправильно:

```js
function reducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'increment':
      state.count += 1
      return state
    default:
      return state
  }
}
```

Правильно:

```js
function reducer(state = { count: 0 }, action) {
  switch (action.type) {
    case 'increment':
      return {
        ...state,
        count: state.count + 1,
      }
    default:
      return state
  }
}
```

### Проблема вложенных структур

Чем глубже вложенность, тем сложнее обновление.

```js
const state = {
  user: {
    profile: {
      name: 'Nick',
    },
  },
}
```

Чтобы поменять `name`, в классическом Redux придется копировать каждый уровень:

```js
function reducer(state = initialState, action) {
  switch (action.type) {
    case 'user/nameChanged':
      return {
        ...state,
        user: {
          ...state.user,
          profile: {
            ...state.user.profile,
            name: action.payload,
          },
        },
      }
    default:
      return state
  }
}
```

Именно поэтому Redux Toolkit стал настолько важен: он снимает большую часть этой рутины.

### Как это выглядит в Redux Toolkit

В `createSlice` можно писать код так, будто мы мутируем состояние:

```js
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment(state) {
      state.value += 1
    },
  },
})
```

Но это не "настоящая" мутация обычного объекта. Под капотом Redux Toolkit использует **Immer**, который отслеживает изменения черновика и создает новое иммутабельное состояние.

То есть внешне код проще, а правила Redux все равно соблюдаются.

### Что лучше не хранить в state

В Redux state не стоит класть:

- результаты, которые легко вычислить из других данных
- временные значения, нужные только одному компоненту
- несериализуемые объекты без реальной причины

Например:

- `Map`
- `Set`
- экземпляры классов
- DOM-элементы
- функции

По умолчанию Redux Toolkit даже предупреждает о несериализуемых значениях в `state` и `action`.

### Кратко:

- В Redux состояние обновляют иммутабельно.
- Старый объект состояния нельзя менять напрямую.
- Redux Toolkit упрощает это через Immer.
- Чем чище и сериализуемее `state`, тем проще поддержка проекта.

### Типичные ошибки

- Мутировать вложенные объекты в обычном reducer.
- Хранить в `state` функции, DOM-элементы и другие несериализуемые сущности.
- Дублировать данные вместо нормальной структуры состояния.

---

## Классический Redux: база, которую полезно понимать

Хотя сегодня рекомендуют Redux Toolkit, классический Redux все еще полезен как теория. Он помогает увидеть механику без "магии".

### Простой reducer и store

```js
import { legacy_createStore as createStore } from 'redux'

const initialState = { value: 0 }

function counterReducer(state = initialState, action) {
  switch (action.type) {
    case 'counter/increment':
      return { ...state, value: state.value + 1 }
    case 'counter/decrement':
      return { ...state, value: state.value - 1 }
    default:
      return state
  }
}

const store = createStore(counterReducer)

store.dispatch({ type: 'counter/increment' })
console.log(store.getState()) // { value: 1 }
```

Здесь важно заметить две вещи:

- в современном Redux `createStore` считается legacy API
- для новых приложений рекомендуют `configureStore` из Redux Toolkit

### Action creator

`action creator` это функция, которая возвращает объект действия.

```js
const increment = () => ({
  type: 'counter/increment',
})

const setCount = (value) => ({
  type: 'counter/set',
  payload: value,
})
```

Это не обязательная часть Redux, но так код обычно становится чище и удобнее.

### combineReducers

Когда состояние большое, его обычно делят на части.

```js
import { combineReducers, legacy_createStore as createStore } from 'redux'

function userReducer(state = { name: '' }, action) {
  switch (action.type) {
    case 'user/nameChanged':
      return { ...state, name: action.payload }
    default:
      return state
  }
}

function cartReducer(state = { items: [] }, action) {
  switch (action.type) {
    case 'cart/itemAdded':
      return {
        ...state,
        items: [...state.items, action.payload],
      }
    default:
      return state
  }
}

const rootReducer = combineReducers({
  user: userReducer,
  cart: cartReducer,
})

const store = createStore(rootReducer)
```

После этого состояние будет выглядеть так:

```js
{
  user: { name: '' },
  cart: { items: [] }
}
```

### Как подключить Redux к React

Для React обычно используют библиотеку `react-redux`.

`Provider` передает store в дерево компонентов:

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <App />
  </Provider>
)
```

Обрати внимание: в `Provider` передают именно `store={store}`.

### useSelector и useDispatch

```jsx
import { useDispatch, useSelector } from 'react-redux'

export function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch({ type: 'counter/increment' })}>
        Increment
      </button>
    </div>
  )
}
```

`useSelector` достает данные из store.

`useDispatch` дает доступ к `dispatch`.

### Важный нюанс про useSelector

`useSelector` сравнивает результат по ссылке через `===`.

Это значит, что такой код может вызывать лишние ререндеры:

```jsx
const data = useSelector((state) => ({
  count: state.counter.value,
  user: state.user.data,
}))
```

На каждом вызове здесь создается новый объект.

Без дополнительной оптимизации это часто означает лишний ререндер. Обычно лучше:

- вызывать `useSelector` несколько раз
- использовать мемоизированные селекторы
- при необходимости применять `shallowEqual`

### Кратко:

- Классический Redux полезен для понимания базовой механики.
- `createStore` и ручные reducer работают, но для новых проектов это уже не основной путь.
- В React Redux обычно используют `Provider`, `useSelector` и `useDispatch`.
- `useSelector` чувствителен к сравнению ссылок.

### Типичные ошибки

- Начинать новый проект с "голого" Redux вместо Redux Toolkit.
- Передавать в `Provider` не тот проп.
- Возвращать новый объект из `useSelector` на каждый рендер без необходимости.
- Пытаться писать слишком много логики прямо в компонентах вместо reducers, thunks и selectors.

---

## Почему сейчас рекомендуют Redux Toolkit

Redux Toolkit, или `RTK`, это официальный набор инструментов для работы с Redux.

Он был создан потому, что классический Redux часто порождал много шаблонного кода:

- константы для action types
- отдельные action creators
- громоздкие `switch`
- сложные иммутабельные обновления
- ручная настройка middleware и DevTools

Redux Toolkit убирает большую часть этого шума.

Официально Redux рекомендует:

- писать логику через `createSlice`
- создавать store через `configureStore`
- для асинхронных запросов использовать `createAsyncThunk`
- для работы с серверными данными по возможности использовать `RTK Query`

### Что дает Redux Toolkit

- меньше шаблонного кода
- встроенная поддержка Immer
- удобная настройка store
- DevTools включаются автоматически
- `redux-thunk` подключен по умолчанию
- более современный и безопасный API

### Почему это важно на практике

RTK не просто "делает код короче". Он еще и снижает количество типичных ошибок:

- случайные мутации
- забытый middleware
- ручная возня с action types
- слишком сложная структура проекта

Поэтому мысль "сначала надо изучить старый Redux, а потом уже RTK" не совсем верная.

Правильнее так:

- понять базовые идеи Redux
- дальше сразу работать через Redux Toolkit

### Кратко:

- Redux Toolkit это современный официальный способ писать Redux.
- Он уменьшает шаблонный код и делает архитектуру чище.
- Для новых проектов обычно выбирают именно RTK.

### Типичные ошибки

- Считать RTK "упрощенной учебной оберткой", а не основным API.
- Настраивать store вручную без причины.
- Продолжать писать `switch-case` reducers там, где достаточно `createSlice`.

---

## configureStore

`configureStore` это современный способ создать store.

Пример:

```js
import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './features/counter/counterSlice'

export const store = configureStore({
  reducer: {
    counter: counterReducer,
  },
})
```

Что здесь происходит:

- мы создаем store
- передаем объект reducers
- RTK сам собирает корневой reducer
- автоматически подключает полезные middleware
- автоматически включает Redux DevTools

### Почему configureStore лучше createStore

Если сравнить с классическим Redux, здесь меньше ручной настройки.

`configureStore` по умолчанию:

- подключает `redux-thunk`
- добавляет проверки на мутации в dev-режиме
- добавляет проверки на несериализуемые значения
- поддерживает Redux DevTools

То есть многие вещи, которые раньше надо было настраивать вручную, теперь включены сразу.

### Пример с несколькими slice

```js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'
import cartReducer from './features/cart/cartSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
  },
})
```

Состояние будет иметь такую форму:

```js
{
  auth: { ... },
  cart: { ... }
}
```

### Типизация в TypeScript

Если проект на TypeScript, часто сразу выводят типы из store:

```ts
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './features/auth/authSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
```

Потом на основе них делают типизированные hooks.

### Кратко:

- `configureStore` это современный способ создать Redux store.
- Он автоматически включает полезные middleware и DevTools.
- Для новых приложений это стандартный вариант.

### Типичные ошибки

- Продолжать использовать `createStore` в новом коде.
- Ломать стандартную конфигурацию middleware без реальной причины.
- Не понимать форму `state`, которая зависит от ключей в `reducer`.

---

## createSlice

`createSlice` это одна из самых удобных частей Redux Toolkit.

Он позволяет в одном месте описать:

- имя slice
- начальное состояние
- reducers
- автоматически сгенерированные action creators

### Базовый пример

```js
import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  value: 0,
}

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    increment(state) {
      state.value += 1
    },
    decrement(state) {
      state.value -= 1
    },
    incrementByAmount(state, action) {
      state.value += action.payload
    },
  },
})

export const { increment, decrement, incrementByAmount } = counterSlice.actions
export default counterSlice.reducer
```

Что здесь удобно:

- не нужно отдельно писать строки `type`
- не нужно вручную писать action creators
- можно писать код "как мутацию", но RTK безопасно превратит это в иммутабельное обновление

### Как это использовать в компоненте

```jsx
import { useDispatch, useSelector } from 'react-redux'
import { decrement, increment, incrementByAmount } from './counterSlice'

export function Counter() {
  const count = useSelector((state) => state.counter.value)
  const dispatch = useDispatch()

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => dispatch(decrement())}>-</button>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(incrementByAmount(5))}>+5</button>
    </div>
  )
}
```

### Почему slice это удобно архитектурно

Обычно slice хранит рядом:

- reducer
- actions
- selectors
- иногда async-логика

Это делает код более собранным вокруг конкретной фичи, а не вокруг технических сущностей по папкам.

Такой подход часто называют feature-based structure.

### prepare callback

Иногда перед созданием action нужно подготовить payload.

Для этого можно использовать `prepare`:

```js
import { createSlice, nanoid } from '@reduxjs/toolkit'

const todosSlice = createSlice({
  name: 'todos',
  initialState: [],
  reducers: {
    todoAdded: {
      reducer(state, action) {
        state.push(action.payload)
      },
      prepare(text) {
        return {
          payload: {
            id: nanoid(),
            text,
            completed: false,
          },
        }
      },
    },
  },
})
```

Это удобно, когда action должен иметь предсказуемую структуру.

### Кратко:

- `createSlice` объединяет reducer и actions в одном месте.
- Он уменьшает шаблонный код.
- Логику обновления состояния можно писать заметно проще.

### Типичные ошибки

- Думать, что внутри `createSlice` разрешена обычная мутация всего подряд.
- Хранить в одном slice слишком много несвязанных данных.
- Делать гигантские slice вместо разделения по фичам.

---

## Селекторы

Селектор это функция, которая получает `state` и возвращает нужный кусок данных.

Простой пример:

```js
export const selectCounterValue = (state) => state.counter.value
```

Использование:

```jsx
const count = useSelector(selectCounterValue)
```

### Зачем вообще выносить селекторы

На маленьком проекте можно писать селекторы прямо внутри компонента. Но по мере роста проекта отдельные селекторы дают плюсы:

- меньше дублирования
- проще менять форму `state`
- легче тестировать
- легче переиспользовать

### Производные данные

Иногда из store не нужно брать "сырые" данные. Нужно вычислить что-то на их основе.

Например:

```js
export const selectCompletedTodosCount = (state) =>
  state.todos.items.filter((todo) => todo.completed).length
```

Это уже производные данные.

Если вычисление тяжелое или селектор возвращает новые объекты, имеет смысл использовать мемоизацию, например через `createSelector`.

```js
import { createSelector } from '@reduxjs/toolkit'

const selectTodos = (state) => state.todos.items

export const selectCompletedTodos = createSelector(
  [selectTodos],
  (todos) => todos.filter((todo) => todo.completed)
)
```

Такой селектор не будет заново пересчитывать результат без необходимости.

### Почему нельзя бездумно возвращать новый объект из useSelector

`useSelector` сравнивает результат по ссылке. Если каждый раз возвращать новый объект или массив, компонент может ререндериться чаще, чем нужно.

Непростой, но важный вывод:

- селекторы должны быть как можно более стабильными
- если нужен объект из нескольких значений, стоит подумать о `createSelector` или нескольких вызовах `useSelector`

### Кратко:

- Селекторы читают данные из store.
- Их полезно выносить в отдельные функции.
- Для производных данных часто используют `createSelector`.

### Типичные ошибки

- Возвращать из `useSelector` новый объект на каждом рендере.
- Дублировать одну и ту же логику выборки данных по всему проекту.
- Хранить вычисляемые данные в state вместо селектора без явной причины.

---

## Middleware: зачем они нужны

Middleware это промежуточный слой между `dispatch(action)` и моментом, когда `action` попадет в reducer.

Если сказать проще, middleware позволяет "перехватить" действие и что-то сделать до или после него.

Это удобно для:

- логирования
- асинхронности
- обработки ошибок
- аналитики
- доступа к `getState`

### Упрощенная схема

Поток выглядит примерно так:

1. компонент вызывает `dispatch(action)`
2. action проходит через middleware
3. middleware может что-то сделать
4. потом action идет дальше в reducer

### Пример идеи middleware

```js
const loggerMiddleware = (store) => (next) => (action) => {
  console.log('before:', store.getState())
  console.log('action:', action)

  const result = next(action)

  console.log('after:', store.getState())
  return result
}
```

Вручную писать middleware приходится не так часто, но важно понимать сам принцип.

### Почему middleware особенно важны для асинхронности

Reducer должен быть чистой функцией. Значит:

- HTTP-запрос нельзя делать внутри reducer
- побочные эффекты тоже не должны жить там

Именно поэтому асинхронная логика обычно уходит в middleware-уровень: например, в `thunk` или `saga`.

### Кратко:

- Middleware перехватывают action между `dispatch` и reducer.
- Они нужны для побочных эффектов и дополнительной логики.
- Асинхронность в Redux обычно строится именно через middleware.

### Типичные ошибки

- Пытаться делать асинхронную работу внутри reducer.
- Не понимать, что middleware может менять поведение `dispatch`.
- Засовывать в middleware слишком много бизнес-логики без структуры.

---

## Thunk

`Thunk` это один из самых популярных способов писать асинхронную логику в Redux.

Идея такая:

вместо обычного объекта в `dispatch` можно передать функцию.

Эта функция получит:

- `dispatch`
- `getState`

И уже внутри сможет делать асинхронную работу.

### Пример обычного thunk

```js
export const fetchUser = (userId) => async (dispatch, getState) => {
  dispatch({ type: 'user/fetchStarted' })

  try {
    const response = await fetch(`https://api.example.com/users/${userId}`)
    const user = await response.json()

    dispatch({
      type: 'user/fetchSucceeded',
      payload: user,
    })
  } catch (error) {
    dispatch({
      type: 'user/fetchFailed',
      payload: error.message,
    })
  }
}
```

Потом:

```js
dispatch(fetchUser(10))
```

### Зачем нужен getState

`getState` полезен, когда перед запросом нужно посмотреть текущее состояние:

- не идет ли уже загрузка
- есть ли данные в кэше
- есть ли токен авторизации

Пример:

```js
export const fetchCartIfNeeded = () => async (dispatch, getState) => {
  const { cart } = getState()

  if (cart.status === 'loading' || cart.items.length > 0) {
    return
  }

  dispatch({ type: 'cart/fetchStarted' })
}
```

### Важная мысль

Thunk хорош для простой и средней асинхронной логики.

Если проект очень сложный, с большим количеством фоновых процессов, отмен, гонок запросов и оркестрации, иногда выбирают другие инструменты. Но в большинстве приложений thunk более чем достаточен.

### Кратко:

- Thunk позволяет отправлять функции вместо обычных action-объектов.
- Внутри thunk можно писать асинхронную логику.
- В Redux Toolkit thunk подключен по умолчанию.

### Типичные ошибки

- Считать, что thunk "ломает" Redux. На самом деле это стандартный middleware-подход.
- Писать в thunk слишком много разрозненной логики без структуры.
- Забывать обрабатывать ошибки и состояния загрузки.

---

## createAsyncThunk

`createAsyncThunk` это удобная обертка над типичной async-логикой.

Он автоматически создает жизненный цикл запроса:

- `pending`
- `fulfilled`
- `rejected`

То есть не нужно вручную придумывать и поддерживать все три action type.

### Пример

```js
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

export const fetchUserById = createAsyncThunk(
  'user/fetchById',
  async (userId, thunkApi) => {
    const response = await fetch(`https://api.example.com/users/${userId}`)

    if (!response.ok) {
      throw new Error('Failed to fetch user')
    }

    return response.json()
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState: {
    data: null,
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.data = action.payload
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message
      })
  },
})

export default userSlice.reducer
```

### Что такое extraReducers

`reducers` внутри slice отвечают за "свои" локальные actions.

`extraReducers` позволяет реагировать на actions, созданные где-то еще. В случае `createAsyncThunk` это как раз `pending`, `fulfilled` и `rejected`.

### rejectWithValue

Иногда нужно вернуть свою контролируемую ошибку, а не просто бросить `Error`.

```js
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, thunkApi) => {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      return thunkApi.rejectWithValue('Неверный логин или пароль')
    }

    return response.json()
  }
)
```

Тогда в reducer можно читать `action.payload`, а не только `action.error`.

### Когда createAsyncThunk удобен, а когда нет

Он хорошо подходит, если:

- нужен понятный lifecycle запроса
- асинхронность умеренная по сложности
- хочется быстро и чисто описать загрузку данных

Но если приложение в основном работает с серверными данными, то часто лучше сразу смотреть в сторону `RTK Query`, потому что он снимает еще больше рутины:

- кэширование
- повторные запросы
- инвалидация
- статусы загрузки

### Кратко:

- `createAsyncThunk` автоматизирует типичный жизненный цикл async-запроса.
- Он хорошо сочетается с `extraReducers`.
- Для сложной работы с серверными данными часто еще удобнее `RTK Query`.

### Типичные ошибки

- Обрабатывать только успешный запрос и забывать про `rejected`.
- Не хранить `status` и `error` рядом с данными.
- Использовать `createAsyncThunk` там, где проекту уже нужнее `RTK Query`.

---

## RTK Query

`RTK Query` это инструмент внутри Redux Toolkit для работы с серверными данными.

Если говорить прямо, это один из самых полезных инструментов в современной экосистеме Redux.

Он берет на себя то, что обычно приходится писать руками:

- запросы
- кэширование
- статусы загрузки
- повторные запросы
- инвалидацию кэша
- генерацию hooks для React

### Почему это важно

Когда разработчик пишет запросы вручную через thunk, ему часто приходится держать в голове целый набор вещей:

- `isLoading`
- `isError`
- `data`
- повторные запросы
- обновление после мутаций
- кэш

RTK Query автоматизирует большую часть этой работы.

### Базовая настройка

```js
import { configureStore } from '@reduxjs/toolkit'
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: 'https://api.example.com/',
  }),
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => 'posts',
    }),
  }),
})

export const { useGetPostsQuery } = api

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
})
```

### Использование в компоненте

```jsx
import { useGetPostsQuery } from './services/api'

export function PostsList() {
  const { data = [], isLoading, isError } = useGetPostsQuery()

  if (isLoading) {
    return <p>Loading...</p>
  }

  if (isError) {
    return <p>Failed to load posts</p>
  }

  return (
    <ul>
      {data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  )
}
```

### Query и Mutation

В RTK Query есть два основных типа endpoint:

- `query` для получения данных
- `mutation` для изменения данных

Пример mutation:

```js
addPost: builder.mutation({
  query: (newPost) => ({
    url: 'posts',
    method: 'POST',
    body: newPost,
  }),
})
```

### Инвалидация кэша

Одна из самых полезных возможностей RTK Query это `tags`.

Смысл такой:

- запрос помечает, какие данные он предоставляет
- мутация помечает, какие данные она инвалидирует
- RTK Query понимает, что кэш надо обновить

Пример:

```js
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/' }),
  tagTypes: ['Posts'],
  endpoints: (builder) => ({
    getPosts: builder.query({
      query: () => 'posts',
      providesTags: ['Posts'],
    }),
    addPost: builder.mutation({
      query: (newPost) => ({
        url: 'posts',
        method: 'POST',
        body: newPost,
      }),
      invalidatesTags: ['Posts'],
    }),
  }),
})
```

После успешного `addPost` список `getPosts` можно автоматически перезапросить.

### Когда RTK Query особенно хорош

Он особенно полезен, если приложение активно работает с API:

- список товаров
- профили пользователей
- комментарии
- админ-панель
- таблицы с фильтрами

То есть везде, где много загрузки, обновления и кэшируемых данных.

### Когда RTK Query не решает вообще все

RTK Query отлично подходит для **серверного состояния**. Но не нужно путать его с **клиентским состоянием**.

Например:

- открыта ли модалка
- какой таб выбран
- локальные настройки формы до отправки

Это не задача RTK Query.

### Кратко:

- `RTK Query` это инструмент для запросов и кэширования серверных данных.
- Он снимает много рутины по сравнению с ручными thunk.
- Для API-heavy приложений это часто лучший выбор в экосистеме Redux.

### Типичные ошибки

- Использовать RTK Query как замену вообще любому состоянию в приложении.
- Забывать подключить `api.reducer` и `api.middleware` в store.
- Писать ручной кэш рядом с RTK Query без необходимости.

---

## Redux Saga: где она вписывается

В исходных заметках есть `redux-saga`, поэтому важно коротко расставить акценты.

`redux-saga` это отдельный middleware-подход для сложной асинхронной логики. Он строится на генераторах.

Идея примерно такая:

- приложение отправляет action
- saga его перехватывает
- выполняет побочный эффект
- потом dispatch-ит новые actions

Условный пример:

```js
import { call, put, takeEvery } from 'redux-saga/effects'

function* fetchUserWorker(action) {
  try {
    const response = yield call(fetch, `/api/users/${action.payload}`)
    const user = yield call([response, response.json])

    yield put({
      type: 'user/fetchSucceeded',
      payload: user,
    })
  } catch (error) {
    yield put({
      type: 'user/fetchFailed',
      payload: error.message,
    })
  }
}

export function* userSaga() {
  yield takeEvery('user/fetchRequested', fetchUserWorker)
}
```

### Нужна ли saga сегодня

В большинстве обычных проектов:

- либо хватает `createAsyncThunk`
- либо лучше использовать `RTK Query`

`redux-saga` обычно оправдана там, где действительно сложная оркестрация:

- отмена фоновых задач
- гонки запросов
- сложные сценарии подписок
- длинные workflow-процессы

То есть saga это не "обязательная следующая ступень после thunk", а специализированный инструмент.

### Кратко:

- `redux-saga` нужна для сложной побочной логики.
- Для большинства современных приложений чаще хватает RTK и RTK Query.
- Saga стоит брать тогда, когда ее сложность действительно окупается.

### Типичные ошибки

- Тащить saga в проект "на всякий случай".
- Выбирать saga только потому, что она кажется более "серьезной".
- Использовать генераторы, не понимая, какую именно проблему они решают.

---

## Как обычно организуют Redux-код в проекте

Один из удачных подходов это организация по фичам.

Пример:

```text
src/
  app/
    store.js
  features/
    auth/
      authSlice.js
      authSelectors.js
      authApi.js
    cart/
      cartSlice.js
      cartSelectors.js
    posts/
      postsSlice.js
      postsApi.js
```

Так код группируется вокруг бизнес-сущностей, а не вокруг абстрактных технических папок вроде:

- `actions/`
- `reducers/`
- `types/`

Для классического Redux такой стиль тоже возможен, но с Redux Toolkit он особенно естественный.

### Что стоит держать рядом

Обычно в одной фиче полезно держать рядом:

- slice
- actions
- selectors
- async-логику
- тесты этой фичи

Это снижает связность между папками и упрощает поддержку.

### Кратко:

- В Redux-проектах удобно группировать код по фичам.
- Slice, selectors и related-логика обычно лежат рядом.
- Такой подход лучше масштабируется.

### Типичные ошибки

- Разносить все по техническим папкам и терять связь между частями одной фичи.
- Делать один гигантский slice на половину приложения.
- Смешивать API-логику, UI-логику и бизнес-логику без границ.

---

## Практические рекомендации

### Что класть в Redux

Обычно хорошо подходят:

- авторизация
- данные текущего пользователя
- корзина
- фильтры, если они нужны в разных частях приложения
- кэшированные данные с сервера
- глобальные статусы приложения

### Что часто не стоит класть в Redux

- значение одного поля формы, если оно нужно только в одном компоненте
- локальное открытие попапа
- hover-состояния
- временные UI-флаги, не влияющие на другие части приложения

### Как понять, нужен ли Redux

Задай себе вопросы:

- эти данные нужны многим частям приложения?
- их логика обновления сложная?
- нужно ли отслеживать их жизненный цикл централизованно?
- выгодно ли хранить их в общем store, а не локально?

Если на все ответ "нет", возможно Redux не нужен.

### Кратко:

- Redux полезен для общего и сложного состояния.
- Локальные UI-детали обычно лучше оставлять в компонентах.
- Хорошая архитектура начинается не с "запихнуть все в store", а с выбора подходящего уровня состояния.

### Типичные ошибки

- Хранить в Redux каждую мелочь из интерфейса.
- Использовать Redux как замену вообще всем способам управления состоянием.
- Не различать серверное и клиентское состояние.

---

## Частые вопросы и подводные камни

### Можно ли использовать Redux без React

Да. Redux не привязан к React.

`react-redux` это отдельная библиотека для интеграции Redux с React.

### Почему reducer должен быть чистой функцией

Потому что тогда его легко тестировать и предсказывать.

Если внутри reducer спрятать побочные эффекты, поведение состояния станет запутанным.

### Нужно ли всегда писать action creators

В классическом Redux часто да. В Redux Toolkit они обычно генерируются автоматически через `createSlice`.

### Почему иногда компонент ререндерится слишком часто

Частая причина:

- `useSelector` возвращает новый объект
- селектор не мемоизирован
- state устроен так, что при каждом действии меняются лишние ссылки

### Нужно ли знать старый Redux, если работаешь с RTK

Базовые идеи знать нужно:

- что такое `state`
- что такое `action`
- как работает `dispatch`
- что делает `reducer`

Но писать новые проекты вручную через legacy API обычно не нужно.

### Кратко:

- Redux не зависит от React.
- Чистота reducer это основа предсказуемости.
- Большинство современных Redux-проектов лучше писать через RTK.

### Типичные ошибки

- Учить только синтаксис RTK без понимания базовых концепций Redux.
- Пугаться лишних ререндеров, не проверив работу селекторов.
- Использовать Redux там, где достаточно более простого решения.

---

## Итог

Если собрать все в одну мысль, то Redux это не просто библиотека "для глобального state". Это способ организовать состояние так, чтобы его было легче понимать, тестировать и поддерживать.

Но современный Redux это уже не тот Redux, который ассоциируется с тонной шаблонного кода и бесконечными `switch-case`.

Сегодня нормальный рабочий путь обычно выглядит так:

1. понять базовые идеи Redux
2. писать store через `configureStore`
3. писать логику через `createSlice`
4. для async использовать `createAsyncThunk` или сразу `RTK Query`
5. держать в Redux только действительно общее и полезное состояние

Если запомнить только одну практическую рекомендацию, то она будет такой:

**Изучай классический Redux как фундамент, но в реальном коде по умолчанию выбирай Redux Toolkit.**

### Кратко:

- Redux нужен для предсказуемого управления сложным общим состоянием.
- Современный Redux почти всегда означает Redux Toolkit.
- Для серверных данных особенно полезен RTK Query.
- Хороший Redux-код это не максимум абстракций, а ясная структура и понятные обновления состояния.

---

## Что изучать дальше

После этого конспекта полезно отдельно углубиться в:

- selectors и `createSelector`
- нормализацию данных
- `createEntityAdapter`
- RTK Query cache invalidation
- Redux DevTools
- архитектуру feature slices
- тестирование reducers, selectors и async-логики

---

## Официальные источники

- [Redux Toolkit Overview](https://redux.js.org/redux-toolkit/overview)
- [Redux Essentials Tutorial](https://redux.js.org/tutorials/essentials/part-1-overview-concepts)
- [Redux Fundamentals](https://redux.js.org/tutorials/fundamentals/part-1-overview)
- [React Redux Hooks API](https://react-redux.js.org/api/hooks)
- [React Redux Provider API](https://react-redux.js.org/api/provider)
- [Writing Logic with Thunks](https://redux.js.org/usage/writing-logic-thunks)
- [createAsyncThunk](https://redux-toolkit.js.org/api/createAsyncThunk)
- [RTK Query Overview](https://redux-toolkit.js.org/rtk-query/overview)
