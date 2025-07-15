
/**
 * Client
**/

import * as runtime from './runtime/library.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model Page
 * 
 */
export type Page = $Result.DefaultSelection<Prisma.$PagePayload>
/**
 * Model StaffMember
 * 
 */
export type StaffMember = $Result.DefaultSelection<Prisma.$StaffMemberPayload>
/**
 * Model Job
 * 
 */
export type Job = $Result.DefaultSelection<Prisma.$JobPayload>
/**
 * Model SlideShow
 * 
 */
export type SlideShow = $Result.DefaultSelection<Prisma.$SlideShowPayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Users
 * const users = await prisma.user.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Users
   * const users = await prisma.user.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

  /**
   * Add a middleware
   * @deprecated since 4.16.0. For new code, prefer client extensions instead.
   * @see https://pris.ly/d/extensions
   */
  $use(cb: Prisma.Middleware): void

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>


  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.page`: Exposes CRUD operations for the **Page** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Pages
    * const pages = await prisma.page.findMany()
    * ```
    */
  get page(): Prisma.PageDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.staffMember`: Exposes CRUD operations for the **StaffMember** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more StaffMembers
    * const staffMembers = await prisma.staffMember.findMany()
    * ```
    */
  get staffMember(): Prisma.StaffMemberDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.job`: Exposes CRUD operations for the **Job** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Jobs
    * const jobs = await prisma.job.findMany()
    * ```
    */
  get job(): Prisma.JobDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.slideShow`: Exposes CRUD operations for the **SlideShow** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SlideShows
    * const slideShows = await prisma.slideShow.findMany()
    * ```
    */
  get slideShow(): Prisma.SlideShowDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
   * Metrics
   */
  export type Metrics = runtime.Metrics
  export type Metric<T> = runtime.Metric<T>
  export type MetricHistogram = runtime.MetricHistogram
  export type MetricHistogramBucket = runtime.MetricHistogramBucket

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 6.6.0
   * Query Engine version: f676762280b54cd07c770017ed3711ddde35f37a
   */
  export type PrismaVersion = {
    client: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    User: 'User',
    Page: 'Page',
    StaffMember: 'StaffMember',
    Job: 'Job',
    SlideShow: 'SlideShow'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]


  export type Datasources = {
    db?: Datasource
  }

  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "user" | "page" | "staffMember" | "job" | "slideShow"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      Page: {
        payload: Prisma.$PagePayload<ExtArgs>
        fields: Prisma.PageFieldRefs
        operations: {
          findUnique: {
            args: Prisma.PageFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.PageFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>
          }
          findFirst: {
            args: Prisma.PageFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.PageFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>
          }
          findMany: {
            args: Prisma.PageFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>[]
          }
          create: {
            args: Prisma.PageCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>
          }
          createMany: {
            args: Prisma.PageCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.PageCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>[]
          }
          delete: {
            args: Prisma.PageDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>
          }
          update: {
            args: Prisma.PageUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>
          }
          deleteMany: {
            args: Prisma.PageDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.PageUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.PageUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>[]
          }
          upsert: {
            args: Prisma.PageUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$PagePayload>
          }
          aggregate: {
            args: Prisma.PageAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregatePage>
          }
          groupBy: {
            args: Prisma.PageGroupByArgs<ExtArgs>
            result: $Utils.Optional<PageGroupByOutputType>[]
          }
          count: {
            args: Prisma.PageCountArgs<ExtArgs>
            result: $Utils.Optional<PageCountAggregateOutputType> | number
          }
        }
      }
      StaffMember: {
        payload: Prisma.$StaffMemberPayload<ExtArgs>
        fields: Prisma.StaffMemberFieldRefs
        operations: {
          findUnique: {
            args: Prisma.StaffMemberFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.StaffMemberFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>
          }
          findFirst: {
            args: Prisma.StaffMemberFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.StaffMemberFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>
          }
          findMany: {
            args: Prisma.StaffMemberFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>[]
          }
          create: {
            args: Prisma.StaffMemberCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>
          }
          createMany: {
            args: Prisma.StaffMemberCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.StaffMemberCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>[]
          }
          delete: {
            args: Prisma.StaffMemberDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>
          }
          update: {
            args: Prisma.StaffMemberUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>
          }
          deleteMany: {
            args: Prisma.StaffMemberDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.StaffMemberUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.StaffMemberUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>[]
          }
          upsert: {
            args: Prisma.StaffMemberUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$StaffMemberPayload>
          }
          aggregate: {
            args: Prisma.StaffMemberAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateStaffMember>
          }
          groupBy: {
            args: Prisma.StaffMemberGroupByArgs<ExtArgs>
            result: $Utils.Optional<StaffMemberGroupByOutputType>[]
          }
          count: {
            args: Prisma.StaffMemberCountArgs<ExtArgs>
            result: $Utils.Optional<StaffMemberCountAggregateOutputType> | number
          }
        }
      }
      Job: {
        payload: Prisma.$JobPayload<ExtArgs>
        fields: Prisma.JobFieldRefs
        operations: {
          findUnique: {
            args: Prisma.JobFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.JobFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          findFirst: {
            args: Prisma.JobFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.JobFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          findMany: {
            args: Prisma.JobFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>[]
          }
          create: {
            args: Prisma.JobCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          createMany: {
            args: Prisma.JobCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.JobCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>[]
          }
          delete: {
            args: Prisma.JobDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          update: {
            args: Prisma.JobUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          deleteMany: {
            args: Prisma.JobDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.JobUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.JobUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>[]
          }
          upsert: {
            args: Prisma.JobUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$JobPayload>
          }
          aggregate: {
            args: Prisma.JobAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateJob>
          }
          groupBy: {
            args: Prisma.JobGroupByArgs<ExtArgs>
            result: $Utils.Optional<JobGroupByOutputType>[]
          }
          count: {
            args: Prisma.JobCountArgs<ExtArgs>
            result: $Utils.Optional<JobCountAggregateOutputType> | number
          }
        }
      }
      SlideShow: {
        payload: Prisma.$SlideShowPayload<ExtArgs>
        fields: Prisma.SlideShowFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SlideShowFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SlideShowFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>
          }
          findFirst: {
            args: Prisma.SlideShowFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SlideShowFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>
          }
          findMany: {
            args: Prisma.SlideShowFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>[]
          }
          create: {
            args: Prisma.SlideShowCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>
          }
          createMany: {
            args: Prisma.SlideShowCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SlideShowCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>[]
          }
          delete: {
            args: Prisma.SlideShowDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>
          }
          update: {
            args: Prisma.SlideShowUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>
          }
          deleteMany: {
            args: Prisma.SlideShowDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SlideShowUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SlideShowUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>[]
          }
          upsert: {
            args: Prisma.SlideShowUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SlideShowPayload>
          }
          aggregate: {
            args: Prisma.SlideShowAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSlideShow>
          }
          groupBy: {
            args: Prisma.SlideShowGroupByArgs<ExtArgs>
            result: $Utils.Optional<SlideShowGroupByOutputType>[]
          }
          count: {
            args: Prisma.SlideShowCountArgs<ExtArgs>
            result: $Utils.Optional<SlideShowCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasources?: Datasources
    /**
     * Overwrites the datasource url from your schema.prisma file
     */
    datasourceUrl?: string
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Defaults to stdout
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events
     * log: [
     *   { emit: 'stdout', level: 'query' },
     *   { emit: 'stdout', level: 'info' },
     *   { emit: 'stdout', level: 'warn' }
     *   { emit: 'stdout', level: 'error' }
     * ]
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    user?: UserOmit
    page?: PageOmit
    staffMember?: StaffMemberOmit
    job?: JobOmit
    slideShow?: SlideShowOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type GetLogType<T extends LogLevel | LogDefinition> = T extends LogDefinition ? T['emit'] extends 'event' ? T['level'] : never : never
  export type GetEvents<T extends any> = T extends Array<LogLevel | LogDefinition> ?
    GetLogType<T[0]> | GetLogType<T[1]> | GetLogType<T[2]> | GetLogType<T[3]>
    : never

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  /**
   * These options are being passed into the middleware as "params"
   */
  export type MiddlewareParams = {
    model?: ModelName
    action: PrismaAction
    args: any
    dataPath: string[]
    runInTransaction: boolean
  }

  /**
   * The `T` type makes sure, that the `return proceed` is not forgotten in the middleware implementation
   */
  export type Middleware<T = any> = (
    params: MiddlewareParams,
    next: (params: MiddlewareParams) => $Utils.JsPromise<T>,
  ) => $Utils.JsPromise<T>

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserAvgAggregateOutputType = {
    id: number | null
  }

  export type UserSumAggregateOutputType = {
    id: number | null
  }

  export type UserMinAggregateOutputType = {
    id: number | null
    name: string | null
    email: string | null
    password_hash: string | null
    role: string | null
    subscription_plan: string | null
    subscription_status: string | null
    created_at: Date | null
    updated_at: Date | null
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    subscription_current_period_start: Date | null
    subscription_current_period_end: Date | null
    profile_image: string | null
    username: string | null
    phone: string | null
    reset_token: string | null
    reset_token_expires: Date | null
    remember_token: string | null
  }

  export type UserMaxAggregateOutputType = {
    id: number | null
    name: string | null
    email: string | null
    password_hash: string | null
    role: string | null
    subscription_plan: string | null
    subscription_status: string | null
    created_at: Date | null
    updated_at: Date | null
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    subscription_current_period_start: Date | null
    subscription_current_period_end: Date | null
    profile_image: string | null
    username: string | null
    phone: string | null
    reset_token: string | null
    reset_token_expires: Date | null
    remember_token: string | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password_hash: number
    role: number
    subscription_plan: number
    subscription_status: number
    created_at: number
    updated_at: number
    stripe_customer_id: number
    stripe_subscription_id: number
    subscription_current_period_start: number
    subscription_current_period_end: number
    profile_image: number
    username: number
    phone: number
    reset_token: number
    reset_token_expires: number
    remember_token: number
    _all: number
  }


  export type UserAvgAggregateInputType = {
    id?: true
  }

  export type UserSumAggregateInputType = {
    id?: true
  }

  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password_hash?: true
    role?: true
    subscription_plan?: true
    subscription_status?: true
    created_at?: true
    updated_at?: true
    stripe_customer_id?: true
    stripe_subscription_id?: true
    subscription_current_period_start?: true
    subscription_current_period_end?: true
    profile_image?: true
    username?: true
    phone?: true
    reset_token?: true
    reset_token_expires?: true
    remember_token?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password_hash?: true
    role?: true
    subscription_plan?: true
    subscription_status?: true
    created_at?: true
    updated_at?: true
    stripe_customer_id?: true
    stripe_subscription_id?: true
    subscription_current_period_start?: true
    subscription_current_period_end?: true
    profile_image?: true
    username?: true
    phone?: true
    reset_token?: true
    reset_token_expires?: true
    remember_token?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password_hash?: true
    role?: true
    subscription_plan?: true
    subscription_status?: true
    created_at?: true
    updated_at?: true
    stripe_customer_id?: true
    stripe_subscription_id?: true
    subscription_current_period_start?: true
    subscription_current_period_end?: true
    profile_image?: true
    username?: true
    phone?: true
    reset_token?: true
    reset_token_expires?: true
    remember_token?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _avg?: UserAvgAggregateInputType
    _sum?: UserSumAggregateInputType
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: number
    name: string | null
    email: string
    password_hash: string | null
    role: string
    subscription_plan: string | null
    subscription_status: string | null
    created_at: Date
    updated_at: Date
    stripe_customer_id: string | null
    stripe_subscription_id: string | null
    subscription_current_period_start: Date | null
    subscription_current_period_end: Date | null
    profile_image: string | null
    username: string | null
    phone: string | null
    reset_token: string | null
    reset_token_expires: Date | null
    remember_token: string | null
    _count: UserCountAggregateOutputType | null
    _avg: UserAvgAggregateOutputType | null
    _sum: UserSumAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    subscription_plan?: boolean
    subscription_status?: boolean
    created_at?: boolean
    updated_at?: boolean
    stripe_customer_id?: boolean
    stripe_subscription_id?: boolean
    subscription_current_period_start?: boolean
    subscription_current_period_end?: boolean
    profile_image?: boolean
    username?: boolean
    phone?: boolean
    reset_token?: boolean
    reset_token_expires?: boolean
    remember_token?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    subscription_plan?: boolean
    subscription_status?: boolean
    created_at?: boolean
    updated_at?: boolean
    stripe_customer_id?: boolean
    stripe_subscription_id?: boolean
    subscription_current_period_start?: boolean
    subscription_current_period_end?: boolean
    profile_image?: boolean
    username?: boolean
    phone?: boolean
    reset_token?: boolean
    reset_token_expires?: boolean
    remember_token?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    subscription_plan?: boolean
    subscription_status?: boolean
    created_at?: boolean
    updated_at?: boolean
    stripe_customer_id?: boolean
    stripe_subscription_id?: boolean
    subscription_current_period_start?: boolean
    subscription_current_period_end?: boolean
    profile_image?: boolean
    username?: boolean
    phone?: boolean
    reset_token?: boolean
    reset_token_expires?: boolean
    remember_token?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password_hash?: boolean
    role?: boolean
    subscription_plan?: boolean
    subscription_status?: boolean
    created_at?: boolean
    updated_at?: boolean
    stripe_customer_id?: boolean
    stripe_subscription_id?: boolean
    subscription_current_period_start?: boolean
    subscription_current_period_end?: boolean
    profile_image?: boolean
    username?: boolean
    phone?: boolean
    reset_token?: boolean
    reset_token_expires?: boolean
    remember_token?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password_hash" | "role" | "subscription_plan" | "subscription_status" | "created_at" | "updated_at" | "stripe_customer_id" | "stripe_subscription_id" | "subscription_current_period_start" | "subscription_current_period_end" | "profile_image" | "username" | "phone" | "reset_token" | "reset_token_expires" | "remember_token", ExtArgs["result"]["user"]>

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      name: string | null
      email: string
      password_hash: string | null
      role: string
      subscription_plan: string | null
      subscription_status: string | null
      created_at: Date
      updated_at: Date
      stripe_customer_id: string | null
      stripe_subscription_id: string | null
      subscription_current_period_start: Date | null
      subscription_current_period_end: Date | null
      profile_image: string | null
      username: string | null
      phone: string | null
      reset_token: string | null
      reset_token_expires: Date | null
      remember_token: string | null
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'Int'>
    readonly name: FieldRef<"User", 'String'>
    readonly email: FieldRef<"User", 'String'>
    readonly password_hash: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'String'>
    readonly subscription_plan: FieldRef<"User", 'String'>
    readonly subscription_status: FieldRef<"User", 'String'>
    readonly created_at: FieldRef<"User", 'DateTime'>
    readonly updated_at: FieldRef<"User", 'DateTime'>
    readonly stripe_customer_id: FieldRef<"User", 'String'>
    readonly stripe_subscription_id: FieldRef<"User", 'String'>
    readonly subscription_current_period_start: FieldRef<"User", 'DateTime'>
    readonly subscription_current_period_end: FieldRef<"User", 'DateTime'>
    readonly profile_image: FieldRef<"User", 'String'>
    readonly username: FieldRef<"User", 'String'>
    readonly phone: FieldRef<"User", 'String'>
    readonly reset_token: FieldRef<"User", 'String'>
    readonly reset_token_expires: FieldRef<"User", 'DateTime'>
    readonly remember_token: FieldRef<"User", 'String'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
  }


  /**
   * Model Page
   */

  export type AggregatePage = {
    _count: PageCountAggregateOutputType | null
    _avg: PageAvgAggregateOutputType | null
    _sum: PageSumAggregateOutputType | null
    _min: PageMinAggregateOutputType | null
    _max: PageMaxAggregateOutputType | null
  }

  export type PageAvgAggregateOutputType = {
    id: number | null
    parent_id: number | null
    menu_order: number | null
  }

  export type PageSumAggregateOutputType = {
    id: number | null
    parent_id: number | null
    menu_order: number | null
  }

  export type PageMinAggregateOutputType = {
    id: number | null
    title: string | null
    slug: string | null
    status: string | null
    last_updated: Date | null
    created_at: Date | null
    updated_at: Date | null
    parent_id: number | null
    menu_order: number | null
    page_template: string | null
    show_in_menu: boolean | null
    show_in_footer: boolean | null
    meta_title: string | null
    meta_description: string | null
    page_builder_content: string | null
    use_page_builder: boolean | null
    builder_template: string | null
  }

  export type PageMaxAggregateOutputType = {
    id: number | null
    title: string | null
    slug: string | null
    status: string | null
    last_updated: Date | null
    created_at: Date | null
    updated_at: Date | null
    parent_id: number | null
    menu_order: number | null
    page_template: string | null
    show_in_menu: boolean | null
    show_in_footer: boolean | null
    meta_title: string | null
    meta_description: string | null
    page_builder_content: string | null
    use_page_builder: boolean | null
    builder_template: string | null
  }

  export type PageCountAggregateOutputType = {
    id: number
    title: number
    slug: number
    status: number
    last_updated: number
    content: number
    created_at: number
    updated_at: number
    parent_id: number
    menu_order: number
    page_template: number
    show_in_menu: number
    show_in_footer: number
    meta_title: number
    meta_description: number
    page_builder_content: number
    use_page_builder: number
    builder_template: number
    _all: number
  }


  export type PageAvgAggregateInputType = {
    id?: true
    parent_id?: true
    menu_order?: true
  }

  export type PageSumAggregateInputType = {
    id?: true
    parent_id?: true
    menu_order?: true
  }

  export type PageMinAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    status?: true
    last_updated?: true
    created_at?: true
    updated_at?: true
    parent_id?: true
    menu_order?: true
    page_template?: true
    show_in_menu?: true
    show_in_footer?: true
    meta_title?: true
    meta_description?: true
    page_builder_content?: true
    use_page_builder?: true
    builder_template?: true
  }

  export type PageMaxAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    status?: true
    last_updated?: true
    created_at?: true
    updated_at?: true
    parent_id?: true
    menu_order?: true
    page_template?: true
    show_in_menu?: true
    show_in_footer?: true
    meta_title?: true
    meta_description?: true
    page_builder_content?: true
    use_page_builder?: true
    builder_template?: true
  }

  export type PageCountAggregateInputType = {
    id?: true
    title?: true
    slug?: true
    status?: true
    last_updated?: true
    content?: true
    created_at?: true
    updated_at?: true
    parent_id?: true
    menu_order?: true
    page_template?: true
    show_in_menu?: true
    show_in_footer?: true
    meta_title?: true
    meta_description?: true
    page_builder_content?: true
    use_page_builder?: true
    builder_template?: true
    _all?: true
  }

  export type PageAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Page to aggregate.
     */
    where?: PageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pages to fetch.
     */
    orderBy?: PageOrderByWithRelationInput | PageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: PageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Pages
    **/
    _count?: true | PageCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: PageAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: PageSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: PageMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: PageMaxAggregateInputType
  }

  export type GetPageAggregateType<T extends PageAggregateArgs> = {
        [P in keyof T & keyof AggregatePage]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregatePage[P]>
      : GetScalarType<T[P], AggregatePage[P]>
  }




  export type PageGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: PageWhereInput
    orderBy?: PageOrderByWithAggregationInput | PageOrderByWithAggregationInput[]
    by: PageScalarFieldEnum[] | PageScalarFieldEnum
    having?: PageScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: PageCountAggregateInputType | true
    _avg?: PageAvgAggregateInputType
    _sum?: PageSumAggregateInputType
    _min?: PageMinAggregateInputType
    _max?: PageMaxAggregateInputType
  }

  export type PageGroupByOutputType = {
    id: number
    title: string
    slug: string
    status: string | null
    last_updated: Date | null
    content: JsonValue | null
    created_at: Date
    updated_at: Date
    parent_id: number | null
    menu_order: number | null
    page_template: string | null
    show_in_menu: boolean | null
    show_in_footer: boolean | null
    meta_title: string | null
    meta_description: string | null
    page_builder_content: string | null
    use_page_builder: boolean | null
    builder_template: string | null
    _count: PageCountAggregateOutputType | null
    _avg: PageAvgAggregateOutputType | null
    _sum: PageSumAggregateOutputType | null
    _min: PageMinAggregateOutputType | null
    _max: PageMaxAggregateOutputType | null
  }

  type GetPageGroupByPayload<T extends PageGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<PageGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof PageGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], PageGroupByOutputType[P]>
            : GetScalarType<T[P], PageGroupByOutputType[P]>
        }
      >
    >


  export type PageSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    status?: boolean
    last_updated?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
    parent_id?: boolean
    menu_order?: boolean
    page_template?: boolean
    show_in_menu?: boolean
    show_in_footer?: boolean
    meta_title?: boolean
    meta_description?: boolean
    page_builder_content?: boolean
    use_page_builder?: boolean
    builder_template?: boolean
  }, ExtArgs["result"]["page"]>

  export type PageSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    status?: boolean
    last_updated?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
    parent_id?: boolean
    menu_order?: boolean
    page_template?: boolean
    show_in_menu?: boolean
    show_in_footer?: boolean
    meta_title?: boolean
    meta_description?: boolean
    page_builder_content?: boolean
    use_page_builder?: boolean
    builder_template?: boolean
  }, ExtArgs["result"]["page"]>

  export type PageSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    slug?: boolean
    status?: boolean
    last_updated?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
    parent_id?: boolean
    menu_order?: boolean
    page_template?: boolean
    show_in_menu?: boolean
    show_in_footer?: boolean
    meta_title?: boolean
    meta_description?: boolean
    page_builder_content?: boolean
    use_page_builder?: boolean
    builder_template?: boolean
  }, ExtArgs["result"]["page"]>

  export type PageSelectScalar = {
    id?: boolean
    title?: boolean
    slug?: boolean
    status?: boolean
    last_updated?: boolean
    content?: boolean
    created_at?: boolean
    updated_at?: boolean
    parent_id?: boolean
    menu_order?: boolean
    page_template?: boolean
    show_in_menu?: boolean
    show_in_footer?: boolean
    meta_title?: boolean
    meta_description?: boolean
    page_builder_content?: boolean
    use_page_builder?: boolean
    builder_template?: boolean
  }

  export type PageOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "slug" | "status" | "last_updated" | "content" | "created_at" | "updated_at" | "parent_id" | "menu_order" | "page_template" | "show_in_menu" | "show_in_footer" | "meta_title" | "meta_description" | "page_builder_content" | "use_page_builder" | "builder_template", ExtArgs["result"]["page"]>

  export type $PagePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Page"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      title: string
      slug: string
      status: string | null
      last_updated: Date | null
      content: Prisma.JsonValue | null
      created_at: Date
      updated_at: Date
      parent_id: number | null
      menu_order: number | null
      page_template: string | null
      show_in_menu: boolean | null
      show_in_footer: boolean | null
      meta_title: string | null
      meta_description: string | null
      page_builder_content: string | null
      use_page_builder: boolean | null
      builder_template: string | null
    }, ExtArgs["result"]["page"]>
    composites: {}
  }

  type PageGetPayload<S extends boolean | null | undefined | PageDefaultArgs> = $Result.GetResult<Prisma.$PagePayload, S>

  type PageCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<PageFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: PageCountAggregateInputType | true
    }

  export interface PageDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Page'], meta: { name: 'Page' } }
    /**
     * Find zero or one Page that matches the filter.
     * @param {PageFindUniqueArgs} args - Arguments to find a Page
     * @example
     * // Get one Page
     * const page = await prisma.page.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends PageFindUniqueArgs>(args: SelectSubset<T, PageFindUniqueArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Page that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {PageFindUniqueOrThrowArgs} args - Arguments to find a Page
     * @example
     * // Get one Page
     * const page = await prisma.page.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends PageFindUniqueOrThrowArgs>(args: SelectSubset<T, PageFindUniqueOrThrowArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Page that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageFindFirstArgs} args - Arguments to find a Page
     * @example
     * // Get one Page
     * const page = await prisma.page.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends PageFindFirstArgs>(args?: SelectSubset<T, PageFindFirstArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Page that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageFindFirstOrThrowArgs} args - Arguments to find a Page
     * @example
     * // Get one Page
     * const page = await prisma.page.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends PageFindFirstOrThrowArgs>(args?: SelectSubset<T, PageFindFirstOrThrowArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Pages that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Pages
     * const pages = await prisma.page.findMany()
     * 
     * // Get first 10 Pages
     * const pages = await prisma.page.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const pageWithIdOnly = await prisma.page.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends PageFindManyArgs>(args?: SelectSubset<T, PageFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Page.
     * @param {PageCreateArgs} args - Arguments to create a Page.
     * @example
     * // Create one Page
     * const Page = await prisma.page.create({
     *   data: {
     *     // ... data to create a Page
     *   }
     * })
     * 
     */
    create<T extends PageCreateArgs>(args: SelectSubset<T, PageCreateArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Pages.
     * @param {PageCreateManyArgs} args - Arguments to create many Pages.
     * @example
     * // Create many Pages
     * const page = await prisma.page.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends PageCreateManyArgs>(args?: SelectSubset<T, PageCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Pages and returns the data saved in the database.
     * @param {PageCreateManyAndReturnArgs} args - Arguments to create many Pages.
     * @example
     * // Create many Pages
     * const page = await prisma.page.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Pages and only return the `id`
     * const pageWithIdOnly = await prisma.page.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends PageCreateManyAndReturnArgs>(args?: SelectSubset<T, PageCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Page.
     * @param {PageDeleteArgs} args - Arguments to delete one Page.
     * @example
     * // Delete one Page
     * const Page = await prisma.page.delete({
     *   where: {
     *     // ... filter to delete one Page
     *   }
     * })
     * 
     */
    delete<T extends PageDeleteArgs>(args: SelectSubset<T, PageDeleteArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Page.
     * @param {PageUpdateArgs} args - Arguments to update one Page.
     * @example
     * // Update one Page
     * const page = await prisma.page.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends PageUpdateArgs>(args: SelectSubset<T, PageUpdateArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Pages.
     * @param {PageDeleteManyArgs} args - Arguments to filter Pages to delete.
     * @example
     * // Delete a few Pages
     * const { count } = await prisma.page.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends PageDeleteManyArgs>(args?: SelectSubset<T, PageDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Pages
     * const page = await prisma.page.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends PageUpdateManyArgs>(args: SelectSubset<T, PageUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Pages and returns the data updated in the database.
     * @param {PageUpdateManyAndReturnArgs} args - Arguments to update many Pages.
     * @example
     * // Update many Pages
     * const page = await prisma.page.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Pages and only return the `id`
     * const pageWithIdOnly = await prisma.page.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends PageUpdateManyAndReturnArgs>(args: SelectSubset<T, PageUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Page.
     * @param {PageUpsertArgs} args - Arguments to update or create a Page.
     * @example
     * // Update or create a Page
     * const page = await prisma.page.upsert({
     *   create: {
     *     // ... data to create a Page
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Page we want to update
     *   }
     * })
     */
    upsert<T extends PageUpsertArgs>(args: SelectSubset<T, PageUpsertArgs<ExtArgs>>): Prisma__PageClient<$Result.GetResult<Prisma.$PagePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Pages.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageCountArgs} args - Arguments to filter Pages to count.
     * @example
     * // Count the number of Pages
     * const count = await prisma.page.count({
     *   where: {
     *     // ... the filter for the Pages we want to count
     *   }
     * })
    **/
    count<T extends PageCountArgs>(
      args?: Subset<T, PageCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], PageCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Page.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends PageAggregateArgs>(args: Subset<T, PageAggregateArgs>): Prisma.PrismaPromise<GetPageAggregateType<T>>

    /**
     * Group by Page.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {PageGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends PageGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: PageGroupByArgs['orderBy'] }
        : { orderBy?: PageGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, PageGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetPageGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Page model
   */
  readonly fields: PageFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Page.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__PageClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Page model
   */
  interface PageFieldRefs {
    readonly id: FieldRef<"Page", 'Int'>
    readonly title: FieldRef<"Page", 'String'>
    readonly slug: FieldRef<"Page", 'String'>
    readonly status: FieldRef<"Page", 'String'>
    readonly last_updated: FieldRef<"Page", 'DateTime'>
    readonly content: FieldRef<"Page", 'Json'>
    readonly created_at: FieldRef<"Page", 'DateTime'>
    readonly updated_at: FieldRef<"Page", 'DateTime'>
    readonly parent_id: FieldRef<"Page", 'Int'>
    readonly menu_order: FieldRef<"Page", 'Int'>
    readonly page_template: FieldRef<"Page", 'String'>
    readonly show_in_menu: FieldRef<"Page", 'Boolean'>
    readonly show_in_footer: FieldRef<"Page", 'Boolean'>
    readonly meta_title: FieldRef<"Page", 'String'>
    readonly meta_description: FieldRef<"Page", 'String'>
    readonly page_builder_content: FieldRef<"Page", 'String'>
    readonly use_page_builder: FieldRef<"Page", 'Boolean'>
    readonly builder_template: FieldRef<"Page", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Page findUnique
   */
  export type PageFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * Filter, which Page to fetch.
     */
    where: PageWhereUniqueInput
  }

  /**
   * Page findUniqueOrThrow
   */
  export type PageFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * Filter, which Page to fetch.
     */
    where: PageWhereUniqueInput
  }

  /**
   * Page findFirst
   */
  export type PageFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * Filter, which Page to fetch.
     */
    where?: PageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pages to fetch.
     */
    orderBy?: PageOrderByWithRelationInput | PageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pages.
     */
    cursor?: PageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pages.
     */
    distinct?: PageScalarFieldEnum | PageScalarFieldEnum[]
  }

  /**
   * Page findFirstOrThrow
   */
  export type PageFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * Filter, which Page to fetch.
     */
    where?: PageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pages to fetch.
     */
    orderBy?: PageOrderByWithRelationInput | PageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Pages.
     */
    cursor?: PageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pages.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Pages.
     */
    distinct?: PageScalarFieldEnum | PageScalarFieldEnum[]
  }

  /**
   * Page findMany
   */
  export type PageFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * Filter, which Pages to fetch.
     */
    where?: PageWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Pages to fetch.
     */
    orderBy?: PageOrderByWithRelationInput | PageOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Pages.
     */
    cursor?: PageWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Pages from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Pages.
     */
    skip?: number
    distinct?: PageScalarFieldEnum | PageScalarFieldEnum[]
  }

  /**
   * Page create
   */
  export type PageCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * The data needed to create a Page.
     */
    data: XOR<PageCreateInput, PageUncheckedCreateInput>
  }

  /**
   * Page createMany
   */
  export type PageCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Pages.
     */
    data: PageCreateManyInput | PageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Page createManyAndReturn
   */
  export type PageCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * The data used to create many Pages.
     */
    data: PageCreateManyInput | PageCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Page update
   */
  export type PageUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * The data needed to update a Page.
     */
    data: XOR<PageUpdateInput, PageUncheckedUpdateInput>
    /**
     * Choose, which Page to update.
     */
    where: PageWhereUniqueInput
  }

  /**
   * Page updateMany
   */
  export type PageUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Pages.
     */
    data: XOR<PageUpdateManyMutationInput, PageUncheckedUpdateManyInput>
    /**
     * Filter which Pages to update
     */
    where?: PageWhereInput
    /**
     * Limit how many Pages to update.
     */
    limit?: number
  }

  /**
   * Page updateManyAndReturn
   */
  export type PageUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * The data used to update Pages.
     */
    data: XOR<PageUpdateManyMutationInput, PageUncheckedUpdateManyInput>
    /**
     * Filter which Pages to update
     */
    where?: PageWhereInput
    /**
     * Limit how many Pages to update.
     */
    limit?: number
  }

  /**
   * Page upsert
   */
  export type PageUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * The filter to search for the Page to update in case it exists.
     */
    where: PageWhereUniqueInput
    /**
     * In case the Page found by the `where` argument doesn't exist, create a new Page with this data.
     */
    create: XOR<PageCreateInput, PageUncheckedCreateInput>
    /**
     * In case the Page was found with the provided `where` argument, update it with this data.
     */
    update: XOR<PageUpdateInput, PageUncheckedUpdateInput>
  }

  /**
   * Page delete
   */
  export type PageDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
    /**
     * Filter which Page to delete.
     */
    where: PageWhereUniqueInput
  }

  /**
   * Page deleteMany
   */
  export type PageDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Pages to delete
     */
    where?: PageWhereInput
    /**
     * Limit how many Pages to delete.
     */
    limit?: number
  }

  /**
   * Page without action
   */
  export type PageDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Page
     */
    select?: PageSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Page
     */
    omit?: PageOmit<ExtArgs> | null
  }


  /**
   * Model StaffMember
   */

  export type AggregateStaffMember = {
    _count: StaffMemberCountAggregateOutputType | null
    _min: StaffMemberMinAggregateOutputType | null
    _max: StaffMemberMaxAggregateOutputType | null
  }

  export type StaffMemberMinAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffMemberMaxAggregateOutputType = {
    id: string | null
    name: string | null
    email: string | null
    password: string | null
    role: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type StaffMemberCountAggregateOutputType = {
    id: number
    name: number
    email: number
    password: number
    role: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type StaffMemberMinAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffMemberMaxAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type StaffMemberCountAggregateInputType = {
    id?: true
    name?: true
    email?: true
    password?: true
    role?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type StaffMemberAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StaffMember to aggregate.
     */
    where?: StaffMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffMembers to fetch.
     */
    orderBy?: StaffMemberOrderByWithRelationInput | StaffMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: StaffMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned StaffMembers
    **/
    _count?: true | StaffMemberCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: StaffMemberMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: StaffMemberMaxAggregateInputType
  }

  export type GetStaffMemberAggregateType<T extends StaffMemberAggregateArgs> = {
        [P in keyof T & keyof AggregateStaffMember]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateStaffMember[P]>
      : GetScalarType<T[P], AggregateStaffMember[P]>
  }




  export type StaffMemberGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: StaffMemberWhereInput
    orderBy?: StaffMemberOrderByWithAggregationInput | StaffMemberOrderByWithAggregationInput[]
    by: StaffMemberScalarFieldEnum[] | StaffMemberScalarFieldEnum
    having?: StaffMemberScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: StaffMemberCountAggregateInputType | true
    _min?: StaffMemberMinAggregateInputType
    _max?: StaffMemberMaxAggregateInputType
  }

  export type StaffMemberGroupByOutputType = {
    id: string
    name: string
    email: string
    password: string
    role: string
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: StaffMemberCountAggregateOutputType | null
    _min: StaffMemberMinAggregateOutputType | null
    _max: StaffMemberMaxAggregateOutputType | null
  }

  type GetStaffMemberGroupByPayload<T extends StaffMemberGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<StaffMemberGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof StaffMemberGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], StaffMemberGroupByOutputType[P]>
            : GetScalarType<T[P], StaffMemberGroupByOutputType[P]>
        }
      >
    >


  export type StaffMemberSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staffMember"]>

  export type StaffMemberSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staffMember"]>

  export type StaffMemberSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["staffMember"]>

  export type StaffMemberSelectScalar = {
    id?: boolean
    name?: boolean
    email?: boolean
    password?: boolean
    role?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type StaffMemberOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "email" | "password" | "role" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["staffMember"]>

  export type $StaffMemberPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "StaffMember"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      email: string
      password: string
      role: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["staffMember"]>
    composites: {}
  }

  type StaffMemberGetPayload<S extends boolean | null | undefined | StaffMemberDefaultArgs> = $Result.GetResult<Prisma.$StaffMemberPayload, S>

  type StaffMemberCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<StaffMemberFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: StaffMemberCountAggregateInputType | true
    }

  export interface StaffMemberDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['StaffMember'], meta: { name: 'StaffMember' } }
    /**
     * Find zero or one StaffMember that matches the filter.
     * @param {StaffMemberFindUniqueArgs} args - Arguments to find a StaffMember
     * @example
     * // Get one StaffMember
     * const staffMember = await prisma.staffMember.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends StaffMemberFindUniqueArgs>(args: SelectSubset<T, StaffMemberFindUniqueArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one StaffMember that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {StaffMemberFindUniqueOrThrowArgs} args - Arguments to find a StaffMember
     * @example
     * // Get one StaffMember
     * const staffMember = await prisma.staffMember.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends StaffMemberFindUniqueOrThrowArgs>(args: SelectSubset<T, StaffMemberFindUniqueOrThrowArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StaffMember that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberFindFirstArgs} args - Arguments to find a StaffMember
     * @example
     * // Get one StaffMember
     * const staffMember = await prisma.staffMember.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends StaffMemberFindFirstArgs>(args?: SelectSubset<T, StaffMemberFindFirstArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first StaffMember that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberFindFirstOrThrowArgs} args - Arguments to find a StaffMember
     * @example
     * // Get one StaffMember
     * const staffMember = await prisma.staffMember.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends StaffMemberFindFirstOrThrowArgs>(args?: SelectSubset<T, StaffMemberFindFirstOrThrowArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more StaffMembers that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all StaffMembers
     * const staffMembers = await prisma.staffMember.findMany()
     * 
     * // Get first 10 StaffMembers
     * const staffMembers = await prisma.staffMember.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const staffMemberWithIdOnly = await prisma.staffMember.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends StaffMemberFindManyArgs>(args?: SelectSubset<T, StaffMemberFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a StaffMember.
     * @param {StaffMemberCreateArgs} args - Arguments to create a StaffMember.
     * @example
     * // Create one StaffMember
     * const StaffMember = await prisma.staffMember.create({
     *   data: {
     *     // ... data to create a StaffMember
     *   }
     * })
     * 
     */
    create<T extends StaffMemberCreateArgs>(args: SelectSubset<T, StaffMemberCreateArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many StaffMembers.
     * @param {StaffMemberCreateManyArgs} args - Arguments to create many StaffMembers.
     * @example
     * // Create many StaffMembers
     * const staffMember = await prisma.staffMember.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends StaffMemberCreateManyArgs>(args?: SelectSubset<T, StaffMemberCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many StaffMembers and returns the data saved in the database.
     * @param {StaffMemberCreateManyAndReturnArgs} args - Arguments to create many StaffMembers.
     * @example
     * // Create many StaffMembers
     * const staffMember = await prisma.staffMember.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many StaffMembers and only return the `id`
     * const staffMemberWithIdOnly = await prisma.staffMember.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends StaffMemberCreateManyAndReturnArgs>(args?: SelectSubset<T, StaffMemberCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a StaffMember.
     * @param {StaffMemberDeleteArgs} args - Arguments to delete one StaffMember.
     * @example
     * // Delete one StaffMember
     * const StaffMember = await prisma.staffMember.delete({
     *   where: {
     *     // ... filter to delete one StaffMember
     *   }
     * })
     * 
     */
    delete<T extends StaffMemberDeleteArgs>(args: SelectSubset<T, StaffMemberDeleteArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one StaffMember.
     * @param {StaffMemberUpdateArgs} args - Arguments to update one StaffMember.
     * @example
     * // Update one StaffMember
     * const staffMember = await prisma.staffMember.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends StaffMemberUpdateArgs>(args: SelectSubset<T, StaffMemberUpdateArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more StaffMembers.
     * @param {StaffMemberDeleteManyArgs} args - Arguments to filter StaffMembers to delete.
     * @example
     * // Delete a few StaffMembers
     * const { count } = await prisma.staffMember.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends StaffMemberDeleteManyArgs>(args?: SelectSubset<T, StaffMemberDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StaffMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many StaffMembers
     * const staffMember = await prisma.staffMember.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends StaffMemberUpdateManyArgs>(args: SelectSubset<T, StaffMemberUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more StaffMembers and returns the data updated in the database.
     * @param {StaffMemberUpdateManyAndReturnArgs} args - Arguments to update many StaffMembers.
     * @example
     * // Update many StaffMembers
     * const staffMember = await prisma.staffMember.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more StaffMembers and only return the `id`
     * const staffMemberWithIdOnly = await prisma.staffMember.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends StaffMemberUpdateManyAndReturnArgs>(args: SelectSubset<T, StaffMemberUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one StaffMember.
     * @param {StaffMemberUpsertArgs} args - Arguments to update or create a StaffMember.
     * @example
     * // Update or create a StaffMember
     * const staffMember = await prisma.staffMember.upsert({
     *   create: {
     *     // ... data to create a StaffMember
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the StaffMember we want to update
     *   }
     * })
     */
    upsert<T extends StaffMemberUpsertArgs>(args: SelectSubset<T, StaffMemberUpsertArgs<ExtArgs>>): Prisma__StaffMemberClient<$Result.GetResult<Prisma.$StaffMemberPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of StaffMembers.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberCountArgs} args - Arguments to filter StaffMembers to count.
     * @example
     * // Count the number of StaffMembers
     * const count = await prisma.staffMember.count({
     *   where: {
     *     // ... the filter for the StaffMembers we want to count
     *   }
     * })
    **/
    count<T extends StaffMemberCountArgs>(
      args?: Subset<T, StaffMemberCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], StaffMemberCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a StaffMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends StaffMemberAggregateArgs>(args: Subset<T, StaffMemberAggregateArgs>): Prisma.PrismaPromise<GetStaffMemberAggregateType<T>>

    /**
     * Group by StaffMember.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {StaffMemberGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends StaffMemberGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: StaffMemberGroupByArgs['orderBy'] }
        : { orderBy?: StaffMemberGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, StaffMemberGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetStaffMemberGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the StaffMember model
   */
  readonly fields: StaffMemberFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for StaffMember.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__StaffMemberClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the StaffMember model
   */
  interface StaffMemberFieldRefs {
    readonly id: FieldRef<"StaffMember", 'String'>
    readonly name: FieldRef<"StaffMember", 'String'>
    readonly email: FieldRef<"StaffMember", 'String'>
    readonly password: FieldRef<"StaffMember", 'String'>
    readonly role: FieldRef<"StaffMember", 'String'>
    readonly isActive: FieldRef<"StaffMember", 'Boolean'>
    readonly createdAt: FieldRef<"StaffMember", 'DateTime'>
    readonly updatedAt: FieldRef<"StaffMember", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * StaffMember findUnique
   */
  export type StaffMemberFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * Filter, which StaffMember to fetch.
     */
    where: StaffMemberWhereUniqueInput
  }

  /**
   * StaffMember findUniqueOrThrow
   */
  export type StaffMemberFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * Filter, which StaffMember to fetch.
     */
    where: StaffMemberWhereUniqueInput
  }

  /**
   * StaffMember findFirst
   */
  export type StaffMemberFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * Filter, which StaffMember to fetch.
     */
    where?: StaffMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffMembers to fetch.
     */
    orderBy?: StaffMemberOrderByWithRelationInput | StaffMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StaffMembers.
     */
    cursor?: StaffMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StaffMembers.
     */
    distinct?: StaffMemberScalarFieldEnum | StaffMemberScalarFieldEnum[]
  }

  /**
   * StaffMember findFirstOrThrow
   */
  export type StaffMemberFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * Filter, which StaffMember to fetch.
     */
    where?: StaffMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffMembers to fetch.
     */
    orderBy?: StaffMemberOrderByWithRelationInput | StaffMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for StaffMembers.
     */
    cursor?: StaffMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffMembers.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of StaffMembers.
     */
    distinct?: StaffMemberScalarFieldEnum | StaffMemberScalarFieldEnum[]
  }

  /**
   * StaffMember findMany
   */
  export type StaffMemberFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * Filter, which StaffMembers to fetch.
     */
    where?: StaffMemberWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of StaffMembers to fetch.
     */
    orderBy?: StaffMemberOrderByWithRelationInput | StaffMemberOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing StaffMembers.
     */
    cursor?: StaffMemberWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` StaffMembers from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` StaffMembers.
     */
    skip?: number
    distinct?: StaffMemberScalarFieldEnum | StaffMemberScalarFieldEnum[]
  }

  /**
   * StaffMember create
   */
  export type StaffMemberCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * The data needed to create a StaffMember.
     */
    data: XOR<StaffMemberCreateInput, StaffMemberUncheckedCreateInput>
  }

  /**
   * StaffMember createMany
   */
  export type StaffMemberCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many StaffMembers.
     */
    data: StaffMemberCreateManyInput | StaffMemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StaffMember createManyAndReturn
   */
  export type StaffMemberCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * The data used to create many StaffMembers.
     */
    data: StaffMemberCreateManyInput | StaffMemberCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * StaffMember update
   */
  export type StaffMemberUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * The data needed to update a StaffMember.
     */
    data: XOR<StaffMemberUpdateInput, StaffMemberUncheckedUpdateInput>
    /**
     * Choose, which StaffMember to update.
     */
    where: StaffMemberWhereUniqueInput
  }

  /**
   * StaffMember updateMany
   */
  export type StaffMemberUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update StaffMembers.
     */
    data: XOR<StaffMemberUpdateManyMutationInput, StaffMemberUncheckedUpdateManyInput>
    /**
     * Filter which StaffMembers to update
     */
    where?: StaffMemberWhereInput
    /**
     * Limit how many StaffMembers to update.
     */
    limit?: number
  }

  /**
   * StaffMember updateManyAndReturn
   */
  export type StaffMemberUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * The data used to update StaffMembers.
     */
    data: XOR<StaffMemberUpdateManyMutationInput, StaffMemberUncheckedUpdateManyInput>
    /**
     * Filter which StaffMembers to update
     */
    where?: StaffMemberWhereInput
    /**
     * Limit how many StaffMembers to update.
     */
    limit?: number
  }

  /**
   * StaffMember upsert
   */
  export type StaffMemberUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * The filter to search for the StaffMember to update in case it exists.
     */
    where: StaffMemberWhereUniqueInput
    /**
     * In case the StaffMember found by the `where` argument doesn't exist, create a new StaffMember with this data.
     */
    create: XOR<StaffMemberCreateInput, StaffMemberUncheckedCreateInput>
    /**
     * In case the StaffMember was found with the provided `where` argument, update it with this data.
     */
    update: XOR<StaffMemberUpdateInput, StaffMemberUncheckedUpdateInput>
  }

  /**
   * StaffMember delete
   */
  export type StaffMemberDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
    /**
     * Filter which StaffMember to delete.
     */
    where: StaffMemberWhereUniqueInput
  }

  /**
   * StaffMember deleteMany
   */
  export type StaffMemberDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which StaffMembers to delete
     */
    where?: StaffMemberWhereInput
    /**
     * Limit how many StaffMembers to delete.
     */
    limit?: number
  }

  /**
   * StaffMember without action
   */
  export type StaffMemberDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the StaffMember
     */
    select?: StaffMemberSelect<ExtArgs> | null
    /**
     * Omit specific fields from the StaffMember
     */
    omit?: StaffMemberOmit<ExtArgs> | null
  }


  /**
   * Model Job
   */

  export type AggregateJob = {
    _count: JobCountAggregateOutputType | null
    _min: JobMinAggregateOutputType | null
    _max: JobMaxAggregateOutputType | null
  }

  export type JobMinAggregateOutputType = {
    id: string | null
    title: string | null
    department: string | null
    location: string | null
    type: string | null
    description: string | null
    responsibilities: string | null
    requirements: string | null
    benefits: string | null
    salary: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type JobMaxAggregateOutputType = {
    id: string | null
    title: string | null
    department: string | null
    location: string | null
    type: string | null
    description: string | null
    responsibilities: string | null
    requirements: string | null
    benefits: string | null
    salary: string | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type JobCountAggregateOutputType = {
    id: number
    title: number
    department: number
    location: number
    type: number
    description: number
    responsibilities: number
    requirements: number
    benefits: number
    salary: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type JobMinAggregateInputType = {
    id?: true
    title?: true
    department?: true
    location?: true
    type?: true
    description?: true
    responsibilities?: true
    requirements?: true
    benefits?: true
    salary?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type JobMaxAggregateInputType = {
    id?: true
    title?: true
    department?: true
    location?: true
    type?: true
    description?: true
    responsibilities?: true
    requirements?: true
    benefits?: true
    salary?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type JobCountAggregateInputType = {
    id?: true
    title?: true
    department?: true
    location?: true
    type?: true
    description?: true
    responsibilities?: true
    requirements?: true
    benefits?: true
    salary?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type JobAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Job to aggregate.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Jobs
    **/
    _count?: true | JobCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: JobMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: JobMaxAggregateInputType
  }

  export type GetJobAggregateType<T extends JobAggregateArgs> = {
        [P in keyof T & keyof AggregateJob]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateJob[P]>
      : GetScalarType<T[P], AggregateJob[P]>
  }




  export type JobGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: JobWhereInput
    orderBy?: JobOrderByWithAggregationInput | JobOrderByWithAggregationInput[]
    by: JobScalarFieldEnum[] | JobScalarFieldEnum
    having?: JobScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: JobCountAggregateInputType | true
    _min?: JobMinAggregateInputType
    _max?: JobMaxAggregateInputType
  }

  export type JobGroupByOutputType = {
    id: string
    title: string
    department: string
    location: string
    type: string
    description: string
    responsibilities: string
    requirements: string
    benefits: string | null
    salary: string | null
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: JobCountAggregateOutputType | null
    _min: JobMinAggregateOutputType | null
    _max: JobMaxAggregateOutputType | null
  }

  type GetJobGroupByPayload<T extends JobGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<JobGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof JobGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], JobGroupByOutputType[P]>
            : GetScalarType<T[P], JobGroupByOutputType[P]>
        }
      >
    >


  export type JobSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    type?: boolean
    description?: boolean
    responsibilities?: boolean
    requirements?: boolean
    benefits?: boolean
    salary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["job"]>

  export type JobSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    type?: boolean
    description?: boolean
    responsibilities?: boolean
    requirements?: boolean
    benefits?: boolean
    salary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["job"]>

  export type JobSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    type?: boolean
    description?: boolean
    responsibilities?: boolean
    requirements?: boolean
    benefits?: boolean
    salary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["job"]>

  export type JobSelectScalar = {
    id?: boolean
    title?: boolean
    department?: boolean
    location?: boolean
    type?: boolean
    description?: boolean
    responsibilities?: boolean
    requirements?: boolean
    benefits?: boolean
    salary?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type JobOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "department" | "location" | "type" | "description" | "responsibilities" | "requirements" | "benefits" | "salary" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["job"]>

  export type $JobPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Job"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      department: string
      location: string
      type: string
      description: string
      responsibilities: string
      requirements: string
      benefits: string | null
      salary: string | null
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["job"]>
    composites: {}
  }

  type JobGetPayload<S extends boolean | null | undefined | JobDefaultArgs> = $Result.GetResult<Prisma.$JobPayload, S>

  type JobCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<JobFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: JobCountAggregateInputType | true
    }

  export interface JobDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Job'], meta: { name: 'Job' } }
    /**
     * Find zero or one Job that matches the filter.
     * @param {JobFindUniqueArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends JobFindUniqueArgs>(args: SelectSubset<T, JobFindUniqueArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Job that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {JobFindUniqueOrThrowArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends JobFindUniqueOrThrowArgs>(args: SelectSubset<T, JobFindUniqueOrThrowArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Job that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobFindFirstArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends JobFindFirstArgs>(args?: SelectSubset<T, JobFindFirstArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Job that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobFindFirstOrThrowArgs} args - Arguments to find a Job
     * @example
     * // Get one Job
     * const job = await prisma.job.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends JobFindFirstOrThrowArgs>(args?: SelectSubset<T, JobFindFirstOrThrowArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Jobs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Jobs
     * const jobs = await prisma.job.findMany()
     * 
     * // Get first 10 Jobs
     * const jobs = await prisma.job.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const jobWithIdOnly = await prisma.job.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends JobFindManyArgs>(args?: SelectSubset<T, JobFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Job.
     * @param {JobCreateArgs} args - Arguments to create a Job.
     * @example
     * // Create one Job
     * const Job = await prisma.job.create({
     *   data: {
     *     // ... data to create a Job
     *   }
     * })
     * 
     */
    create<T extends JobCreateArgs>(args: SelectSubset<T, JobCreateArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Jobs.
     * @param {JobCreateManyArgs} args - Arguments to create many Jobs.
     * @example
     * // Create many Jobs
     * const job = await prisma.job.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends JobCreateManyArgs>(args?: SelectSubset<T, JobCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Jobs and returns the data saved in the database.
     * @param {JobCreateManyAndReturnArgs} args - Arguments to create many Jobs.
     * @example
     * // Create many Jobs
     * const job = await prisma.job.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Jobs and only return the `id`
     * const jobWithIdOnly = await prisma.job.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends JobCreateManyAndReturnArgs>(args?: SelectSubset<T, JobCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Job.
     * @param {JobDeleteArgs} args - Arguments to delete one Job.
     * @example
     * // Delete one Job
     * const Job = await prisma.job.delete({
     *   where: {
     *     // ... filter to delete one Job
     *   }
     * })
     * 
     */
    delete<T extends JobDeleteArgs>(args: SelectSubset<T, JobDeleteArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Job.
     * @param {JobUpdateArgs} args - Arguments to update one Job.
     * @example
     * // Update one Job
     * const job = await prisma.job.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends JobUpdateArgs>(args: SelectSubset<T, JobUpdateArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Jobs.
     * @param {JobDeleteManyArgs} args - Arguments to filter Jobs to delete.
     * @example
     * // Delete a few Jobs
     * const { count } = await prisma.job.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends JobDeleteManyArgs>(args?: SelectSubset<T, JobDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Jobs
     * const job = await prisma.job.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends JobUpdateManyArgs>(args: SelectSubset<T, JobUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Jobs and returns the data updated in the database.
     * @param {JobUpdateManyAndReturnArgs} args - Arguments to update many Jobs.
     * @example
     * // Update many Jobs
     * const job = await prisma.job.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Jobs and only return the `id`
     * const jobWithIdOnly = await prisma.job.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends JobUpdateManyAndReturnArgs>(args: SelectSubset<T, JobUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Job.
     * @param {JobUpsertArgs} args - Arguments to update or create a Job.
     * @example
     * // Update or create a Job
     * const job = await prisma.job.upsert({
     *   create: {
     *     // ... data to create a Job
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Job we want to update
     *   }
     * })
     */
    upsert<T extends JobUpsertArgs>(args: SelectSubset<T, JobUpsertArgs<ExtArgs>>): Prisma__JobClient<$Result.GetResult<Prisma.$JobPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Jobs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobCountArgs} args - Arguments to filter Jobs to count.
     * @example
     * // Count the number of Jobs
     * const count = await prisma.job.count({
     *   where: {
     *     // ... the filter for the Jobs we want to count
     *   }
     * })
    **/
    count<T extends JobCountArgs>(
      args?: Subset<T, JobCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], JobCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Job.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends JobAggregateArgs>(args: Subset<T, JobAggregateArgs>): Prisma.PrismaPromise<GetJobAggregateType<T>>

    /**
     * Group by Job.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {JobGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends JobGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: JobGroupByArgs['orderBy'] }
        : { orderBy?: JobGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, JobGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetJobGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Job model
   */
  readonly fields: JobFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Job.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__JobClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Job model
   */
  interface JobFieldRefs {
    readonly id: FieldRef<"Job", 'String'>
    readonly title: FieldRef<"Job", 'String'>
    readonly department: FieldRef<"Job", 'String'>
    readonly location: FieldRef<"Job", 'String'>
    readonly type: FieldRef<"Job", 'String'>
    readonly description: FieldRef<"Job", 'String'>
    readonly responsibilities: FieldRef<"Job", 'String'>
    readonly requirements: FieldRef<"Job", 'String'>
    readonly benefits: FieldRef<"Job", 'String'>
    readonly salary: FieldRef<"Job", 'String'>
    readonly isActive: FieldRef<"Job", 'Boolean'>
    readonly createdAt: FieldRef<"Job", 'DateTime'>
    readonly updatedAt: FieldRef<"Job", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Job findUnique
   */
  export type JobFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job findUniqueOrThrow
   */
  export type JobFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job findFirst
   */
  export type JobFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Jobs.
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jobs.
     */
    distinct?: JobScalarFieldEnum | JobScalarFieldEnum[]
  }

  /**
   * Job findFirstOrThrow
   */
  export type JobFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Filter, which Job to fetch.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Jobs.
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Jobs.
     */
    distinct?: JobScalarFieldEnum | JobScalarFieldEnum[]
  }

  /**
   * Job findMany
   */
  export type JobFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Filter, which Jobs to fetch.
     */
    where?: JobWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Jobs to fetch.
     */
    orderBy?: JobOrderByWithRelationInput | JobOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Jobs.
     */
    cursor?: JobWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Jobs from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Jobs.
     */
    skip?: number
    distinct?: JobScalarFieldEnum | JobScalarFieldEnum[]
  }

  /**
   * Job create
   */
  export type JobCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The data needed to create a Job.
     */
    data: XOR<JobCreateInput, JobUncheckedCreateInput>
  }

  /**
   * Job createMany
   */
  export type JobCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Jobs.
     */
    data: JobCreateManyInput | JobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Job createManyAndReturn
   */
  export type JobCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The data used to create many Jobs.
     */
    data: JobCreateManyInput | JobCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Job update
   */
  export type JobUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The data needed to update a Job.
     */
    data: XOR<JobUpdateInput, JobUncheckedUpdateInput>
    /**
     * Choose, which Job to update.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job updateMany
   */
  export type JobUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Jobs.
     */
    data: XOR<JobUpdateManyMutationInput, JobUncheckedUpdateManyInput>
    /**
     * Filter which Jobs to update
     */
    where?: JobWhereInput
    /**
     * Limit how many Jobs to update.
     */
    limit?: number
  }

  /**
   * Job updateManyAndReturn
   */
  export type JobUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The data used to update Jobs.
     */
    data: XOR<JobUpdateManyMutationInput, JobUncheckedUpdateManyInput>
    /**
     * Filter which Jobs to update
     */
    where?: JobWhereInput
    /**
     * Limit how many Jobs to update.
     */
    limit?: number
  }

  /**
   * Job upsert
   */
  export type JobUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * The filter to search for the Job to update in case it exists.
     */
    where: JobWhereUniqueInput
    /**
     * In case the Job found by the `where` argument doesn't exist, create a new Job with this data.
     */
    create: XOR<JobCreateInput, JobUncheckedCreateInput>
    /**
     * In case the Job was found with the provided `where` argument, update it with this data.
     */
    update: XOR<JobUpdateInput, JobUncheckedUpdateInput>
  }

  /**
   * Job delete
   */
  export type JobDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
    /**
     * Filter which Job to delete.
     */
    where: JobWhereUniqueInput
  }

  /**
   * Job deleteMany
   */
  export type JobDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Jobs to delete
     */
    where?: JobWhereInput
    /**
     * Limit how many Jobs to delete.
     */
    limit?: number
  }

  /**
   * Job without action
   */
  export type JobDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Job
     */
    select?: JobSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Job
     */
    omit?: JobOmit<ExtArgs> | null
  }


  /**
   * Model SlideShow
   */

  export type AggregateSlideShow = {
    _count: SlideShowCountAggregateOutputType | null
    _avg: SlideShowAvgAggregateOutputType | null
    _sum: SlideShowSumAggregateOutputType | null
    _min: SlideShowMinAggregateOutputType | null
    _max: SlideShowMaxAggregateOutputType | null
  }

  export type SlideShowAvgAggregateOutputType = {
    order: number | null
  }

  export type SlideShowSumAggregateOutputType = {
    order: number | null
  }

  export type SlideShowMinAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    imageUrl: string | null
    iconType: string | null
    order: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SlideShowMaxAggregateOutputType = {
    id: string | null
    title: string | null
    description: string | null
    imageUrl: string | null
    iconType: string | null
    order: number | null
    isActive: boolean | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SlideShowCountAggregateOutputType = {
    id: number
    title: number
    description: number
    imageUrl: number
    iconType: number
    order: number
    isActive: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SlideShowAvgAggregateInputType = {
    order?: true
  }

  export type SlideShowSumAggregateInputType = {
    order?: true
  }

  export type SlideShowMinAggregateInputType = {
    id?: true
    title?: true
    description?: true
    imageUrl?: true
    iconType?: true
    order?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SlideShowMaxAggregateInputType = {
    id?: true
    title?: true
    description?: true
    imageUrl?: true
    iconType?: true
    order?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SlideShowCountAggregateInputType = {
    id?: true
    title?: true
    description?: true
    imageUrl?: true
    iconType?: true
    order?: true
    isActive?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SlideShowAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SlideShow to aggregate.
     */
    where?: SlideShowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlideShows to fetch.
     */
    orderBy?: SlideShowOrderByWithRelationInput | SlideShowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SlideShowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlideShows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlideShows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SlideShows
    **/
    _count?: true | SlideShowCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SlideShowAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SlideShowSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SlideShowMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SlideShowMaxAggregateInputType
  }

  export type GetSlideShowAggregateType<T extends SlideShowAggregateArgs> = {
        [P in keyof T & keyof AggregateSlideShow]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSlideShow[P]>
      : GetScalarType<T[P], AggregateSlideShow[P]>
  }




  export type SlideShowGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SlideShowWhereInput
    orderBy?: SlideShowOrderByWithAggregationInput | SlideShowOrderByWithAggregationInput[]
    by: SlideShowScalarFieldEnum[] | SlideShowScalarFieldEnum
    having?: SlideShowScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SlideShowCountAggregateInputType | true
    _avg?: SlideShowAvgAggregateInputType
    _sum?: SlideShowSumAggregateInputType
    _min?: SlideShowMinAggregateInputType
    _max?: SlideShowMaxAggregateInputType
  }

  export type SlideShowGroupByOutputType = {
    id: string
    title: string
    description: string
    imageUrl: string
    iconType: string
    order: number
    isActive: boolean
    createdAt: Date
    updatedAt: Date
    _count: SlideShowCountAggregateOutputType | null
    _avg: SlideShowAvgAggregateOutputType | null
    _sum: SlideShowSumAggregateOutputType | null
    _min: SlideShowMinAggregateOutputType | null
    _max: SlideShowMaxAggregateOutputType | null
  }

  type GetSlideShowGroupByPayload<T extends SlideShowGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SlideShowGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SlideShowGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SlideShowGroupByOutputType[P]>
            : GetScalarType<T[P], SlideShowGroupByOutputType[P]>
        }
      >
    >


  export type SlideShowSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    iconType?: boolean
    order?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["slideShow"]>

  export type SlideShowSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    iconType?: boolean
    order?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["slideShow"]>

  export type SlideShowSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    iconType?: boolean
    order?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["slideShow"]>

  export type SlideShowSelectScalar = {
    id?: boolean
    title?: boolean
    description?: boolean
    imageUrl?: boolean
    iconType?: boolean
    order?: boolean
    isActive?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SlideShowOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "title" | "description" | "imageUrl" | "iconType" | "order" | "isActive" | "createdAt" | "updatedAt", ExtArgs["result"]["slideShow"]>

  export type $SlideShowPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SlideShow"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      title: string
      description: string
      imageUrl: string
      iconType: string
      order: number
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["slideShow"]>
    composites: {}
  }

  type SlideShowGetPayload<S extends boolean | null | undefined | SlideShowDefaultArgs> = $Result.GetResult<Prisma.$SlideShowPayload, S>

  type SlideShowCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SlideShowFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SlideShowCountAggregateInputType | true
    }

  export interface SlideShowDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SlideShow'], meta: { name: 'SlideShow' } }
    /**
     * Find zero or one SlideShow that matches the filter.
     * @param {SlideShowFindUniqueArgs} args - Arguments to find a SlideShow
     * @example
     * // Get one SlideShow
     * const slideShow = await prisma.slideShow.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SlideShowFindUniqueArgs>(args: SelectSubset<T, SlideShowFindUniqueArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SlideShow that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SlideShowFindUniqueOrThrowArgs} args - Arguments to find a SlideShow
     * @example
     * // Get one SlideShow
     * const slideShow = await prisma.slideShow.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SlideShowFindUniqueOrThrowArgs>(args: SelectSubset<T, SlideShowFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SlideShow that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowFindFirstArgs} args - Arguments to find a SlideShow
     * @example
     * // Get one SlideShow
     * const slideShow = await prisma.slideShow.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SlideShowFindFirstArgs>(args?: SelectSubset<T, SlideShowFindFirstArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SlideShow that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowFindFirstOrThrowArgs} args - Arguments to find a SlideShow
     * @example
     * // Get one SlideShow
     * const slideShow = await prisma.slideShow.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SlideShowFindFirstOrThrowArgs>(args?: SelectSubset<T, SlideShowFindFirstOrThrowArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SlideShows that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SlideShows
     * const slideShows = await prisma.slideShow.findMany()
     * 
     * // Get first 10 SlideShows
     * const slideShows = await prisma.slideShow.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const slideShowWithIdOnly = await prisma.slideShow.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SlideShowFindManyArgs>(args?: SelectSubset<T, SlideShowFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SlideShow.
     * @param {SlideShowCreateArgs} args - Arguments to create a SlideShow.
     * @example
     * // Create one SlideShow
     * const SlideShow = await prisma.slideShow.create({
     *   data: {
     *     // ... data to create a SlideShow
     *   }
     * })
     * 
     */
    create<T extends SlideShowCreateArgs>(args: SelectSubset<T, SlideShowCreateArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SlideShows.
     * @param {SlideShowCreateManyArgs} args - Arguments to create many SlideShows.
     * @example
     * // Create many SlideShows
     * const slideShow = await prisma.slideShow.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SlideShowCreateManyArgs>(args?: SelectSubset<T, SlideShowCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SlideShows and returns the data saved in the database.
     * @param {SlideShowCreateManyAndReturnArgs} args - Arguments to create many SlideShows.
     * @example
     * // Create many SlideShows
     * const slideShow = await prisma.slideShow.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SlideShows and only return the `id`
     * const slideShowWithIdOnly = await prisma.slideShow.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SlideShowCreateManyAndReturnArgs>(args?: SelectSubset<T, SlideShowCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SlideShow.
     * @param {SlideShowDeleteArgs} args - Arguments to delete one SlideShow.
     * @example
     * // Delete one SlideShow
     * const SlideShow = await prisma.slideShow.delete({
     *   where: {
     *     // ... filter to delete one SlideShow
     *   }
     * })
     * 
     */
    delete<T extends SlideShowDeleteArgs>(args: SelectSubset<T, SlideShowDeleteArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SlideShow.
     * @param {SlideShowUpdateArgs} args - Arguments to update one SlideShow.
     * @example
     * // Update one SlideShow
     * const slideShow = await prisma.slideShow.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SlideShowUpdateArgs>(args: SelectSubset<T, SlideShowUpdateArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SlideShows.
     * @param {SlideShowDeleteManyArgs} args - Arguments to filter SlideShows to delete.
     * @example
     * // Delete a few SlideShows
     * const { count } = await prisma.slideShow.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SlideShowDeleteManyArgs>(args?: SelectSubset<T, SlideShowDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SlideShows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SlideShows
     * const slideShow = await prisma.slideShow.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SlideShowUpdateManyArgs>(args: SelectSubset<T, SlideShowUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SlideShows and returns the data updated in the database.
     * @param {SlideShowUpdateManyAndReturnArgs} args - Arguments to update many SlideShows.
     * @example
     * // Update many SlideShows
     * const slideShow = await prisma.slideShow.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SlideShows and only return the `id`
     * const slideShowWithIdOnly = await prisma.slideShow.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SlideShowUpdateManyAndReturnArgs>(args: SelectSubset<T, SlideShowUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SlideShow.
     * @param {SlideShowUpsertArgs} args - Arguments to update or create a SlideShow.
     * @example
     * // Update or create a SlideShow
     * const slideShow = await prisma.slideShow.upsert({
     *   create: {
     *     // ... data to create a SlideShow
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SlideShow we want to update
     *   }
     * })
     */
    upsert<T extends SlideShowUpsertArgs>(args: SelectSubset<T, SlideShowUpsertArgs<ExtArgs>>): Prisma__SlideShowClient<$Result.GetResult<Prisma.$SlideShowPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SlideShows.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowCountArgs} args - Arguments to filter SlideShows to count.
     * @example
     * // Count the number of SlideShows
     * const count = await prisma.slideShow.count({
     *   where: {
     *     // ... the filter for the SlideShows we want to count
     *   }
     * })
    **/
    count<T extends SlideShowCountArgs>(
      args?: Subset<T, SlideShowCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SlideShowCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SlideShow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SlideShowAggregateArgs>(args: Subset<T, SlideShowAggregateArgs>): Prisma.PrismaPromise<GetSlideShowAggregateType<T>>

    /**
     * Group by SlideShow.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SlideShowGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SlideShowGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SlideShowGroupByArgs['orderBy'] }
        : { orderBy?: SlideShowGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SlideShowGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSlideShowGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SlideShow model
   */
  readonly fields: SlideShowFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SlideShow.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SlideShowClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SlideShow model
   */
  interface SlideShowFieldRefs {
    readonly id: FieldRef<"SlideShow", 'String'>
    readonly title: FieldRef<"SlideShow", 'String'>
    readonly description: FieldRef<"SlideShow", 'String'>
    readonly imageUrl: FieldRef<"SlideShow", 'String'>
    readonly iconType: FieldRef<"SlideShow", 'String'>
    readonly order: FieldRef<"SlideShow", 'Int'>
    readonly isActive: FieldRef<"SlideShow", 'Boolean'>
    readonly createdAt: FieldRef<"SlideShow", 'DateTime'>
    readonly updatedAt: FieldRef<"SlideShow", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SlideShow findUnique
   */
  export type SlideShowFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * Filter, which SlideShow to fetch.
     */
    where: SlideShowWhereUniqueInput
  }

  /**
   * SlideShow findUniqueOrThrow
   */
  export type SlideShowFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * Filter, which SlideShow to fetch.
     */
    where: SlideShowWhereUniqueInput
  }

  /**
   * SlideShow findFirst
   */
  export type SlideShowFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * Filter, which SlideShow to fetch.
     */
    where?: SlideShowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlideShows to fetch.
     */
    orderBy?: SlideShowOrderByWithRelationInput | SlideShowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SlideShows.
     */
    cursor?: SlideShowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlideShows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlideShows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SlideShows.
     */
    distinct?: SlideShowScalarFieldEnum | SlideShowScalarFieldEnum[]
  }

  /**
   * SlideShow findFirstOrThrow
   */
  export type SlideShowFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * Filter, which SlideShow to fetch.
     */
    where?: SlideShowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlideShows to fetch.
     */
    orderBy?: SlideShowOrderByWithRelationInput | SlideShowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SlideShows.
     */
    cursor?: SlideShowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlideShows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlideShows.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SlideShows.
     */
    distinct?: SlideShowScalarFieldEnum | SlideShowScalarFieldEnum[]
  }

  /**
   * SlideShow findMany
   */
  export type SlideShowFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * Filter, which SlideShows to fetch.
     */
    where?: SlideShowWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SlideShows to fetch.
     */
    orderBy?: SlideShowOrderByWithRelationInput | SlideShowOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SlideShows.
     */
    cursor?: SlideShowWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SlideShows from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SlideShows.
     */
    skip?: number
    distinct?: SlideShowScalarFieldEnum | SlideShowScalarFieldEnum[]
  }

  /**
   * SlideShow create
   */
  export type SlideShowCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * The data needed to create a SlideShow.
     */
    data: XOR<SlideShowCreateInput, SlideShowUncheckedCreateInput>
  }

  /**
   * SlideShow createMany
   */
  export type SlideShowCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SlideShows.
     */
    data: SlideShowCreateManyInput | SlideShowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SlideShow createManyAndReturn
   */
  export type SlideShowCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * The data used to create many SlideShows.
     */
    data: SlideShowCreateManyInput | SlideShowCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SlideShow update
   */
  export type SlideShowUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * The data needed to update a SlideShow.
     */
    data: XOR<SlideShowUpdateInput, SlideShowUncheckedUpdateInput>
    /**
     * Choose, which SlideShow to update.
     */
    where: SlideShowWhereUniqueInput
  }

  /**
   * SlideShow updateMany
   */
  export type SlideShowUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SlideShows.
     */
    data: XOR<SlideShowUpdateManyMutationInput, SlideShowUncheckedUpdateManyInput>
    /**
     * Filter which SlideShows to update
     */
    where?: SlideShowWhereInput
    /**
     * Limit how many SlideShows to update.
     */
    limit?: number
  }

  /**
   * SlideShow updateManyAndReturn
   */
  export type SlideShowUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * The data used to update SlideShows.
     */
    data: XOR<SlideShowUpdateManyMutationInput, SlideShowUncheckedUpdateManyInput>
    /**
     * Filter which SlideShows to update
     */
    where?: SlideShowWhereInput
    /**
     * Limit how many SlideShows to update.
     */
    limit?: number
  }

  /**
   * SlideShow upsert
   */
  export type SlideShowUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * The filter to search for the SlideShow to update in case it exists.
     */
    where: SlideShowWhereUniqueInput
    /**
     * In case the SlideShow found by the `where` argument doesn't exist, create a new SlideShow with this data.
     */
    create: XOR<SlideShowCreateInput, SlideShowUncheckedCreateInput>
    /**
     * In case the SlideShow was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SlideShowUpdateInput, SlideShowUncheckedUpdateInput>
  }

  /**
   * SlideShow delete
   */
  export type SlideShowDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
    /**
     * Filter which SlideShow to delete.
     */
    where: SlideShowWhereUniqueInput
  }

  /**
   * SlideShow deleteMany
   */
  export type SlideShowDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SlideShows to delete
     */
    where?: SlideShowWhereInput
    /**
     * Limit how many SlideShows to delete.
     */
    limit?: number
  }

  /**
   * SlideShow without action
   */
  export type SlideShowDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SlideShow
     */
    select?: SlideShowSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SlideShow
     */
    omit?: SlideShowOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password_hash: 'password_hash',
    role: 'role',
    subscription_plan: 'subscription_plan',
    subscription_status: 'subscription_status',
    created_at: 'created_at',
    updated_at: 'updated_at',
    stripe_customer_id: 'stripe_customer_id',
    stripe_subscription_id: 'stripe_subscription_id',
    subscription_current_period_start: 'subscription_current_period_start',
    subscription_current_period_end: 'subscription_current_period_end',
    profile_image: 'profile_image',
    username: 'username',
    phone: 'phone',
    reset_token: 'reset_token',
    reset_token_expires: 'reset_token_expires',
    remember_token: 'remember_token'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const PageScalarFieldEnum: {
    id: 'id',
    title: 'title',
    slug: 'slug',
    status: 'status',
    last_updated: 'last_updated',
    content: 'content',
    created_at: 'created_at',
    updated_at: 'updated_at',
    parent_id: 'parent_id',
    menu_order: 'menu_order',
    page_template: 'page_template',
    show_in_menu: 'show_in_menu',
    show_in_footer: 'show_in_footer',
    meta_title: 'meta_title',
    meta_description: 'meta_description',
    page_builder_content: 'page_builder_content',
    use_page_builder: 'use_page_builder',
    builder_template: 'builder_template'
  };

  export type PageScalarFieldEnum = (typeof PageScalarFieldEnum)[keyof typeof PageScalarFieldEnum]


  export const StaffMemberScalarFieldEnum: {
    id: 'id',
    name: 'name',
    email: 'email',
    password: 'password',
    role: 'role',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type StaffMemberScalarFieldEnum = (typeof StaffMemberScalarFieldEnum)[keyof typeof StaffMemberScalarFieldEnum]


  export const JobScalarFieldEnum: {
    id: 'id',
    title: 'title',
    department: 'department',
    location: 'location',
    type: 'type',
    description: 'description',
    responsibilities: 'responsibilities',
    requirements: 'requirements',
    benefits: 'benefits',
    salary: 'salary',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type JobScalarFieldEnum = (typeof JobScalarFieldEnum)[keyof typeof JobScalarFieldEnum]


  export const SlideShowScalarFieldEnum: {
    id: 'id',
    title: 'title',
    description: 'description',
    imageUrl: 'imageUrl',
    iconType: 'iconType',
    order: 'order',
    isActive: 'isActive',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SlideShowScalarFieldEnum = (typeof SlideShowScalarFieldEnum)[keyof typeof SlideShowScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const NullableJsonNullValueInput: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull
  };

  export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  export const JsonNullValueFilter: {
    DbNull: typeof DbNull,
    JsonNull: typeof JsonNull,
    AnyNull: typeof AnyNull
  };

  export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Json'
   */
  export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>
    


  /**
   * Reference to a field of type 'QueryMode'
   */
  export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>
    


  /**
   * Reference to a field of type 'Boolean'
   */
  export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: IntFilter<"User"> | number
    name?: StringNullableFilter<"User"> | string | null
    email?: StringFilter<"User"> | string
    password_hash?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    subscription_plan?: StringNullableFilter<"User"> | string | null
    subscription_status?: StringNullableFilter<"User"> | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    stripe_customer_id?: StringNullableFilter<"User"> | string | null
    stripe_subscription_id?: StringNullableFilter<"User"> | string | null
    subscription_current_period_start?: DateTimeNullableFilter<"User"> | Date | string | null
    subscription_current_period_end?: DateTimeNullableFilter<"User"> | Date | string | null
    profile_image?: StringNullableFilter<"User"> | string | null
    username?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    reset_token?: StringNullableFilter<"User"> | string | null
    reset_token_expires?: DateTimeNullableFilter<"User"> | Date | string | null
    remember_token?: StringNullableFilter<"User"> | string | null
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrder
    password_hash?: SortOrderInput | SortOrder
    role?: SortOrder
    subscription_plan?: SortOrderInput | SortOrder
    subscription_status?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    stripe_customer_id?: SortOrderInput | SortOrder
    stripe_subscription_id?: SortOrderInput | SortOrder
    subscription_current_period_start?: SortOrderInput | SortOrder
    subscription_current_period_end?: SortOrderInput | SortOrder
    profile_image?: SortOrderInput | SortOrder
    username?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    reset_token?: SortOrderInput | SortOrder
    reset_token_expires?: SortOrderInput | SortOrder
    remember_token?: SortOrderInput | SortOrder
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    email?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    name?: StringNullableFilter<"User"> | string | null
    password_hash?: StringNullableFilter<"User"> | string | null
    role?: StringFilter<"User"> | string
    subscription_plan?: StringNullableFilter<"User"> | string | null
    subscription_status?: StringNullableFilter<"User"> | string | null
    created_at?: DateTimeFilter<"User"> | Date | string
    updated_at?: DateTimeFilter<"User"> | Date | string
    stripe_customer_id?: StringNullableFilter<"User"> | string | null
    stripe_subscription_id?: StringNullableFilter<"User"> | string | null
    subscription_current_period_start?: DateTimeNullableFilter<"User"> | Date | string | null
    subscription_current_period_end?: DateTimeNullableFilter<"User"> | Date | string | null
    profile_image?: StringNullableFilter<"User"> | string | null
    username?: StringNullableFilter<"User"> | string | null
    phone?: StringNullableFilter<"User"> | string | null
    reset_token?: StringNullableFilter<"User"> | string | null
    reset_token_expires?: DateTimeNullableFilter<"User"> | Date | string | null
    remember_token?: StringNullableFilter<"User"> | string | null
  }, "id" | "email">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrderInput | SortOrder
    email?: SortOrder
    password_hash?: SortOrderInput | SortOrder
    role?: SortOrder
    subscription_plan?: SortOrderInput | SortOrder
    subscription_status?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    stripe_customer_id?: SortOrderInput | SortOrder
    stripe_subscription_id?: SortOrderInput | SortOrder
    subscription_current_period_start?: SortOrderInput | SortOrder
    subscription_current_period_end?: SortOrderInput | SortOrder
    profile_image?: SortOrderInput | SortOrder
    username?: SortOrderInput | SortOrder
    phone?: SortOrderInput | SortOrder
    reset_token?: SortOrderInput | SortOrder
    reset_token_expires?: SortOrderInput | SortOrder
    remember_token?: SortOrderInput | SortOrder
    _count?: UserCountOrderByAggregateInput
    _avg?: UserAvgOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
    _sum?: UserSumOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"User"> | number
    name?: StringNullableWithAggregatesFilter<"User"> | string | null
    email?: StringWithAggregatesFilter<"User"> | string
    password_hash?: StringNullableWithAggregatesFilter<"User"> | string | null
    role?: StringWithAggregatesFilter<"User"> | string
    subscription_plan?: StringNullableWithAggregatesFilter<"User"> | string | null
    subscription_status?: StringNullableWithAggregatesFilter<"User"> | string | null
    created_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"User"> | Date | string
    stripe_customer_id?: StringNullableWithAggregatesFilter<"User"> | string | null
    stripe_subscription_id?: StringNullableWithAggregatesFilter<"User"> | string | null
    subscription_current_period_start?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    subscription_current_period_end?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    profile_image?: StringNullableWithAggregatesFilter<"User"> | string | null
    username?: StringNullableWithAggregatesFilter<"User"> | string | null
    phone?: StringNullableWithAggregatesFilter<"User"> | string | null
    reset_token?: StringNullableWithAggregatesFilter<"User"> | string | null
    reset_token_expires?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    remember_token?: StringNullableWithAggregatesFilter<"User"> | string | null
  }

  export type PageWhereInput = {
    AND?: PageWhereInput | PageWhereInput[]
    OR?: PageWhereInput[]
    NOT?: PageWhereInput | PageWhereInput[]
    id?: IntFilter<"Page"> | number
    title?: StringFilter<"Page"> | string
    slug?: StringFilter<"Page"> | string
    status?: StringNullableFilter<"Page"> | string | null
    last_updated?: DateTimeNullableFilter<"Page"> | Date | string | null
    content?: JsonNullableFilter<"Page">
    created_at?: DateTimeFilter<"Page"> | Date | string
    updated_at?: DateTimeFilter<"Page"> | Date | string
    parent_id?: IntNullableFilter<"Page"> | number | null
    menu_order?: IntNullableFilter<"Page"> | number | null
    page_template?: StringNullableFilter<"Page"> | string | null
    show_in_menu?: BoolNullableFilter<"Page"> | boolean | null
    show_in_footer?: BoolNullableFilter<"Page"> | boolean | null
    meta_title?: StringNullableFilter<"Page"> | string | null
    meta_description?: StringNullableFilter<"Page"> | string | null
    page_builder_content?: StringNullableFilter<"Page"> | string | null
    use_page_builder?: BoolNullableFilter<"Page"> | boolean | null
    builder_template?: StringNullableFilter<"Page"> | string | null
  }

  export type PageOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    status?: SortOrderInput | SortOrder
    last_updated?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    parent_id?: SortOrderInput | SortOrder
    menu_order?: SortOrderInput | SortOrder
    page_template?: SortOrderInput | SortOrder
    show_in_menu?: SortOrderInput | SortOrder
    show_in_footer?: SortOrderInput | SortOrder
    meta_title?: SortOrderInput | SortOrder
    meta_description?: SortOrderInput | SortOrder
    page_builder_content?: SortOrderInput | SortOrder
    use_page_builder?: SortOrderInput | SortOrder
    builder_template?: SortOrderInput | SortOrder
  }

  export type PageWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    slug?: string
    AND?: PageWhereInput | PageWhereInput[]
    OR?: PageWhereInput[]
    NOT?: PageWhereInput | PageWhereInput[]
    title?: StringFilter<"Page"> | string
    status?: StringNullableFilter<"Page"> | string | null
    last_updated?: DateTimeNullableFilter<"Page"> | Date | string | null
    content?: JsonNullableFilter<"Page">
    created_at?: DateTimeFilter<"Page"> | Date | string
    updated_at?: DateTimeFilter<"Page"> | Date | string
    parent_id?: IntNullableFilter<"Page"> | number | null
    menu_order?: IntNullableFilter<"Page"> | number | null
    page_template?: StringNullableFilter<"Page"> | string | null
    show_in_menu?: BoolNullableFilter<"Page"> | boolean | null
    show_in_footer?: BoolNullableFilter<"Page"> | boolean | null
    meta_title?: StringNullableFilter<"Page"> | string | null
    meta_description?: StringNullableFilter<"Page"> | string | null
    page_builder_content?: StringNullableFilter<"Page"> | string | null
    use_page_builder?: BoolNullableFilter<"Page"> | boolean | null
    builder_template?: StringNullableFilter<"Page"> | string | null
  }, "id" | "slug">

  export type PageOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    status?: SortOrderInput | SortOrder
    last_updated?: SortOrderInput | SortOrder
    content?: SortOrderInput | SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    parent_id?: SortOrderInput | SortOrder
    menu_order?: SortOrderInput | SortOrder
    page_template?: SortOrderInput | SortOrder
    show_in_menu?: SortOrderInput | SortOrder
    show_in_footer?: SortOrderInput | SortOrder
    meta_title?: SortOrderInput | SortOrder
    meta_description?: SortOrderInput | SortOrder
    page_builder_content?: SortOrderInput | SortOrder
    use_page_builder?: SortOrderInput | SortOrder
    builder_template?: SortOrderInput | SortOrder
    _count?: PageCountOrderByAggregateInput
    _avg?: PageAvgOrderByAggregateInput
    _max?: PageMaxOrderByAggregateInput
    _min?: PageMinOrderByAggregateInput
    _sum?: PageSumOrderByAggregateInput
  }

  export type PageScalarWhereWithAggregatesInput = {
    AND?: PageScalarWhereWithAggregatesInput | PageScalarWhereWithAggregatesInput[]
    OR?: PageScalarWhereWithAggregatesInput[]
    NOT?: PageScalarWhereWithAggregatesInput | PageScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Page"> | number
    title?: StringWithAggregatesFilter<"Page"> | string
    slug?: StringWithAggregatesFilter<"Page"> | string
    status?: StringNullableWithAggregatesFilter<"Page"> | string | null
    last_updated?: DateTimeNullableWithAggregatesFilter<"Page"> | Date | string | null
    content?: JsonNullableWithAggregatesFilter<"Page">
    created_at?: DateTimeWithAggregatesFilter<"Page"> | Date | string
    updated_at?: DateTimeWithAggregatesFilter<"Page"> | Date | string
    parent_id?: IntNullableWithAggregatesFilter<"Page"> | number | null
    menu_order?: IntNullableWithAggregatesFilter<"Page"> | number | null
    page_template?: StringNullableWithAggregatesFilter<"Page"> | string | null
    show_in_menu?: BoolNullableWithAggregatesFilter<"Page"> | boolean | null
    show_in_footer?: BoolNullableWithAggregatesFilter<"Page"> | boolean | null
    meta_title?: StringNullableWithAggregatesFilter<"Page"> | string | null
    meta_description?: StringNullableWithAggregatesFilter<"Page"> | string | null
    page_builder_content?: StringNullableWithAggregatesFilter<"Page"> | string | null
    use_page_builder?: BoolNullableWithAggregatesFilter<"Page"> | boolean | null
    builder_template?: StringNullableWithAggregatesFilter<"Page"> | string | null
  }

  export type StaffMemberWhereInput = {
    AND?: StaffMemberWhereInput | StaffMemberWhereInput[]
    OR?: StaffMemberWhereInput[]
    NOT?: StaffMemberWhereInput | StaffMemberWhereInput[]
    id?: StringFilter<"StaffMember"> | string
    name?: StringFilter<"StaffMember"> | string
    email?: StringFilter<"StaffMember"> | string
    password?: StringFilter<"StaffMember"> | string
    role?: StringFilter<"StaffMember"> | string
    isActive?: BoolFilter<"StaffMember"> | boolean
    createdAt?: DateTimeFilter<"StaffMember"> | Date | string
    updatedAt?: DateTimeFilter<"StaffMember"> | Date | string
  }

  export type StaffMemberOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMemberWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    email?: string
    AND?: StaffMemberWhereInput | StaffMemberWhereInput[]
    OR?: StaffMemberWhereInput[]
    NOT?: StaffMemberWhereInput | StaffMemberWhereInput[]
    name?: StringFilter<"StaffMember"> | string
    password?: StringFilter<"StaffMember"> | string
    role?: StringFilter<"StaffMember"> | string
    isActive?: BoolFilter<"StaffMember"> | boolean
    createdAt?: DateTimeFilter<"StaffMember"> | Date | string
    updatedAt?: DateTimeFilter<"StaffMember"> | Date | string
  }, "id" | "email">

  export type StaffMemberOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: StaffMemberCountOrderByAggregateInput
    _max?: StaffMemberMaxOrderByAggregateInput
    _min?: StaffMemberMinOrderByAggregateInput
  }

  export type StaffMemberScalarWhereWithAggregatesInput = {
    AND?: StaffMemberScalarWhereWithAggregatesInput | StaffMemberScalarWhereWithAggregatesInput[]
    OR?: StaffMemberScalarWhereWithAggregatesInput[]
    NOT?: StaffMemberScalarWhereWithAggregatesInput | StaffMemberScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"StaffMember"> | string
    name?: StringWithAggregatesFilter<"StaffMember"> | string
    email?: StringWithAggregatesFilter<"StaffMember"> | string
    password?: StringWithAggregatesFilter<"StaffMember"> | string
    role?: StringWithAggregatesFilter<"StaffMember"> | string
    isActive?: BoolWithAggregatesFilter<"StaffMember"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"StaffMember"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"StaffMember"> | Date | string
  }

  export type JobWhereInput = {
    AND?: JobWhereInput | JobWhereInput[]
    OR?: JobWhereInput[]
    NOT?: JobWhereInput | JobWhereInput[]
    id?: StringFilter<"Job"> | string
    title?: StringFilter<"Job"> | string
    department?: StringFilter<"Job"> | string
    location?: StringFilter<"Job"> | string
    type?: StringFilter<"Job"> | string
    description?: StringFilter<"Job"> | string
    responsibilities?: StringFilter<"Job"> | string
    requirements?: StringFilter<"Job"> | string
    benefits?: StringNullableFilter<"Job"> | string | null
    salary?: StringNullableFilter<"Job"> | string | null
    isActive?: BoolFilter<"Job"> | boolean
    createdAt?: DateTimeFilter<"Job"> | Date | string
    updatedAt?: DateTimeFilter<"Job"> | Date | string
  }

  export type JobOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    type?: SortOrder
    description?: SortOrder
    responsibilities?: SortOrder
    requirements?: SortOrder
    benefits?: SortOrderInput | SortOrder
    salary?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type JobWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: JobWhereInput | JobWhereInput[]
    OR?: JobWhereInput[]
    NOT?: JobWhereInput | JobWhereInput[]
    title?: StringFilter<"Job"> | string
    department?: StringFilter<"Job"> | string
    location?: StringFilter<"Job"> | string
    type?: StringFilter<"Job"> | string
    description?: StringFilter<"Job"> | string
    responsibilities?: StringFilter<"Job"> | string
    requirements?: StringFilter<"Job"> | string
    benefits?: StringNullableFilter<"Job"> | string | null
    salary?: StringNullableFilter<"Job"> | string | null
    isActive?: BoolFilter<"Job"> | boolean
    createdAt?: DateTimeFilter<"Job"> | Date | string
    updatedAt?: DateTimeFilter<"Job"> | Date | string
  }, "id">

  export type JobOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    type?: SortOrder
    description?: SortOrder
    responsibilities?: SortOrder
    requirements?: SortOrder
    benefits?: SortOrderInput | SortOrder
    salary?: SortOrderInput | SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: JobCountOrderByAggregateInput
    _max?: JobMaxOrderByAggregateInput
    _min?: JobMinOrderByAggregateInput
  }

  export type JobScalarWhereWithAggregatesInput = {
    AND?: JobScalarWhereWithAggregatesInput | JobScalarWhereWithAggregatesInput[]
    OR?: JobScalarWhereWithAggregatesInput[]
    NOT?: JobScalarWhereWithAggregatesInput | JobScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Job"> | string
    title?: StringWithAggregatesFilter<"Job"> | string
    department?: StringWithAggregatesFilter<"Job"> | string
    location?: StringWithAggregatesFilter<"Job"> | string
    type?: StringWithAggregatesFilter<"Job"> | string
    description?: StringWithAggregatesFilter<"Job"> | string
    responsibilities?: StringWithAggregatesFilter<"Job"> | string
    requirements?: StringWithAggregatesFilter<"Job"> | string
    benefits?: StringNullableWithAggregatesFilter<"Job"> | string | null
    salary?: StringNullableWithAggregatesFilter<"Job"> | string | null
    isActive?: BoolWithAggregatesFilter<"Job"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"Job"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Job"> | Date | string
  }

  export type SlideShowWhereInput = {
    AND?: SlideShowWhereInput | SlideShowWhereInput[]
    OR?: SlideShowWhereInput[]
    NOT?: SlideShowWhereInput | SlideShowWhereInput[]
    id?: StringFilter<"SlideShow"> | string
    title?: StringFilter<"SlideShow"> | string
    description?: StringFilter<"SlideShow"> | string
    imageUrl?: StringFilter<"SlideShow"> | string
    iconType?: StringFilter<"SlideShow"> | string
    order?: IntFilter<"SlideShow"> | number
    isActive?: BoolFilter<"SlideShow"> | boolean
    createdAt?: DateTimeFilter<"SlideShow"> | Date | string
    updatedAt?: DateTimeFilter<"SlideShow"> | Date | string
  }

  export type SlideShowOrderByWithRelationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    iconType?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SlideShowWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: SlideShowWhereInput | SlideShowWhereInput[]
    OR?: SlideShowWhereInput[]
    NOT?: SlideShowWhereInput | SlideShowWhereInput[]
    title?: StringFilter<"SlideShow"> | string
    description?: StringFilter<"SlideShow"> | string
    imageUrl?: StringFilter<"SlideShow"> | string
    iconType?: StringFilter<"SlideShow"> | string
    order?: IntFilter<"SlideShow"> | number
    isActive?: BoolFilter<"SlideShow"> | boolean
    createdAt?: DateTimeFilter<"SlideShow"> | Date | string
    updatedAt?: DateTimeFilter<"SlideShow"> | Date | string
  }, "id">

  export type SlideShowOrderByWithAggregationInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    iconType?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SlideShowCountOrderByAggregateInput
    _avg?: SlideShowAvgOrderByAggregateInput
    _max?: SlideShowMaxOrderByAggregateInput
    _min?: SlideShowMinOrderByAggregateInput
    _sum?: SlideShowSumOrderByAggregateInput
  }

  export type SlideShowScalarWhereWithAggregatesInput = {
    AND?: SlideShowScalarWhereWithAggregatesInput | SlideShowScalarWhereWithAggregatesInput[]
    OR?: SlideShowScalarWhereWithAggregatesInput[]
    NOT?: SlideShowScalarWhereWithAggregatesInput | SlideShowScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"SlideShow"> | string
    title?: StringWithAggregatesFilter<"SlideShow"> | string
    description?: StringWithAggregatesFilter<"SlideShow"> | string
    imageUrl?: StringWithAggregatesFilter<"SlideShow"> | string
    iconType?: StringWithAggregatesFilter<"SlideShow"> | string
    order?: IntWithAggregatesFilter<"SlideShow"> | number
    isActive?: BoolWithAggregatesFilter<"SlideShow"> | boolean
    createdAt?: DateTimeWithAggregatesFilter<"SlideShow"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SlideShow"> | Date | string
  }

  export type UserCreateInput = {
    name?: string | null
    email: string
    password_hash?: string | null
    role?: string
    subscription_plan?: string | null
    subscription_status?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    subscription_current_period_start?: Date | string | null
    subscription_current_period_end?: Date | string | null
    profile_image?: string | null
    username?: string | null
    phone?: string | null
    reset_token?: string | null
    reset_token_expires?: Date | string | null
    remember_token?: string | null
  }

  export type UserUncheckedCreateInput = {
    id?: number
    name?: string | null
    email: string
    password_hash?: string | null
    role?: string
    subscription_plan?: string | null
    subscription_status?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    subscription_current_period_start?: Date | string | null
    subscription_current_period_end?: Date | string | null
    profile_image?: string | null
    username?: string | null
    phone?: string | null
    reset_token?: string | null
    reset_token_expires?: Date | string | null
    remember_token?: string | null
  }

  export type UserUpdateInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    subscription_plan?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_status?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile_image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token_expires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    remember_token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    subscription_plan?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_status?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile_image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token_expires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    remember_token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserCreateManyInput = {
    id?: number
    name?: string | null
    email: string
    password_hash?: string | null
    role?: string
    subscription_plan?: string | null
    subscription_status?: string | null
    created_at?: Date | string
    updated_at?: Date | string
    stripe_customer_id?: string | null
    stripe_subscription_id?: string | null
    subscription_current_period_start?: Date | string | null
    subscription_current_period_end?: Date | string | null
    profile_image?: string | null
    username?: string | null
    phone?: string | null
    reset_token?: string | null
    reset_token_expires?: Date | string | null
    remember_token?: string | null
  }

  export type UserUpdateManyMutationInput = {
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    subscription_plan?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_status?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile_image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token_expires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    remember_token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    name?: NullableStringFieldUpdateOperationsInput | string | null
    email?: StringFieldUpdateOperationsInput | string
    password_hash?: NullableStringFieldUpdateOperationsInput | string | null
    role?: StringFieldUpdateOperationsInput | string
    subscription_plan?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_status?: NullableStringFieldUpdateOperationsInput | string | null
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    stripe_customer_id?: NullableStringFieldUpdateOperationsInput | string | null
    stripe_subscription_id?: NullableStringFieldUpdateOperationsInput | string | null
    subscription_current_period_start?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    subscription_current_period_end?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    profile_image?: NullableStringFieldUpdateOperationsInput | string | null
    username?: NullableStringFieldUpdateOperationsInput | string | null
    phone?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token?: NullableStringFieldUpdateOperationsInput | string | null
    reset_token_expires?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    remember_token?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PageCreateInput = {
    title: string
    slug: string
    status?: string | null
    last_updated?: Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    parent_id?: number | null
    menu_order?: number | null
    page_template?: string | null
    show_in_menu?: boolean | null
    show_in_footer?: boolean | null
    meta_title?: string | null
    meta_description?: string | null
    page_builder_content?: string | null
    use_page_builder?: boolean | null
    builder_template?: string | null
  }

  export type PageUncheckedCreateInput = {
    id?: number
    title: string
    slug: string
    status?: string | null
    last_updated?: Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    parent_id?: number | null
    menu_order?: number | null
    page_template?: string | null
    show_in_menu?: boolean | null
    show_in_footer?: boolean | null
    meta_title?: string | null
    meta_description?: string | null
    page_builder_content?: string | null
    use_page_builder?: boolean | null
    builder_template?: string | null
  }

  export type PageUpdateInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    parent_id?: NullableIntFieldUpdateOperationsInput | number | null
    menu_order?: NullableIntFieldUpdateOperationsInput | number | null
    page_template?: NullableStringFieldUpdateOperationsInput | string | null
    show_in_menu?: NullableBoolFieldUpdateOperationsInput | boolean | null
    show_in_footer?: NullableBoolFieldUpdateOperationsInput | boolean | null
    meta_title?: NullableStringFieldUpdateOperationsInput | string | null
    meta_description?: NullableStringFieldUpdateOperationsInput | string | null
    page_builder_content?: NullableStringFieldUpdateOperationsInput | string | null
    use_page_builder?: NullableBoolFieldUpdateOperationsInput | boolean | null
    builder_template?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PageUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    parent_id?: NullableIntFieldUpdateOperationsInput | number | null
    menu_order?: NullableIntFieldUpdateOperationsInput | number | null
    page_template?: NullableStringFieldUpdateOperationsInput | string | null
    show_in_menu?: NullableBoolFieldUpdateOperationsInput | boolean | null
    show_in_footer?: NullableBoolFieldUpdateOperationsInput | boolean | null
    meta_title?: NullableStringFieldUpdateOperationsInput | string | null
    meta_description?: NullableStringFieldUpdateOperationsInput | string | null
    page_builder_content?: NullableStringFieldUpdateOperationsInput | string | null
    use_page_builder?: NullableBoolFieldUpdateOperationsInput | boolean | null
    builder_template?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PageCreateManyInput = {
    id?: number
    title: string
    slug: string
    status?: string | null
    last_updated?: Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: Date | string
    updated_at?: Date | string
    parent_id?: number | null
    menu_order?: number | null
    page_template?: string | null
    show_in_menu?: boolean | null
    show_in_footer?: boolean | null
    meta_title?: string | null
    meta_description?: string | null
    page_builder_content?: string | null
    use_page_builder?: boolean | null
    builder_template?: string | null
  }

  export type PageUpdateManyMutationInput = {
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    parent_id?: NullableIntFieldUpdateOperationsInput | number | null
    menu_order?: NullableIntFieldUpdateOperationsInput | number | null
    page_template?: NullableStringFieldUpdateOperationsInput | string | null
    show_in_menu?: NullableBoolFieldUpdateOperationsInput | boolean | null
    show_in_footer?: NullableBoolFieldUpdateOperationsInput | boolean | null
    meta_title?: NullableStringFieldUpdateOperationsInput | string | null
    meta_description?: NullableStringFieldUpdateOperationsInput | string | null
    page_builder_content?: NullableStringFieldUpdateOperationsInput | string | null
    use_page_builder?: NullableBoolFieldUpdateOperationsInput | boolean | null
    builder_template?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type PageUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    title?: StringFieldUpdateOperationsInput | string
    slug?: StringFieldUpdateOperationsInput | string
    status?: NullableStringFieldUpdateOperationsInput | string | null
    last_updated?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    content?: NullableJsonNullValueInput | InputJsonValue
    created_at?: DateTimeFieldUpdateOperationsInput | Date | string
    updated_at?: DateTimeFieldUpdateOperationsInput | Date | string
    parent_id?: NullableIntFieldUpdateOperationsInput | number | null
    menu_order?: NullableIntFieldUpdateOperationsInput | number | null
    page_template?: NullableStringFieldUpdateOperationsInput | string | null
    show_in_menu?: NullableBoolFieldUpdateOperationsInput | boolean | null
    show_in_footer?: NullableBoolFieldUpdateOperationsInput | boolean | null
    meta_title?: NullableStringFieldUpdateOperationsInput | string | null
    meta_description?: NullableStringFieldUpdateOperationsInput | string | null
    page_builder_content?: NullableStringFieldUpdateOperationsInput | string | null
    use_page_builder?: NullableBoolFieldUpdateOperationsInput | boolean | null
    builder_template?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type StaffMemberCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffMemberUncheckedCreateInput = {
    id?: string
    name: string
    email: string
    password: string
    role: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffMemberUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffMemberUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffMemberCreateManyInput = {
    id?: string
    name: string
    email: string
    password: string
    role: string
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type StaffMemberUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StaffMemberUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    email?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: StringFieldUpdateOperationsInput | string
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobCreateInput = {
    id?: string
    title: string
    department: string
    location: string
    type: string
    description: string
    responsibilities: string
    requirements: string
    benefits?: string | null
    salary?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobUncheckedCreateInput = {
    id?: string
    title: string
    department: string
    location: string
    type: string
    description: string
    responsibilities: string
    requirements: string
    benefits?: string | null
    salary?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    responsibilities?: StringFieldUpdateOperationsInput | string
    requirements?: StringFieldUpdateOperationsInput | string
    benefits?: NullableStringFieldUpdateOperationsInput | string | null
    salary?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    responsibilities?: StringFieldUpdateOperationsInput | string
    requirements?: StringFieldUpdateOperationsInput | string
    benefits?: NullableStringFieldUpdateOperationsInput | string | null
    salary?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobCreateManyInput = {
    id?: string
    title: string
    department: string
    location: string
    type: string
    description: string
    responsibilities: string
    requirements: string
    benefits?: string | null
    salary?: string | null
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type JobUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    responsibilities?: StringFieldUpdateOperationsInput | string
    requirements?: StringFieldUpdateOperationsInput | string
    benefits?: NullableStringFieldUpdateOperationsInput | string | null
    salary?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type JobUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    department?: StringFieldUpdateOperationsInput | string
    location?: StringFieldUpdateOperationsInput | string
    type?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    responsibilities?: StringFieldUpdateOperationsInput | string
    requirements?: StringFieldUpdateOperationsInput | string
    benefits?: NullableStringFieldUpdateOperationsInput | string | null
    salary?: NullableStringFieldUpdateOperationsInput | string | null
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SlideShowCreateInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    iconType: string
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SlideShowUncheckedCreateInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    iconType: string
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SlideShowUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    iconType?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SlideShowUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    iconType?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SlideShowCreateManyInput = {
    id?: string
    title: string
    description: string
    imageUrl: string
    iconType: string
    order?: number
    isActive?: boolean
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SlideShowUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    iconType?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SlideShowUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    title?: StringFieldUpdateOperationsInput | string
    description?: StringFieldUpdateOperationsInput | string
    imageUrl?: StringFieldUpdateOperationsInput | string
    iconType?: StringFieldUpdateOperationsInput | string
    order?: IntFieldUpdateOperationsInput | number
    isActive?: BoolFieldUpdateOperationsInput | boolean
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    subscription_plan?: SortOrder
    subscription_status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    stripe_customer_id?: SortOrder
    stripe_subscription_id?: SortOrder
    subscription_current_period_start?: SortOrder
    subscription_current_period_end?: SortOrder
    profile_image?: SortOrder
    username?: SortOrder
    phone?: SortOrder
    reset_token?: SortOrder
    reset_token_expires?: SortOrder
    remember_token?: SortOrder
  }

  export type UserAvgOrderByAggregateInput = {
    id?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    subscription_plan?: SortOrder
    subscription_status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    stripe_customer_id?: SortOrder
    stripe_subscription_id?: SortOrder
    subscription_current_period_start?: SortOrder
    subscription_current_period_end?: SortOrder
    profile_image?: SortOrder
    username?: SortOrder
    phone?: SortOrder
    reset_token?: SortOrder
    reset_token_expires?: SortOrder
    remember_token?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password_hash?: SortOrder
    role?: SortOrder
    subscription_plan?: SortOrder
    subscription_status?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    stripe_customer_id?: SortOrder
    stripe_subscription_id?: SortOrder
    subscription_current_period_start?: SortOrder
    subscription_current_period_end?: SortOrder
    profile_image?: SortOrder
    username?: SortOrder
    phone?: SortOrder
    reset_token?: SortOrder
    reset_token_expires?: SortOrder
    remember_token?: SortOrder
  }

  export type UserSumOrderByAggregateInput = {
    id?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }
  export type JsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type BoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }

  export type PageCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    last_updated?: SortOrder
    content?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    parent_id?: SortOrder
    menu_order?: SortOrder
    page_template?: SortOrder
    show_in_menu?: SortOrder
    show_in_footer?: SortOrder
    meta_title?: SortOrder
    meta_description?: SortOrder
    page_builder_content?: SortOrder
    use_page_builder?: SortOrder
    builder_template?: SortOrder
  }

  export type PageAvgOrderByAggregateInput = {
    id?: SortOrder
    parent_id?: SortOrder
    menu_order?: SortOrder
  }

  export type PageMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    last_updated?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    parent_id?: SortOrder
    menu_order?: SortOrder
    page_template?: SortOrder
    show_in_menu?: SortOrder
    show_in_footer?: SortOrder
    meta_title?: SortOrder
    meta_description?: SortOrder
    page_builder_content?: SortOrder
    use_page_builder?: SortOrder
    builder_template?: SortOrder
  }

  export type PageMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    slug?: SortOrder
    status?: SortOrder
    last_updated?: SortOrder
    created_at?: SortOrder
    updated_at?: SortOrder
    parent_id?: SortOrder
    menu_order?: SortOrder
    page_template?: SortOrder
    show_in_menu?: SortOrder
    show_in_footer?: SortOrder
    meta_title?: SortOrder
    meta_description?: SortOrder
    page_builder_content?: SortOrder
    use_page_builder?: SortOrder
    builder_template?: SortOrder
  }

  export type PageSumOrderByAggregateInput = {
    id?: SortOrder
    parent_id?: SortOrder
    menu_order?: SortOrder
  }
  export type JsonNullableWithAggregatesFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, Exclude<keyof Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>,
        Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<JsonNullableWithAggregatesFilterBase<$PrismaModel>>, 'path'>>

  export type JsonNullableWithAggregatesFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedJsonNullableFilter<$PrismaModel>
    _max?: NestedJsonNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type BoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type BoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type StaffMemberCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMemberMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type StaffMemberMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    email?: SortOrder
    password?: SortOrder
    role?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type BoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }

  export type JobCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    type?: SortOrder
    description?: SortOrder
    responsibilities?: SortOrder
    requirements?: SortOrder
    benefits?: SortOrder
    salary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type JobMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    type?: SortOrder
    description?: SortOrder
    responsibilities?: SortOrder
    requirements?: SortOrder
    benefits?: SortOrder
    salary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type JobMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    department?: SortOrder
    location?: SortOrder
    type?: SortOrder
    description?: SortOrder
    responsibilities?: SortOrder
    requirements?: SortOrder
    benefits?: SortOrder
    salary?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SlideShowCountOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    iconType?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SlideShowAvgOrderByAggregateInput = {
    order?: SortOrder
  }

  export type SlideShowMaxOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    iconType?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SlideShowMinOrderByAggregateInput = {
    id?: SortOrder
    title?: SortOrder
    description?: SortOrder
    imageUrl?: SortOrder
    iconType?: SortOrder
    order?: SortOrder
    isActive?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SlideShowSumOrderByAggregateInput = {
    order?: SortOrder
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type NullableBoolFieldUpdateOperationsInput = {
    set?: boolean | null
  }

  export type BoolFieldUpdateOperationsInput = {
    set?: boolean
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedBoolNullableFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableFilter<$PrismaModel> | boolean | null
  }
  export type NestedJsonNullableFilter<$PrismaModel = never> =
    | PatchUndefined<
        Either<Required<NestedJsonNullableFilterBase<$PrismaModel>>, Exclude<keyof Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>,
        Required<NestedJsonNullableFilterBase<$PrismaModel>>
      >
    | OptionalFlat<Omit<Required<NestedJsonNullableFilterBase<$PrismaModel>>, 'path'>>

  export type NestedJsonNullableFilterBase<$PrismaModel = never> = {
    equals?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
    path?: string[]
    mode?: QueryMode | EnumQueryModeFieldRefInput<$PrismaModel>
    string_contains?: string | StringFieldRefInput<$PrismaModel>
    string_starts_with?: string | StringFieldRefInput<$PrismaModel>
    string_ends_with?: string | StringFieldRefInput<$PrismaModel>
    array_starts_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_ends_with?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    array_contains?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | null
    lt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    lte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gt?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    gte?: InputJsonValue | JsonFieldRefInput<$PrismaModel>
    not?: InputJsonValue | JsonFieldRefInput<$PrismaModel> | JsonNullValueFilter
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBoolNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel> | null
    not?: NestedBoolNullableWithAggregatesFilter<$PrismaModel> | boolean | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBoolNullableFilter<$PrismaModel>
    _max?: NestedBoolNullableFilter<$PrismaModel>
  }

  export type NestedBoolFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolFilter<$PrismaModel> | boolean
  }

  export type NestedBoolWithAggregatesFilter<$PrismaModel = never> = {
    equals?: boolean | BooleanFieldRefInput<$PrismaModel>
    not?: NestedBoolWithAggregatesFilter<$PrismaModel> | boolean
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedBoolFilter<$PrismaModel>
    _max?: NestedBoolFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}