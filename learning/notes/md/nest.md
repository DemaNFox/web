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
5. Repository, Prisma или TypeORM работают с хранилищем.
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
- REST, GraphQL, WebSockets и microservices используют похожие идеи;
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

`nest g resource` особенно удобен для старта фичи: он может создать module, controller/service или resolver/gateway в зависимости от выбранного transport. После генерации ресурс почти всегда надо почистить:

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
- Swagger setup;
- Helmet;
- глобальный logger;
- глобальные filters/interceptors;
- версионирование API.

`main.ts` не должен превращаться в свалку. Настройку Swagger, логгера или CORS удобно выносить в небольшие функции вроде `setupSwagger(app)`.

## 4. Архитектурное ядро

### Modules

Модуль описывает кусок приложения и его зависимости.

```ts
import { Module } from '@nestjs/common';
import { PrismaModule } from '../infra/prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
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
import { PrismaService } from '../infra/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
      select: { id: true },
    });

    if (exists) {
      throw new ConflictException('User with this email already exists');
    }

    return this.prisma.user.create({
      data: dto,
    });
  }
}
```

Сервис не обязан быть "одна таблица = один сервис". В хорошем проекте сервис часто выражает use case: `AuthService`, `LinksService`, `BillingService`, `StatisticsService`.

### Dependency Injection

Nest сам создает зависимости через container:

```ts
constructor(
  private readonly prisma: PrismaService,
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

Особенно осторожно со scope у gateways, Passport strategies и scheduler-like компонентов: им нужен singleton-style lifecycle.

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
  prisma/
    prisma.module.ts
    prisma.service.ts
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
    prisma/
    redis/
    infra.module.ts
  common/
    decorators/
    guards/
    strategies/
    utils/
  config/
  app.module.ts
  main.ts
```

Это хороший вариант, когда:

- transport/API фич много;
- инфраструктурные клиенты не хочется смешивать с доменом;
- часть сервисов общая для REST, GraphQL, jobs или WebSockets.

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
- JWT/roles/permissions: guards;
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

## 12. Authentication and authorization

### Authentication vs authorization

- Authentication: кто пользователь?
- Authorization: что ему разрешено?

JWT отвечает не за authorization целиком. JWT подтверждает identity и часть claims. Решение "можно ли удалить этот invoice" все равно живет в policy/guard/service.

### JWT flow

Практический flow из материалов:

1. регистрация проверяет уникальность email;
2. пароль хешируется через `argon2` или `bcrypt`;
3. сервер выпускает access token и refresh token;
4. access token идет клиенту для `Authorization: Bearer ...`;
5. refresh token можно хранить в `HttpOnly` cookie;
6. refresh endpoint проверяет cookie и выдает новую пару/новый access token;
7. logout очищает refresh cookie.

Пример signing helper:

```ts
private generateTokens(userId: string) {
  const payload = { sub: userId };

  return {
    accessToken: this.jwtService.sign(payload, {
      expiresIn: this.accessTtl,
    }),
    refreshToken: this.jwtService.sign(payload, {
      expiresIn: this.refreshTtl,
    }),
  };
}
```

На практике стоит продумать:

- rotation refresh tokens;
- revoke/logout strategy;
- отдельный secret/key policy;
- issuer/audience, если система распределенная;
- куда попадет токен в browser app;
- CSRF-риск, если cookie участвует в auth.

### Passport strategy

Passport в Nest позволяет вынести извлечение и проверку токена в strategy:

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string }) {
    return this.usersService.findAuthUser(payload.sub);
  }
}
```

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
```

После успешной strategy Passport кладет результат `validate()` в `request.user`. Отсюда удобно сделать param decorator:

```ts
export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user: AuthUser }>();
    return request.user;
  },
);
```

### Roles

Roles хорошо подходят для крупного уровня доступа:

- user;
- moderator;
- admin.

```ts
@Roles(Role.Admin)
@UseGuards(JwtAuthGuard, RolesGuard)
@Get('users')
findAllUsers() {}
```

### Permissions

Когда ролей становится слишком много, переходите к permissions/claims/policies:

- `links:create`;
- `links:delete:any`;
- `users:ban`;
- `billing:refund`.

Roles отвечают "к какому классу относится субъект". Permissions отвечают "какое действие он может выполнить". В production permission model обычно устойчивее, чем вечное добавление ролей под каждую кнопку.

### Auth pitfalls

- хранить raw password;
- возвращать password hash из `getMe`;
- различать "email не существует" и "пароль неверный" в login error;
- хранить JWT secret в репозитории;
- путать 401 и 403;
- верить роли из body запроса;
- делать guard единственным местом доменной проверки ownership.

Например, guard может сказать "пользователь авторизован", но сервис все равно должен проверить, что конкретная ссылка принадлежит этому пользователю.

### A practical auth split

Хороший auth module обычно делится так:

```text
auth/
  dto/
    register.dto.ts
    login.dto.ts
  guards/
    jwt-auth.guard.ts
    roles.guard.ts
  strategies/
    jwt.strategy.ts
  auth.controller.ts
  auth.service.ts
  auth.module.ts
```

В контроллере удобно оставить только transport:

```ts
@Post('login')
@HttpCode(HttpStatus.OK)
login(
  @Body() dto: LoginDto,
  @Res({ passthrough: true }) response: Response,
) {
  return this.authService.login(dto, response);
}
```

В сервисе живут:

- поиск пользователя;
- password verify;
- token issue/refresh;
- cookie setup;
- ошибки use case.

Strategy отвечает за чтение access token from request and loading auth user. Guard включает strategy on protected routes. Decorator делает `CurrentUser` ergonomic. Это и есть "как части работают вместе", а не просто набор auth snippets.

## 13. Database layer

### Prisma

Материалы много используют Prisma. Базовый паттерн:

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
```

```ts
async create(dto: CreateLinkDto, userId: string) {
  const shortCode = randomBytes(5).toString('hex');

  return this.prisma.link.create({
    data: {
      originalUrl: dto.originalUrl,
      shortCode,
      user: {
        connect: { id: userId },
      },
    },
  });
}
```

Полезные Prisma приемы из практики:

- `select` ограничивает возвращаемые поля;
- `include` поднимает relations;
- `connect` связывает существующие записи;
- unique fields позволяют использовать `findUnique`;
- schema relations должны отражать реальную ownership-модель.

### TypeORM

TypeORM в материалах тоже разбирается:

- entities через decorators;
- repositories через DI;
- columns and relations;
- `OneToMany`, `ManyToMany`, `OneToOne`;
- TypeORM config через `ConfigModule`.

Пример repository-oriented service:

```ts
@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(MovieEntity)
    private readonly moviesRepository: Repository<MovieEntity>,
  ) {}

  create(dto: CreateMovieDto) {
    const movie = this.moviesRepository.create(dto);
    return this.moviesRepository.save(movie);
  }
}
```

### Sequelize

Один из исходных практических блоков строит приложение через Sequelize and PostgreSQL. В Nest это тоже module/provider integration:

- подключаете database module/config;
- описываете models and relations;
- инжектите model/repository abstraction в service;
- оставляете controller тонким.

Сам ORM не меняет главную Nest-идею. Ошибка начинается не с выбора Prisma, TypeORM или Sequelize, а когда persistence details протекают в каждый controller и response contract.

### Repository pattern

Нужен ли отдельный repository слой поверх Prisma/TypeORM? Ответ зависит от сложности.

Делайте repository, если:

- persistence logic повторяется;
- нужны сложные query methods с бизнес-именами;
- один use case не должен знать детали ORM;
- хотите изолировать transaction boundaries.

Не делайте механический wrapper `UserRepository.findUnique()` вокруг каждого Prisma method только ради слоя. Это добавляет код без смысла.

### Transactions

Транзакция нужна, когда несколько изменений должны случиться вместе:

- создать order и order items;
- списать balance и записать ledger event;
- создать link и initial audit record.

Prisma-style:

```ts
await this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData });

  await tx.orderItem.createMany({
    data: items.map((item) => ({
      orderId: order.id,
      productId: item.productId,
      quantity: item.quantity,
    })),
  });
});
```

Транзакция не исправляет плохую модель конкуренции автоматически. Для money-like доменов думайте про idempotency, unique constraints и race conditions.

### Local database in development

В исходниках PostgreSQL часто поднимается через Docker. Это хороший базовый dev setup: приложение живет локально, база воспроизводима, credentials идут из env.

```yaml
services:
  postgres:
    image: postgres:16
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: nest_app
      POSTGRES_USER: nest
      POSTGRES_PASSWORD: nest
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

Не делайте production password из tutorial compose. Смысл примера в воспроизводимости локальной среды, а не в готовой security policy.

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
const jwtSecret = configService.getOrThrow<string>('JWT_SECRET');
```

Для модулей лучше выносить config factory:

```ts
export const getJwtConfig = (config: ConfigService): JwtModuleOptions => ({
  secret: config.getOrThrow<string>('JWT_SECRET'),
  signOptions: {
    algorithm: 'HS256',
  },
});
```

```ts
JwtModule.registerAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: getJwtConfig,
});
```

Что хранить в env:

- URLs;
- secrets;
- TTL;
- ports;
- CORS origins;
- cookie domain and secure policy;
- external service credentials.

Что не хранить в env как бизнес-таблицу:

- роли продукта;
- тарифные правила;
- большие JSON-конфиги, которыми должен управлять бизнес.

Production best practice: валидируйте environment на старте. Падение при boot из-за отсутствующего `DATABASE_URL` лучше, чем загадочные 500 после первого запроса.

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

Cron годится для периодической синхронизации, reminders, cleanup. Он не заменяет reliable queue, если задача должна пережить рестарт, retry и горизонтальное масштабирование.

### Background jobs

Для тяжелых и надежных background tasks используйте queue:

- email sending;
- transcoding;
- image processing;
- webhook retry;
- imports/exports.

Практическая логика:

- HTTP endpoint быстро принимает команду;
- пишет job в очередь;
- worker обрабатывает;
- status/result отслеживается отдельно.

## 16. OpenAPI and Swagger

Swagger в Nest полезен не как "красивый экран", а как контракт с frontend и QA.

```ts
const config = new DocumentBuilder()
  .setTitle('Movies API')
  .setDescription('Movies backend')
  .setVersion('1.0.0')
  .addBearerAuth()
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('docs', app, document);
```

DTO:

```ts
export class CreateMovieDto {
  @ApiProperty({
    description: 'Movie title',
    example: 'Fight Club',
  })
  title!: string;

  @ApiPropertyOptional({
    description: 'Poster URL',
    example: 'https://storage.example.com/posters/123.png',
  })
  posterUrl?: string;
}
```

Endpoint:

```ts
@ApiOperation({ summary: 'Create movie' })
@ApiCreatedResponse({ type: MovieResponseDto })
@ApiBadRequestResponse({ description: 'Invalid input' })
@Post()
create(@Body() dto: CreateMovieDto) {}
```

Mini best practices:

- описывайте request and response DTO;
- добавляйте bearer auth metadata для protected routes;
- не документируйте успех и забывайте ошибки;
- публикуйте JSON/YAML spec, если frontend генерирует types/client.

## 17. GraphQL в NestJS

GraphQL в материалах появляется как отдельный transport:

- вместо controllers используются resolvers;
- query получает данные;
- mutation меняет состояние;
- модели описываются через `@ObjectType()` и `@Field()`;
- вход описывается через `@InputType()`;
- все запросы идут через GraphQL endpoint.

```ts
@ObjectType()
export class UserModel {
  @Field(() => ID)
  id!: string;

  @Field()
  email!: string;
}
```

```ts
@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @MinLength(8)
  password!: string;
}
```

```ts
@Resolver(() => UserModel)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  @Query(() => [UserModel], { name: 'users' })
  findAll() {
    return this.usersService.findAll();
  }
}
```

HTTP `@Req()` and `@Res()` do not move into GraphQL unchanged. Request/response usually come through GraphQL context. Guards for GraphQL also need `GqlExecutionContext` when they extract request data.

GraphQL pitfall: GraphQL schema is a public contract too. If you expose `password` field in a model just because Prisma model has it, the transport will happily serve it when queried.

## 18. WebSockets

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
  server!: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    console.log('connected', client.id);
  }

  handleDisconnect(client: Socket) {
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

## 19. Microservices

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

## 20. Работа с файлами

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
  file: Express.Multer.File,
) {
  return this.filesService.upload(file);
}
```

Из практики материалов:

- `FileInterceptor` вытаскивает multipart file;
- `@UploadedFile()` дает файл handler-у;
- file validators можно встроить в `ParseFilePipe`;
- статическую раздачу можно включить через `ServeStaticModule`.

Но хранить production uploads на локальном диске приложения часто плохая идея. Для обычного web backend лучше объектное хранилище и контролируемые public/private URLs.

## 21. External HTTP with HttpModule

`HttpModule` нужен, когда backend ходит в чужой API:

- Spotify;
- payment provider;
- geo service;
- internal service.

Паттерн:

```ts
@Module({
  imports: [HttpModule.register({ timeout: 5000 })],
  providers: [SpotifyService],
  exports: [SpotifyService],
})
export class SpotifyModule {}
```

```ts
const response = await firstValueFrom(
  this.httpService.get<SpotifyArtist>(`/artists/${id}`, {
    headers: {
      Authorization: `Bearer ${this.accessToken}`,
    },
  }),
);
```

Реальная ценность wrapper service:

- один раз реализовать authentication внешнего API;
- централизовать headers/timeouts/error mapping;
- спрятать внешний shape данных от остального приложения.

Pitfall: не тащите response object чужого API насквозь до своего controller-а без выбора полей. Внешний контракт не должен случайно стать вашим контрактом.

## 22. Dynamic modules

Dynamic module полезен, когда модуль требует конфигурацию.

```ts
SpotifyModule.forRoot({
  clientId: '...',
  clientSecret: '...',
});
```

или:

```ts
SpotifyModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    clientId: config.getOrThrow('SPOTIFY_CLIENT_ID'),
    clientSecret: config.getOrThrow('SPOTIFY_CLIENT_SECRET'),
  }),
});
```

Под капотом dynamic module обычно:

- создает options provider;
- регистрирует providers;
- exports нужный service;
- возвращает `DynamicModule`.

Это полезно для reusable internal modules и библиотек. Не превращайте каждую фичу в dynamic module. Если `MoviesModule` не требует вариантов конфигурации, обычный module проще.

## 23. Testing

### Unit tests

Unit test проверяет класс в изоляции.

```ts
const moduleRef = await Test.createTestingModule({
  providers: [
    LinksService,
    {
      provide: PrismaService,
      useValue: {
        link: {
          create: jest.fn(),
          findUnique: jest.fn(),
        },
      },
    },
  ],
}).compile();

service = moduleRef.get(LinksService);
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

it('POST /links creates a link', async () => {
  await request(app.getHttpServer())
    .post('/links')
    .send({ originalUrl: 'https://example.com' })
    .expect(201);
});
```

E2E особенно нужны для:

- auth flows;
- validation;
- status codes;
- filters/interceptors wiring;
- DB integration;
- route protection.

### Testing best practices

- тестовые env отдельно от production;
- clean database state;
- external APIs mock/fake;
- проверяйте not only happy path;
- global pipes in tests должны совпадать с app bootstrap, иначе e2e врет.

## 24. Production practices

### Validation everywhere at boundaries

Валидируйте:

- HTTP body/query/params;
- WebSocket payload;
- GraphQL inputs;
- env;
- external payload, которому не доверяете.

### Security baseline

Минимальный backend baseline:

- `helmet` before route setup where relevant;
- CORS allowlist, а не бездумная `*` при credentials;
- rate limiting на auth and abuse-prone endpoints;
- secure cookie policy;
- secrets out of repo;
- password hashing;
- least privilege database credentials;
- avoid leaking stack traces.

### Logging

Nest `Logger` лучше `console.log` как общий стиль. Логируйте:

- unexpected errors;
- request id / correlation id;
- external service failures;
- background job failures;
- auth anomalies carefully, без токенов и паролей.

Материалы показывают custom logger, который пишет в файл. Для production часто удобнее structured logs в stdout + collector. Важнее не место файла, а то, чтобы логи были структурированы, доступны и не утекали секреты.

Например, для link shortener useful log context выглядит так:

```ts
this.logger.log(
  `Link created linkId=${link.id} ownerId=${userId}`,
  LinksService.name,
);
```

Но access token, refresh token, password, cookie value and card data в лог не попадают. "Полезно для отладки" не оправдывает постоянную утечку секретов.

### Error handling

Согласуйте:

- error shape;
- mapping domain errors to HTTP;
- retry behavior for external services;
- metrics for 5xx;
- alerting criteria.

### Scaling

Nest scale plan обычно идет так:

1. модульность и database indexes;
2. pagination and query discipline;
3. cache where justified;
4. background jobs;
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

## 25. Реальный mini-project: short links

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
- Prisma relations связывают user, link, click.

### Мини-проверки, которые стоит добавить

- short code collision handling;
- ownership check on delete;
- pagination for link list/statistics;
- typed response DTO;
- e2e tests for redirect and auth protection;
- validation and sanitization around URLs;
- avoid relying on fake local dev IP in production code path.

## 26. Частые ошибки новичков

1. Писать всю логику в controller.
2. Считать DTO обычным TypeScript type и не включать runtime validation.
3. Экспортировать все providers из каждого module.
4. Делать `@Global()` для всего, чтобы "не импортировать".
5. Возвращать ORM model с password hash.
6. Использовать middleware вместо guards для authorization policy.
7. Ловить каждую ошибку `try/catch` и возвращать `null`.
8. Не различать `401 Unauthorized` и `403 Forbidden`.
9. Создавать giant `CommonService`, куда стекается все.
10. Забывать `select` and pagination, а потом отдавать весь dataset.
11. Смешивать config access через `process.env` по всему проекту.
12. Не тестировать wiring: validation, auth, status codes.
13. Думать, что microservices автоматически делают архитектуру лучше.
14. Подменять repository слоем без смысла, только добавляя boilerplate.
15. Не документировать API, пока frontend уже начал угадывать payloads.

## 27. Roadmap изучения NestJS

### Stage 1: фундамент

- modules;
- controllers;
- providers/services;
- DI;
- DTO;
- validation;
- pipes;
- basic Prisma or TypeORM CRUD.

### Stage 2: request pipeline

- middleware;
- guards;
- interceptors;
- filters;
- custom decorators;
- error contract;
- Swagger.

### Stage 3: real backend

- JWT auth;
- Passport;
- roles and permissions;
- config module;
- transactions;
- testing module;
- unit and e2e tests;
- logs, CORS, security baseline.

### Stage 4: extra transports and scaling

- GraphQL if product benefits from it;
- WebSockets for realtime;
- queues and background jobs;
- cron with clear limits;
- external API wrappers;
- microservices only with real deployment boundaries.

## 28. Production backend structure recommendation

Для большинства рабочих REST backends начните так:

```text
src/
  main.ts
  app.module.ts
  config/
    app.config.ts
    jwt.config.ts
  infra/
    prisma/
    storage/
    mail/
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
- job processors;
- domain events;
- application use cases;
- repository interfaces only where substitution or boundary pays off.

## 29. Финальные советы по архитектуре

- Держите transport thin and services explicit.
- Делайте dependencies visible through constructors.
- Сначала формируйте контракт, потом persistence shortcut.
- Не путайте Nest abstractions с магией: под ними HTTP, database, sockets and Node event loop.
- Выносите общие cross-cutting concerns в правильный механизм, а не в copy-paste.
- Ошибки, access policy и validation это часть API design, а не косметика.
- Если фича растет, модуль должен стать понятнее, а не просто больше.

NestJS особенно хорош не тогда, когда вы знаете названия всех декораторов, а когда умеете выбрать правильное место для следующей строки кода.

## 30. Что было добавлено сверх исходников

Исходники дали практическую основу по:

- modules/controllers/services/DI;
- REST, DTO, validation, pipes;
- guards/interceptors/filters/middleware;
- Prisma and TypeORM;
- JWT auth, Passport-like strategy flow, roles;
- Swagger, GraphQL, WebSockets;
- unit/e2e testing;
- HttpModule, dynamic modules, files, CORS, cron, versioning, logging;
- short-link project and structure examples.

По официальной документации NestJS дополнены и уточнены:

- provider scopes;
- lifecycle hooks and shutdown;
- permission/claims framing for authorization;
- microservices entry pattern;
- queues as a background-job tool;
- env validation and security baseline notes.
