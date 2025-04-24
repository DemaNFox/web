/* 

* Redux
Это библиотека которая позволяет выносить состояние во внешние зависимость, благодаря чему к этому состоянию может обращаться любой компонент.

Основные понятия Redux:

1. action - объект который имеет 2 поля, type, payload.
2. reducer - функция которая определяет как будет изменятся наше состояние
3. store - новосозданное состояние

Первое что нужно сделать для создания состояния это создать store, создается он с помощью функции createStore, параметром которой будет reducer.

Далее, создать функцию reducer , в которой прописать логику изменения состояние, делается это через switch case, который в себе должен возвращать состояние. Вернет новое состояние для описанной логики или же неизмененное состояние, если тип логики не был описан в reducer.

По умолчанию в redux нельзя менять состояние объекта, поэтому нужно разворачивать старое состояние, и через конкретное поле изменить состояние в новом объекте.

Дефолтное состояние можно указать как базовое значение для аргумента state в функции reducer.

Создание состояния и его описание:

const defaultState = {
  cash: 0,
}

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case "ADD_CASH":
      return {...state, cash: state.cash + action.payload}
    case "GET_CASH":
      return {...state, cash: state.cash - action.payload}
    default:
      return state
  }
}

const store = createStore(reducer);

Что бы передавать наше состояние в другие компоненты, нужно обернуть приложение в компонент <Provider>, в который пропсом прокинуть состояние.

Обертка приложения:

<Provider value={store}>
  <App/>
</Provider>

Для того что бы получить состояние в компоненте, необходимо использовать хук useDispatch() для того что бы в дальнейшем менять состояние, а так же useSelector() что бы получить само состояние. Аргументом для useSelector будет функция, которая получает аргументом состояние и возвращает конкретное поле для этого состояния.

Для изменения состояние создается функция, в которой вызывается dispatch, который принимает объектом тот тип состояния который мы будем менять, и вторым значение объекта значение на которое мы будем менять состояние.

const dispatch = useDispatch();
const cash = useSelector((state) => state.cash);

const addCash = (newCash) => {
  dispatch({type: "ADD_CASH", payload: newCash})
};

const addCash = (newCash) => {
  dispatch({type: "GET_CASH", payload: newCash})
};

Если состояний более чем одно то нужно делать декомпозицию, создается отдельная папка store в котором будет логика для состояний. Сначала нужно продублировать файл index.js, в нем будет происходить инициализаций store (функция createStore). Все последующие reducer стоит заносить в отдельные именованные файлы в этой же папке. Подключение будет выполняться с помощью импортов.

Для объединения всех reducer в один,используется встроенная функция в redux - combineReducers, аргументом которой есть объект в котором перечисляются все созданные reducer. Так в дальнейшем всегда можно будет занести новый reducer в общий объект. Можно передавать как просто название reducer так и ключ - значение, что даст возможность обращаться по заданному ключу. Пример:

const rootReducer = combineReducers({
  one: firstReducer,
  two: secondReducer,
})

export const store = createStore(rootReducer)

Для удобства разработки нужно отслеживать состояние, это можно сделать с помощью инструментов разработчика (отдельный плагин для браузера) и пакет Redux DevTools Extensions helper. Что бы его активировать, вторым аргументом в store следует передать саму функцию из пакета (composeWithDevTools).

export const store = createStore(rootReducer, composeWithDevTools)

Хорошей практикой в описания логики для reducer является вынос названий логики в отдельную константу, так же что бы в будущих action не передавать постоянно type и payload самим, можно создать функцию которая будет принимать аргументами payload и сама преобразовывать у нужному типу. Пример:

const ADD_CASH = "ADD_CASH"
const GET_CASH = "GET_CASH"

const reducer = (state = defaultState, action) => {
  switch (action.type) {
    case ADD_CASH:
      return {...state, cash: state.cash + action.payload}
    case GET_CASH:
      return {...state, cash: state.cash - action.payload}
    default:
      return state
  }
}

export const addCashAction = (payload) => ({type: ADD_CASH, payload: payload})

const addCash = (newCash) => {
  dispatch(addCashAction(newCash))
};

? Работа с асинхронным кодом в redux (thunk)
Для работы с асинхронным кодом первое что нужно сделать это установить пакет redux-thunk, и подключить его, для этого его как и функцию отладки нужно подключить. Что бы подключить, его нужно передать аргументом в функцию для отладки (composeWithDevTools), сам модуль имеет название "applyMiddleware(thunk)"

Для асинхронных запросов лучше создать отдельную папку, для соблюдение более удобной структуры (asyncActions).

Что бы иметь возможность использовать асинхронную функцию как action, т.е прокинуть её dispatch, нужно вернуть из этой функции функцию которая аргументом будет принимать dispatch. Пример:

export const fetchCustomers = () => {
return function(dispatch) {
  fetch()
    .then(response => response.json())
    .then(json => dispatch(addCustomersAction(json)))
}
};

? Работа с асинхронным кодом в redux (saga)
Redux-saga — это альтернативный подход к организации сайд-эффектов. Вместо того, чтобы диспатчить функции, которые обрабатываются redux-thunk-ом, вы создаёте сагу, которая собирает всю логику обработки внутрь себя. В отличие от thunk-ов, которые выполняются, когда вы их диспатчите, саги запускаются при старте приложения и как бы «работают в фоне». Саги слушают все экшены, которые диспатчит стор, и решают, что делать с ними.

У саг в редаксе два преимущества по сравнению с thunk-ами:
— Они позволяют организовывать сложные последовательности сайд-эффектов
— И они очень легко тестируются

В redux raga есть 3 основных понятия:
worker - функция внутри которой выполняется какая-то асинхронная логика с применением нужных effects
watcher - функция генератор которая будет отрабатывать когда action с нужным worker будет отрабатывать
effects - набор встроенных функция для запросов / диспатча и т.д

Модуль построен на основе функций генераторов.

Порядок работы с saga:

1) Создаем middleWare
2) Передаем middleWare вторым параметром для store
3) Создаем нужные worker для выполнения асинхронных функций а так же watcher для них, в который передаем функцию action и нужный worker
4) через соответствующие effects выполняем те или иные действия с данными

Пример кода:

Создаем и инициализируем saga

const sagaMiddleware = createSagaMiddleware()

const rootReducer = combineReducers({
  userReducer,
})

const store = createStore(rootReducer, applyMiddleware(sagaMiddleware))

sagaMiddleware.run(rootWatcher)

Создаем функцию запроса и обработчики для неё (worker, watcher)

const fetchUsers = () => fetch("url")

function* fetchUsersWorker() {
  const data = yield call(fetchUsers)
  const json = yield call(() => new Promise((res) => res(data.json)))
  yield put(setUsers(json))
}

function* userWatcher(){
  yield takeEvery(UsersAction, fetchUsersWorker)
}

  Функция rootWatcher, объединяет в себе все watcher подобно combineReducers.

function* rootWatcher(){
  yield all(userWatcher, )
}

? Redux ToolKit + RTK query
Это инструмент позволяющий упростить работу с redux (надстройка). Позволяет уменьшить количество кода, например избавляет от необходимости создания action creator. В частности, в связке с TS благодаря встроенным хукам упрощается типизация данных.

Redux ToolKit (инструменты для разработчика) и Redux thunk идут в RTK из коробки.

Этапы создания.
В RTK вместо createStore используется функция configureStore, аргументами которого будет объект, внутри которого будет объект reducer, в свою очередь внутри которого будут остальные reducer (если не использовать combineReducer).

export const store = configureStore({
  reducer: {
    posts: postsReducer,
    comments: commentsReducer,
    users: usersReducer,
  },
});

Так же сразу стоит определить типы для удобной дальнейшей работы в среде TS, это тип store и тип dispatch для store. Это не позволит задиспатчить те action, которые были не определены. Так же стоит типизировать хуки dispatch и selector.

export type RootState = ReturnType<typeof setupStore.getState>
export type AppDispatch = typeof setupStore.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

Reducers создаются в RTK в виде "слайсов" с помощью функции createSlice. Аргументом данная функция принимает объект, который в себе содержит параметры, имя, начальное значение (которое так же передается в виде объекта), reducers и extraReducers (данный reducer частично облегчают задачу для работы с асинхронным кодом, так как уже имеют определенные поля для использования). После чего передаются в store.

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: {
    [fetchUsers.fulfilled.type]: (state, action: PayloadAction<IUser[]>) => {
      state.isLoading = false
      state.users = action.payload
    },
    [fetchUsers.pending.type]: (state, action: PayloadAction<IUser[]>) => {
      state.isLoading = false
      state.users = action.payload
    },
    [fetchUsers.rejected.type]: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
  },
})

export default userSlice.reducer

Изменять состояние в RTK можно разу напрямик, через заданную функцию в reducer. Пример:

reducers: {
  increment: (state) => {
    state.value += 1
  }

Работа в асинхронными функциями так же более проста, так как уже встроена. С помощью API можно работать с запросами через специальную функцию createAsyncThunk. Аргументами она приминает название и callback, в котором будет происходить действие. Пример:

export const fetchUsers = createAsyncThunk("user/fetchAll", async (_, thunkAPI) => {
  try {
    const response = await axios.get<IUser[]>("https:jsonplaceholder.typicode.com/users")
    return response.data
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message)
  }
})

async (_, thunkAPI), в эту функции можно передавать до 3х параметров, первый параметр, нужен для того что бы передавать в функцию что то из вне, как аргумент. Второй параметр, это объект thunkAPI в котором находятся другие методы работы с запросами. И третий, в котором можно указать отдельные параметры для работы.

? RTK query
RTK Query — это мощный инструмент работы с запросами. Он позволяет получать, изменять, обновлять данные с сервера.

Он хеширует полученные данные, и если они еще где то будут использоваться, то он не будет делать повторный запрос а просто отредактирует уже существующие данные (часто используется в выпадающих списках которые подгружаются с сервера).

Берет на себя полностью обработку событий, то есть у него автоматически генерируется поля loading, error, data и т.п так же есть поле с функциями для принудительного обновления данных, если есть такая потребность.

Создаются запросы с помощью функции crateApi (импорт может не подтягиваться). В аргумент она принимает объект, который содержит в себе:

reducerPath: "" - ключ, который однозначно будет определять содержащий в себе сервис
baseQuery: fetchBaseQuery() - параметр в котором передаем функцию fetchBaseQuery, которая в себя принимает ряд параметров, один из самых важных, это url? который будет показывать начальный путь для наших запросов
endpoints: - параметр в котором описывается все состояния на которые будут отправляться запросы, значением будет функция, которая принимает в себя параметр "build", будет возвращать объект. Все что содержится в объекте это функции, с помощью которых будут изменяться / получаться данные.

При обращении у build после объявленной функции мы указываем какого типа обращение (query/mutation) для чтения и изменения соответственно (тип запроса так же меняется GET/PULL/DELETE/POST).

build.query тоже является функцией внутри которой параметры, такие как url, params. Т.е те данные которые будут финальной точкой для запроса (схож с axios запросами).

export const postAPI = createApi({
  reducerPath: "userAPI",
  baseQuery: fetchBaseQuery({ baseUrl: "https:jsonplaceholder.typicode.com/" }),
  endpoints: build => ({
    fetchAllUsers: build.query<IPost[], number>({
      query: (limit: number = 5) => ({
        url: "/posts",
        params: {
          _limit: limit,
        },
      }),
    }),
    createPost: build.mutation<IPost, IPost> ({
      query: (post) => ({
        url: "/posts",
        method: "POST"
        body: post
      }),
    }),
  }),
})

Для того что бы все работало необходимо зарегистрировать reducer, для этого как ключ для reducer указываем его path, который был указан для него и как значение сам reducer.

Так же необходимо добавить Middleware, это будет стрелочная функция, которая принимает в себя другую функцию которая уже возвращает дефолтный middleware который уже встроен в RTK. И дальше, с помощью функции concat объединить их.

export const setupStore = configureStore({
  reducer: {
    [postAPI.reducerPath]: postAPI.reducer,
  },
  middleware: getDefaultMiddleware => getDefaultMiddleware().concat(postAPI.middleware),
})

Для того что бы в дальнейшем получить данные из запроса, мы просто вызываем его через его path и обращаемся к его свойству (хуку) который был динамично сгенерирован функционалом. Аргументами в хук можно передавать данные, которые мы хотим подставить в запрос, и так же объектом можно передавать параметры, например лонг пулинг, который позволяет получать запросы в определенном промежутке.

const { data: posts, error, isLoading } = postAPI.useFetchAllUsersQuery()

const { data: posts, error, isLoading } = postAPI.useFetchAllUsersQuery(10, {
  pollingInterval: 1000
})

Для отправки данных используется такой же подход, с помощью хука вытягиваем функцию которая будет пушить данные на сервер, и объект, который в себе содержит обработчики и т.п.

const [createPost, {}] = postAPI.useCreatePostMutation()

const handleCreate = async () => {
  const title = prompt()
  await createPost({title, body:title} as IPost)
}

Однако, стоит учитывать что по умолчанию, список с данными не обновится, так как RTK не знает какие данные были обновлены. Для того что бы RTK перерисовывал данные, нужно дополнительно указывать теги в endpoint, которые будут говорить что данный endpoint влияет на данные. Для правильной работы проекта, эти взаимосвязи нужно проставлять. Пример:

endpoint: build.query({
  query: params...
  providesTags: result => ["Post"]
})
endpoint: build.mutation({
  query: params...
  invalidatesTags: result => ["Post"]
}) 

*/
