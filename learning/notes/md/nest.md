# Practical NestJS Handbook

Этот гайд собран по трем исходным материалам `live.txt`, `live_2.txt` и `live_3.txt`, а пробелы закрыты по официальной документации NestJS. Это не попытка переписать документацию. Цель другая: дать рабочую картину NestJS, чтобы после чтения было понятно не только *что* написать, но и *почему код в Nest обычно пишут именно так*.

NestJS хорошо раскрывается, когда перестаешь воспринимать его как "Express с декораторами". Это фреймворк, который заставляет заранее решить:

- где живет вход в приложение;
- где лежит бизнес-логика;
- кто отвечает за валидацию;
- кто проверяет доступ;
- где ловятся ошибки;
- как зависимости связываются между собой;
- как проект будет расти через полгода.

На маленьком CRUD это иногда кажется лишним. На backend с auth, базой данных, очередями, логами, WebSockets и несколькими разработчиками это быстро окупается.

## 1. Как мыслить по-NestJS

Nest дает приложению форму. Он не запрещает писать плохой код, но делает хороший путь заметнее:

1. `Controller`, `Resolver`, `Gateway` или message handler принимают входящий запрос из конкретного транспорта.
2. DTO и pipes приводят вход к ожидаемому виду.
3. Guards решают, можно ли вообще выполнять обработчик.
4. Service выполняет прикладную логику.
5. Provider слоя данных работает с хранилищем.
6. Interceptors оборачивают выполнение для логирования, метрик, трансформации ответа.
7. Filters приводят ошибки к понятному формату.

Удобная ментальная модель:

- **модуль** отвечает за границу фичи;
- **контроллер** отвечает за HTTP-контракт;
- **сервис** отвечает за use case;
- **провайдер** отвечает за переиспользуемую зависимость;
- **DTO** отвечает за форму входа;
- **guard** отвечает за допуск;
- **pipe** отвечает за преобразование или валидацию аргумента;
- **interceptor** отвечает за обертку вокруг выполнения;
- **filter** отвечает за выход ошибки наружу.

Если в контроллере начинают жить SQL-запросы, хеширование паролей, генерация токенов и расчет скидки, Nest перестает помогать. Контроллер превращается в старый добрый fat route handler, только с декораторами.

## 2. Почему Nest, а не голый Express

Express и Fastify дают хороший фундамент для HTTP. Nest поверх них дает архитектурную систему:

- TypeScript становится не дополнением, а естественным способом описывать контракты;
- есть Dependency Injection;
- встроены модули, guards, pipes, interceptors, filters, testing utilities;
- REST, WebSockets и microservices используют похожие идеи;
- CLI быстро создает ресурсы и каркас;
- код легче разделять по фичам.

Nest по умолчанию использует HTTP adapter поверх Express, но может работать и с Fastify. Это важно: Nest не отменяет Node.js и HTTP-платформу под капотом. Когда нужны cookies, multipart uploads, CORS, raw response или adapter-specific API, вы все еще должны понимать нижний слой.

Мини-правило: выбирайте Nest не ради "много файлов", а когда хотите, чтобы backend оставался читаемым после роста домена.

### CLI and scaffolding

CLI в исходниках используется постоянно и это не случайно. Он не проектирует приложение за вас, но быстро создает правильный каркас:

```bash
nest new movies-api
nest g resource movies
nest g resource auth --no-spec
nest g module infra/prisma
nest g service infra/prisma
```

`nest g resource` особенно удобен для старта фичи: он может создать module и transport entry point под выбранный режим. После генерации ресурс почти всегда надо почистить:

- удалить handlers, которых в use case нет;
- переименовать DTO под реальный контракт;
- не оставлять placeholder CRUD только потому, что CLI его создал;
- решить, нужны ли generated spec files прямо сейчас.

Сгенерированный код полезен как starting point. Архитектура начинается после генерации.

## 3. Bootstrap: с чего начинается приложение

Точка входа обычно живет в `main.ts`.

```ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
```

Что здесь важно:

- `NestFactory.create(AppModule)` строит граф зависимостей приложения;
- global prefix позволяет не дублировать `api` в каждом контроллере;
- глобальный `ValidationPipe` делает DTO реальным runtime-контрактом;
- shutdown hooks нужны, когда приложение должно корректно закрывать ресурсы при остановке.

В реальном проекте сюда часто добавляют:

- CORS;
- cookies middleware;
- bootstrap helpers;
- глобальный logger;
- глобальные filters/interceptors;
- версионирование API.

`main.ts` не должен превращаться в свалку. Настройку логгера, CORS и глобальных компонентов удобно выносить в небольшие функции.

## 4. Архитектурное ядро

### Modules

Модуль описывает кусок приложения и его зависимости.

```ts
import { Module } from '@nestjs/common';
import { MoviesRepository } from './movies.repository';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, MoviesRepository],
  exports: [UsersService],
})
export class UsersModule {}
```

Основные поля:

- `imports` подключает зависимости из других модулей;
- `controllers` регистрирует HTTP-входы;
- `providers` регистрирует сервисы, repositories, strategies, guards и другие injectable-классы;
- `exports` делает провайдеры доступными наружу.

Если `AuthService` нужен только внутри `AuthModule`, не экспортируйте его "на всякий случай". Граница модуля полезна именно тем, что ограничивает хаос.

`@Global()` существует, но глобальными стоит делать инфраструктурные вещи осознанно: config, database module, observability wrappers. Если каждая фича глобальная, модульность фиктивна.

### Controllers

Контроллер принимает HTTP-запрос и делегирует работу сервису.

```ts
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { MoviesService } from './movies.service';

@Controller('movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }
}
```

Контроллер должен быть тонким:

- достал params/query/body;
- применил декораторы;
- вызвал use case;
- вернул результат.

### Providers and Services

Provider это любой объект, который Nest умеет создать и внедрить. `Service` обычно просто provider с прикладной логикой.

```ts
import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async create(dto: CreateUserDto) {
    const exists = await this.usersRepository.findByEmail(dto.email);

    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    return this.usersRepository.create(dto);
  }
}
```

Сервис не обязан быть "одна таблица = один сервис". В хорошем проекте сервис часто выражает use case: `AuthService`, `LinksService`, `BillingService`, `StatisticsService`.

### Dependency Injection

Nest сам создает зависимости через container:

```ts
constructor(
  private readonly usersRepository: UsersRepository,
  private readonly config: ConfigService,
) {}
```

Плюсы:

- зависимости видны в сигнатуре класса;
- тесты могут подменить провайдер моками;
- один provider можно переиспользовать в разных местах;
- framework управляет lifecycle.

DI не отменяет проектирование. Если один сервис принимает 12 зависимостей, это сигнал, что он делает слишком много.

### Custom providers

Иногда зависимость не является классом. Тогда используйте token:

```ts
export const MAILER_OPTIONS = Symbol('MAILER_OPTIONS');

{
  provide: MAILER_OPTIONS,
  useValue: {
    from: 'noreply@example.com',
  },
}
```

```ts
constructor(
  @Inject(MAILER_OPTIONS)
  private readonly options: MailerOptions,
) {}
```

Это основа динамических модулей и удобных библиотечных wrappers.

### Scope

По умолчанию провайдеры singleton:

- `DEFAULT` один экземпляр на приложение;
- `REQUEST` новый экземпляр на запрос;
- `TRANSIENT` новый экземпляр для каждого consumer.

В большинстве backend-кода singleton правильнее. Request scope полезен редко: request-local cache, tenant context, сложный per-request trace state. Он увеличивает стоимость запроса и может распространиться вверх по dependency tree.

Особенно осторожно со scope у gateways и scheduler-like компонентов: им нужен singleton-style lifecycle.

### Lifecycle

Nest умеет вызывать hooks:

- `onModuleInit`;
- `onApplicationBootstrap`;
- `onModuleDestroy`;
- `beforeApplicationShutdown`;
- `onApplicationShutdown`.

Пример:

```ts
import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class SearchIndexService implements OnModuleInit {
  async onModuleInit() {
    await this.warmup();
  }

  private async warmup() {
    // preload dictionaries or check external dependency
  }
}
```

Используйте lifecycle для подключения ресурсов, warmup, flush логов и graceful shutdown. Не прячьте тяжелую доменную работу в constructors: constructor должен связывать зависимости, а не запускать бизнес-процессы.

## 5. Как раскладывать приложение

Для небольшого проекта нормальна feature-first структура:

```text
src/
  app.module.ts
  main.ts
  auth/
    auth.module.ts
    auth.controller.ts
    auth.service.ts
    dto/
    guards/
    strategies/
  users/
    users.module.ts
    users.controller.ts
    users.service.ts
    dto/
  persistence/
    persistence.module.ts
    movies.repository.ts
  common/
    decorators/
    filters/
    interceptors/
    pipes/
```

В одном из практических проектов материалы переходят к более явному разделению:

```text
src/
  api/
    auth/
    links/
    statistics/
    api.module.ts
  infra/
    persistence/
    infra.module.ts
  common/
    decorators/
    guards/
    utils/
  config/
  app.module.ts
  main.ts
```

Это хороший вариант, когда:

- transport/API фич много;
- инфраструктурные клиенты не хочется смешивать с доменом;
- часть сервисов общая для REST, scheduled work или WebSockets.

Не начинайте проект с двадцати слоев ради "enterprise". Начните с фич и отделяйте инфраструктуру тогда, когда она реально появилась.

## 6. HTTP в NestJS

### Routes

HTTP handlers описываются декораторами:

```ts
@Get()
findAll() {}

@Get(':id')
findOne(@Param('id') id: string) {}

@Post()
create(@Body() dto: CreateMovieDto) {}

@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {}

@Delete(':id')
remove(@Param('id') id: string) {}
```

Сразу думайте об HTTP-семантике:

- `GET` не должен менять состояние;
- `POST` удобно использовать для создания и command-like операций;
- `PUT` обычно заменяет ресурс целиком;
- `PATCH` меняет часть ресурса;
- `DELETE` удаляет.

### Params, Query, Body, Headers

```ts
@Get()
findAll(
  @Query('page') page: string,
  @Query('search') search?: string,
  @Headers('user-agent') userAgent?: string,
) {
  return this.moviesService.findAll({ page, search, userAgent });
}
```

Nest дает `@Param`, `@Query`, `@Body`, `@Headers`, `@Req`, `@Res`, `@Ip`, `@Session`.

Осторожно с `@Res()`. Если вы берете raw response целиком и вручную вызываете `res.json()`, часть Nest response pipeline становится менее полезной. Когда response нужен только для cookies, используйте passthrough:

```ts
login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) response: Response,
) {
  return this.authService.login(dto, response);
}
```

### DTO

DTO описывает входные данные на границе приложения.

```ts
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
```

DTO не равно entity. DTO это публичный контракт. Entity/model это форма данных внутри persistence layer. Если отдавать ORM entity напрямую, пароль или внутренние поля рано или поздно вытекут наружу.

### ValidationPipe

TypeScript типы исчезают в runtime. DTO без runtime-валидации не защищает endpoint.

```ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);
```

Что дают опции:

- `whitelist` убирает поля, которых нет в DTO;
- `forbidNonWhitelisted` превращает лишние поля в ошибку;
- `transform` помогает преобразовывать вход к DTO и использовать built-in pipes вместе с typed handlers.

В реальном API отдельно проверьте:

- optional fields через `@IsOptional()`;
- arrays через `@IsArray()` и validators с `{ each: true }`;
- enums через `@IsEnum()`;
- IDs через `@IsUUID()` или `ParseUUIDPipe`;
- pagination и числовые query-параметры.

Пример query DTO для списка:

```ts
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListMoviesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
```

```ts
@Get()
findAll(@Query() query: ListMoviesQueryDto) {
  return this.moviesService.findAll(query);
}
```

Почему это лучше, чем три необработанных `@Query('...')` строки в сервисе: parsing, limits and documentation remain at the boundary. Сервис получает уже понятную форму запроса, а не смесь строк из URL.

### Pipes

Pipe срабатывает на аргументе handler-а. Он либо преобразует значение, либо отвергает его.

```ts
@Get(':id')
findOne(@Param('id', ParseUUIDPipe) id: string) {
  return this.moviesService.findOne(id);
}
```

Кастомный pipe:

```ts
import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class TrimPipe implements PipeTransform<string, string> {
  transform(value: string) {
    return value.trim();
  }
}
```

Pitfall: не делайте в pipe тяжелую бизнес-логику. Валидация формы и преобразование входа да. Создание заказа нет.

## 7. Request pipeline: кто что делает

В HTTP-запросе эти элементы не взаимозаменяемы.

| Механизм | Когда нужен |
|---|---|
| Middleware | До route handler, для generic HTTP processing |
| Guard | Решить, разрешен ли доступ |
| Pipe | Проверить/преобразовать аргументы |
| Interceptor | Обернуть выполнение handler-а |
| Filter | Сформировать ответ на исключение |

Практический ориентир:

- cookie parser, correlation id, simple request logging before Nest handler: middleware;
- user access/roles/permissions: guards;
- DTO validation and `id` parsing: pipes;
- response envelope, timing, caching, metrics: interceptors;
- consistent error body: filters.

Если держать pipeline в голове, исчезает часть типичных споров:

- "Где проверить роль?" В guard или policy, а не в DTO.
- "Где trim lowercase slug?" Pipe or transform near boundary.
- "Где добавить durationMs?" Interceptor.
- "Где изменить формат 404?" Filter.
- "Где парсить cookie?" Middleware.

Для HTTP важно и направление выполнения. Middleware идет к маршруту первым. Guards блокируют handler до его исполнения. Pipes обрабатывают аргументы. Interceptors оборачивают handler и могут выполнить post-processing. Filters включаются, если наружу ушло исключение.

## 8. Middleware

Middleware удобно использовать для вещей уровня HTTP platform:

```ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.headers['x-request-id'] ??= crypto.randomUUID();
    next();
  }
}
```

Подключение на уровне module:

```ts
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
```

Или глобально:

```ts
app.use(cookieParser());
```

Middleware не знает о Nest metadata конкретного handler-а так удобно, как guard. Поэтому auth policy через middleware в Nest обычно хуже, чем guard.

## 9. Guards

Guard отвечает на один вопрос: выполнять handler или нет.

```ts
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiTokenGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request>();
    const token = request.headers['x-api-token'];

    if (!token) {
      throw new UnauthorizedException('Missing API token');
    }

    return true;
  }
}
```

Применение:

```ts
@UseGuards(ApiTokenGuard)
@Get('private')
getPrivateData() {}
```

Guards хорошо работают с metadata:

```ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

```ts
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
removeUser() {}
```

Mini best practice: делайте свой `JwtAuthGuard extends AuthGuard('jwt')`, а не разбрасывайте magic string `'jwt'` по контроллерам.

## 10. Interceptors

Interceptor стоит вокруг handler-а. Он видит момент "до" и поток "после".

### Timing and metrics

```ts
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = performance.now();
    const handler = context.getHandler().name;

    return next.handle().pipe(
      tap(() => {
        const durationMs = performance.now() - startedAt;
        console.log({ handler, durationMs });
      }),
    );
  }
}
```

### Response transform

```ts
import { map } from 'rxjs';

export class EnvelopeInterceptor implements NestInterceptor {
  intercept(_: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map((data) => ({
        data,
        timestamp: new Date().toISOString(),
      })),
    );
  }
}
```

### Error mapping

`catchError()` позволяет перехватить ошибку внутри потока. Но не смешивайте роли:

- interceptor может добавить metrics или перевести ошибку внешнего сервиса в доменную;
- exception filter лучше подходит для единого HTTP-формата ошибок.

Interceptors полезны для:

- логирования;
- метрик;
- serialization;
- response envelope;
- caching;
- timeout policy вокруг внешних операций.

Pitfall: если в interceptor запихнуть половину бизнес-логики, handler становится магическим. Читатель не понимает, где реально создается ресурс.

## 11. Exception filters

Nest уже умеет превращать `HttpException` в HTTP-ответ. Filter нужен, когда нужен единый формат, логирование или контроль слоя ошибок.

```ts
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    response.status(status).json({
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message:
        exception instanceof HttpException
          ? exception.message
          : 'Internal server error',
    });
  }
}
```

Регистрация:

```ts
app.useGlobalFilters(new HttpErrorFilter());
```

Что важно:

- выбрасывайте meaningful Nest exceptions: `NotFoundException`, `ConflictException`, `ForbiddenException`;
- не отдавайте наружу stack traces и секреты;
- логируйте unexpected exceptions;
- согласуйте error contract с frontend.

## 12. Authentication and authorization in Nest

### Authentication vs authorization

- Authentication отвечает на вопрос "кто пришел в запросе?".
- Authorization отвечает на вопрос "можно ли этому субъекту выполнить этот handler или use case?".

Для Nest важнее всего место этой логики в pipeline:

- входные данные логина или регистрации приходят в controller через DTO;
- проверка доступа к защищенному handler-у идет через guard;
- данные текущего субъекта удобно доставать param decorator-ом;
- роли, permissions или другой access context удобно передавать через metadata;
- доменные проверки ownership остаются в service, если они зависят от конкретного ресурса.

### Auth guard

Guard может распознать текущего пользователя любым способом, который выбрал проект. В Nest-коде его задача остается одинаковой: достать данные запроса, проверить их и либо пропустить handler, либо выбросить исключение.

```ts
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<Request & {
      user?: AuthUser;
    }>();

    const user = await this.authService.resolveUser(request);

    if (!user) {
      throw new UnauthorizedException();
    }

    request.user = user;
    return true;
  }
}
```

Так controller не знает деталей аутентификации:

```ts
@UseGuards(AuthGuard)
@Get('me')
getMe(@CurrentUser() user: AuthUser) {
  return user;
}
```

### Current user decorator

```ts
export const CurrentUser = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
```

Это маленькая вещь, но она убирает `@Req()` из большинства handlers и делает контракт controller-а яснее.

### Roles and permissions

Nest metadata позволяет связать access policy с handler-ом:

```ts
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
```

```ts
@Roles(Role.Admin)
@UseGuards(AuthGuard, RolesGuard)
@Get('users')
findAllUsers() {}
```

`RolesGuard` читает metadata через `Reflector` и сверяет ее с пользователем в request. Если нужен более точный доступ, идея остается той же: вместо ролей metadata может описывать permissions или policy key.

### Auth pitfalls

- проверять доступ прямо в каждом controller вручную;
- использовать DTO для решения access policy;
- путать ошибку "не распознан субъект" и ошибку "прав не хватает";
- считать guard достаточной заменой ownership-проверке в service;
- протаскивать raw request во все use cases вместо компактного auth context.

### Practical auth module

Nest-only разбиение обычно выглядит так:

```text
auth/
  dto/
  decorators/
  guards/
  auth.controller.ts
  auth.service.ts
  auth.module.ts
```

Controller держит transport-контракт. Guard защищает handlers. Service решает auth use cases. Decorators делают controller чище. Эта композиция важнее конкретного способа хранения сессии или credential-а.

## 13. Data access as Nest providers

Nest не диктует конкретный storage tool. Для него слой данных важен как граница зависимостей.

```ts
@Injectable()
export class MoviesRepository {
  async findById(id: string): Promise<Movie | null> {
    // Call the chosen storage adapter here.
    return null;
  }
}
```

```ts
@Injectable()
export class MoviesService {
  constructor(private readonly moviesRepository: MoviesRepository) {}

  async findOne(id: string) {
    const movie = await this.moviesRepository.findById(id);

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }
}
```

Что здесь важно именно для Nest:

- data provider регистрируется в module;
- service зависит от provider через DI;
- controller зависит от service, а не от storage details;
- в тесте provider можно заменить через `useValue`, `useClass` или override;
- lifecycle hook можно использовать, если provider должен открыть или закрыть ресурс.

### Repository boundary

Repository boundary полезна, если она делает use case понятнее:

- прячет сложный query shape;
- дает бизнес-имя операции;
- ограничивает то, что service знает о storage adapter;
- делает мок зависимости точным.

Не надо создавать слой ради слоя. Если новый provider только повторяет названия методов нижнего adapter-а и ничего не проясняет, он не улучшил Nest-архитектуру.

## 14. Config management

Конфиги лучше держать централизованно.

```ts
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
  ],
})
export class AppModule {}
```

Использование:

```ts
const port = configService.get<number>('PORT', 3000);
const publicUrl = configService.getOrThrow<string>('PUBLIC_URL');
```

Для модулей лучше выносить config factory:

```ts
export const getAppConfig = (config: ConfigService) => ({
  publicUrl: config.getOrThrow<string>('PUBLIC_URL'),
  requestTimeoutMs: config.get<number>('REQUEST_TIMEOUT_MS', 5000),
});
```

```ts
FeatureModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: getAppConfig,
});
```

Что хранить в env:

- URLs;
- secrets;
- timeouts;
- ports;
- CORS origins;
- cookie domain and secure policy;
- external service credentials.

Что не хранить в env как бизнес-таблицу:

- роли продукта;
- тарифные правила;
- большие JSON-конфиги, которыми должен управлять бизнес.

Production best practice: валидируйте environment на старте. Падение при boot из-за отсутствующего обязательного значения лучше, чем загадочные 500 после первого запроса.

## 15. Async patterns

### async/await

Большая часть прикладного кода в Nest читается через `async/await`.

```ts
async findOne(id: string) {
  const movie = await this.prisma.movie.findUnique({ where: { id } });

  if (!movie) {
    throw new NotFoundException('Movie not found');
  }

  return movie;
}
```

Не забывайте `await`, если вам нужно ловить ошибку в текущем `try/catch`, а не отдавать raw rejected Promise дальше.

### RxJS

RxJS появляется в Nest не случайно:

- interceptors возвращают `Observable`;
- `HttpService` из `@nestjs/axios` возвращает Observable;
- microservice client patterns тоже могут использовать reactive flow.

Когда нужен обычный Promise из `HttpService`, используйте `firstValueFrom`:

```ts
const response = await firstValueFrom(
  this.httpService.get<ArtistResponse>(url, {
    headers: { Authorization: `Bearer ${token}` },
  }),
);
```

Не переписывайте весь сервис на RxJS только потому, что один adapter его использует. Выберите форму, которая делает use case яснее.

### Cron, interval, timeout

Из материалов:

- `@Cron()` запускает задачу по расписанию;
- `@Interval()` повторяет задачу через интервал;
- `@Timeout()` запускает один раз после delay.

Cron годится для периодической синхронизации, reminders и cleanup. Но это другой lifecycle, чем обычный HTTP handler: отдельно продумайте повторный запуск, ошибки и поведение при нескольких экземплярах приложения.

## 16. Custom decorators and composition

Custom decorators are one of the most practical Nest tools. They let controllers say what they mean instead of repeating request plumbing.

Param decorator:

```ts
export const UserAgent = createParamDecorator(
  (_: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<Request>();
    return request.headers['user-agent'];
  },
);
```

```ts
@Get('profile')
getProfile(@UserAgent() userAgent?: string) {
  return { userAgent };
}
```

Decorator composition is useful when one route convention always means several Nest decorators:

```ts
export function PrivateRoute(...roles: Role[]) {
  return applyDecorators(
    Roles(...roles),
    UseGuards(AuthGuard, RolesGuard),
  );
}
```

```ts
@PrivateRoute(Role.Admin)
@Delete(':id')
remove(@Param('id') id: string) {}
```

Mini best practices:

- wrap repeated Nest metadata and guard combinations;
- keep decorator names explicit;
- do not hide business writes inside decorators;
- prefer one readable composite decorator over five copy-pasted decorators on every protected handler.

## 17. WebSockets

WebSockets нужны, когда сервер должен сам пушить события клиенту:

- chat;
- live notifications;
- collaborative editing;
- dashboards with realtime updates.

В Nest entry point для WebSocket называется gateway.

```ts
@WebSocketGateway()
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: MessageBroadcaster;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: ConnectedClient) {
    console.log('connected', client.id);
  }

  handleDisconnect(client: ConnectedClient) {
    console.log('disconnected', client.id);
  }

  @SubscribeMessage('send')
  async send(@MessageBody() dto: SendMessageDto) {
    const message = await this.chatService.createMessage(dto);
    this.server.emit('messages', message);
    return message;
  }
}
```

Хорошая новость: services и DI остаются теми же. Меняется transport adapter и способ получения/отправки событий.

Production notes:

- валидируйте payload;
- продумайте auth на connection and event level;
- не транслируйте всем то, что должно уйти room/channel;
- при нескольких instances нужен adapter/infra strategy для fanout.

## 18. Microservices

Исходные материалы microservices в основном упоминают. В Nest это еще один transport mode, где похожая архитектура работает не через HTTP route, а через message patterns.

```ts
async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
    },
  );

  await app.listen();
}
```

```ts
@Controller()
export class MathController {
  @MessagePattern({ cmd: 'sum' })
  sum(values: number[]) {
    return values.reduce((total, value) => total + value, 0);
  }
}
```

Микросервис не равен "мы разрезали папки". Он нужен, когда появились самостоятельные deployment, ownership, scaling или integration boundaries.

Не торопитесь уносить auth, users и billing в разные processes, если команда пока не может обеспечить:

- observability across services;
- retries and idempotency;
- contracts and versioning;
- failure handling;
- deployment discipline.

Nest дает transports and client proxies. Архитектурную цену распределенной системы он не отменяет.

## 19. Работа с файлами

Upload:

```ts
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
upload(
  @UploadedFile(
    new ParseFilePipe({
      validators: [
        new FileTypeValidator({ fileType: /image\/(png|jpeg|webp)$/ }),
        new MaxFileSizeValidator({ maxSize: 10_000_000 }),
      ],
    }),
  )
  file: UploadedFilePayload,
) {
  return this.filesService.upload(file);
}
```

Из практики материалов:

- `FileInterceptor` вытаскивает multipart file;
- `@UploadedFile()` дает файл handler-у;
- file validators можно встроить в `ParseFilePipe`;
- статическую раздачу можно включить через `ServeStaticModule`.

Главная Nest-идея здесь та же: transport-specific parsing stays near the controller, а use case получает уже понятный аргумент.

## 20. Dynamic modules

Dynamic module полезен, когда модуль требует конфигурацию.

```ts
AuditModule.forRoot({
  enabled: true,
  context: 'movies-api',
});
```

или:

```ts
AuditModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    enabled: config.get<boolean>('AUDIT_ENABLED', true),
    context: config.get<string>('APP_NAME', 'api'),
  }),
});
```

Под капотом dynamic module обычно:

- создает options provider;
- регистрирует providers;
- exports нужный service;
- возвращает `DynamicModule`.

Это полезно для reusable internal modules и библиотек. Не превращайте каждую фичу в dynamic module. Если `MoviesModule` не требует вариантов конфигурации, обычный module проще.

## 21. Testing

### Unit tests

Unit test проверяет класс в изоляции.

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    MoviesService,
    {
      provide: MoviesRepository,
      useValue: {
        findById: async () => null,
        create: async (dto: CreateMovieDto) => ({ id: 'movie-1', ...dto }),
      },
    },
  ],
}).compile();

service = moduleRef.get(MoviesService);
```

Что unit-testить:

- branching business rules;
- errors;
- serialization decisions;
- service logic;
- guards/policies where behavior matters.

Что не надо превращать в unit circus:

- каждый trivial getter;
- фреймворк сам по себе;
- "проверили, что мок вернул то, что мок настроили вернуть" без своей логики.

### Controller tests

Controller unit test полезен, если вы хотите проверить delegation/contract around handler. Обычно service tests несут больше пользы, если controller тонкий.

### E2E tests

E2E поднимает приложение и бьет в HTTP как клиент.

```ts
beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.init();
});

```

E2E особенно нужны для:

- auth flows;
- validation;
- status codes;
- filters/interceptors wiring;
- module wiring;
- route protection.

### Testing best practices

- тестовые env отдельно от production;
- clean shared state;
- external boundaries fake where the Nest test does not target them;
- проверяйте not only happy path;
- global pipes in tests должны совпадать с app bootstrap, иначе e2e врет.

## 22. Production practices

### Validation everywhere at boundaries

Валидируйте:

- HTTP body/query/params;
- WebSocket payload;
- env;
- payload, которому не доверяете.

### Security baseline

Минимальный backend baseline:

- CORS allowlist, а не бездумная `*` при credentials;
- rate limiting на auth and abuse-prone endpoints;
- secure cookie policy;
- secrets out of repo;
- secret handling;
- explicit access rules;
- avoid leaking stack traces.

### Logging

Nest `Logger` лучше `console.log` как общий стиль. Логируйте:

- unexpected errors;
- request id / correlation id;
- provider failures;
- scheduled task failures;
- auth anomalies carefully, без токенов и паролей.

Материалы показывают custom logger, который пишет в файл. Для production часто удобнее structured logs в stdout + collector. Важнее не место файла, а то, чтобы логи были структурированы, доступны и не утекали секреты.

Например, для link shortener useful log context выглядит так:

```ts
this.logger.log(
  `Link created linkId=${link.id} ownerId=${userId}`,
  LinksService.name,
);
```

Но credentials, secrets, cookie values and private data в лог не попадают. "Полезно для отладки" не оправдывает постоянную утечку секретов.

### Error handling

Согласуйте:

- error shape;
- mapping domain errors to HTTP;
- retry behavior for failing providers where it is required;
- metrics for 5xx;
- alerting criteria.

### Scaling

Nest scale plan обычно идет так:

1. модульность и границы providers;
2. pagination and query discipline;
3. cache where justified;
4. вынос долгой работы из request handler-а;
5. horizontal stateless app instances;
6. разделение сервисов только после появления настоящих границ.

### CORS

CORS не "включается для галочки". При cookie-based refresh flow нужны credentials and correct origins. При wildcards и credentials легко получить сломанную или небезопасную конфигурацию.

### API versioning

Nest поддерживает versioning by URI, headers and other strategies.

```ts
app.enableVersioning({
  type: VersioningType.URI,
  defaultVersion: '1',
});
```

Версионирование важно, когда API уже имеет клиентов и вы меняете контракт несовместимо.

## 23. Реальный mini-project: short links

Практический проект из материалов хорошо показывает, как части Nest складываются вместе.

### Domain

- user регистрируется;
- user создает short link;
- public route по `shortCode` делает redirect;
- каждый переход создает click;
- statistics endpoint группирует клики по browser and country.

### Почему архитектура там полезна

- auth module отвечает за tokens and user identity;
- links module отвечает за создание/удаление ссылок;
- app/root handler делает public redirect;
- statistics module не смешивается с links CRUD;
- common decorators дают `ClientIp` and `UserAgent`;
- data providers связывают use cases с хранением данных.

### Мини-проверки, которые стоит добавить

- short code collision handling;
- ownership check on delete;
- pagination for link list/statistics;
- typed response DTO;
- e2e tests for redirect and auth protection;
- validation and sanitization around URLs;
- avoid relying on fake local dev IP in production code path.

## 24. Частые ошибки новичков

1. Писать всю логику в controller.
2. Считать DTO обычным TypeScript type и не включать runtime validation.
3. Экспортировать все providers из каждого module.
4. Делать `@Global()` для всего, чтобы "не импортировать".
5. Возвращать наружу внутреннюю модель без response contract.
6. Использовать middleware вместо guards для authorization policy.
7. Ловить каждую ошибку `try/catch` и возвращать `null`.
8. Не различать `401 Unauthorized` и `403 Forbidden`.
9. Создавать giant `CommonService`, куда стекается все.
10. Забывать pagination, а потом отдавать весь dataset.
11. Смешивать config access через `process.env` по всему проекту.
12. Не тестировать wiring: validation, auth, status codes.
13. Думать, что microservices автоматически делают архитектуру лучше.
14. Подменять repository слоем без смысла, только добавляя boilerplate.
15. Не документировать API, пока frontend уже начал угадывать payloads.

## 25. Roadmap изучения NestJS

### Stage 1: фундамент

- modules;
- controllers;
- providers/services;
- DI;
- DTO;
- validation;
- pipes;
- базовый CRUD через controllers, services и providers.

### Stage 2: request pipeline

- middleware;
- guards;
- interceptors;
- filters;
- custom decorators;
- error contract;
- decorator composition.

### Stage 3: real backend

- auth guards;
- access metadata;
- roles and permissions;
- config module;
- provider boundaries;
- testing module;
- unit and e2e tests;
- logs, CORS, security baseline.

### Stage 4: extra transports and scaling

- WebSockets for realtime;
- cron with clear limits;
- microservices only with real deployment boundaries.

## 26. Production backend structure recommendation

Для большинства рабочих REST backends начните так:

```text
src/
  main.ts
  app.module.ts
  config/
    app.config.ts
  infra/
    persistence/
    integrations/
  modules/
    auth/
    users/
    links/
    statistics/
  common/
    decorators/
    guards/
    filters/
    interceptors/
    pipes/
    types/
```

Внутри каждой фичи:

```text
links/
  dto/
  links.controller.ts
  links.service.ts
  links.module.ts
  links.repository.ts   # only when useful
```

Если проект крупнее, добавляйте:

- policy layer for authorization decisions;
- domain events;
- application use cases;
- repository interfaces only where substitution or boundary pays off.

## 27. Финальные советы по архитектуре

- Держите transport thin and services explicit.
- Делайте dependencies visible through constructors.
- Сначала формируйте контракт, потом persistence shortcut.
- Не путайте Nest abstractions с магией: под ними HTTP, database, sockets and Node event loop.
- Выносите общие cross-cutting concerns в правильный механизм, а не в copy-paste.
- Ошибки, access policy и validation это часть API design, а не косметика.
- Если фича растет, модуль должен стать понятнее, а не просто больше.

NestJS особенно хорош не тогда, когда вы знаете названия всех декораторов, а когда умеете выбрать правильное место для следующей строки кода.

## 28. Что было добавлено сверх исходников

Исходники дали практическую основу по Nest:

- modules/controllers/services/DI;
- REST, DTO, validation, pipes;
- guards/interceptors/filters/middleware;
- custom decorators and access metadata;
- WebSocket gateways and microservice handlers;
- testing module and e2e wiring;
- dynamic modules, files, CORS, cron, versioning, logging;
- structure examples through a short-link domain.

По официальной документации NestJS дополнены и уточнены:

- provider scopes;
- lifecycle hooks and shutdown;
- authorization through guards and metadata;
- microservices entry pattern;
- env validation and production baseline notes.
