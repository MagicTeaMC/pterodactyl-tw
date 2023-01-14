/** Essentials */
export declare type KeyofBase = keyof any;
export declare type Primitive = string | number | boolean | bigint | symbol | undefined | null;
export declare type Builtin = Primitive | Function | Date | Error | RegExp;
export declare type IsTuple<T> = T extends any[] ? (any[] extends T ? never : T) : never;
declare type AnyRecord<T = any> = Record<KeyofBase, T>;
export declare type IsAny<T> = 0 extends 1 & T ? true : false;
export declare type IsNever<T> = [T] extends [never] ? true : false;
export declare type IsUnknown<T> = IsAny<T> extends true ? false : unknown extends T ? true : false;
export declare type AnyArray<T = any> = Array<T> | ReadonlyArray<T>;
export declare type ArrayOrSingle<T> = T | T[];
declare type NonUndefinable<T> = T extends undefined ? never : T;
/**
 * Like Record, but can be used with only one argument.
 * Useful, if you want to make sure that all of the keys of a finite type are used.
 */
export declare type Dictionary<T, K extends KeyofBase = string> = {
  [key in K]: T;
};
/** Given Dictionary<T> returns T */
export declare type DictionaryValues<T> = T[keyof T];
/**
 * Like Dictionary, but:
 *  - ensures type safety of index access
 *  - does not enforce key exhaustiveness
 */
export declare type SafeDictionary<T, K extends KeyofBase = string> = {
  [key in K]?: T;
};
/** Like Partial but recursive */
export declare type DeepPartial<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepPartial<K>, DeepPartial<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepPartial<K>, DeepPartial<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepPartial<K>, DeepPartial<V>>
  : T extends Set<infer U>
  ? Set<DeepPartial<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepPartial<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepPartial<U>>
  : T extends Array<infer U>
  ? T extends IsTuple<T>
    ? {
        [K in keyof T]?: DeepPartial<T[K]>;
      }
    : Array<DeepPartial<U>>
  : T extends Promise<infer U>
  ? Promise<DeepPartial<U>>
  : T extends {}
  ? {
      [K in keyof T]?: DeepPartial<T[K]>;
    }
  : IsUnknown<T> extends true
  ? unknown
  : Partial<T>;
/** Recursive nullable */
export declare type DeepNullable<T> = T extends Builtin
  ? T | null
  : T extends Map<infer K, infer V>
  ? Map<DeepNullable<K>, DeepNullable<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepNullable<K>, DeepNullable<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepNullable<K>, DeepNullable<V>>
  : T extends Set<infer U>
  ? Set<DeepNullable<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepNullable<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepNullable<U>>
  : T extends Array<infer U>
  ? T extends IsTuple<T>
    ? {
        [K in keyof T]: DeepNullable<T[K]> | null;
      }
    : Array<DeepNullable<U>>
  : T extends Promise<infer U>
  ? Promise<DeepNullable<U>>
  : T extends {}
  ? {
      [K in keyof T]: DeepNullable<T[K]>;
    }
  : T | null;
/** Recursive undefinable */
export declare type DeepUndefinable<T> = T extends Builtin
  ? T | undefined
  : T extends Map<infer K, infer V>
  ? Map<DeepUndefinable<K>, DeepUndefinable<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepUndefinable<K>, DeepUndefinable<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepUndefinable<K>, DeepUndefinable<V>>
  : T extends Set<infer U>
  ? Set<DeepUndefinable<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepUndefinable<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepUndefinable<U>>
  : T extends Array<infer U>
  ? T extends IsTuple<T>
    ? {
        [K in keyof T]: DeepUndefinable<T[K]> | undefined;
      }
    : Array<DeepUndefinable<U>>
  : T extends Promise<infer U>
  ? Promise<DeepUndefinable<U>>
  : T extends {}
  ? {
      [K in keyof T]: DeepUndefinable<T[K]>;
    }
  : T | undefined;
/** Like NonNullable but recursive */
export declare type DeepNonNullable<T> = T extends Builtin
  ? NonNullable<T>
  : T extends Map<infer K, infer V>
  ? Map<DeepNonNullable<K>, DeepNonNullable<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepNonNullable<K>, DeepNonNullable<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepNonNullable<K>, DeepNonNullable<V>>
  : T extends Set<infer U>
  ? Set<DeepNonNullable<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepNonNullable<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepNonNullable<U>>
  : T extends Promise<infer U>
  ? Promise<DeepNonNullable<U>>
  : T extends {}
  ? {
      [K in keyof T]: DeepNonNullable<T[K]>;
    }
  : NonNullable<T>;
/** Like Required but recursive */
export declare type DeepRequired<T> = T extends Error
  ? Required<T>
  : T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepRequired<K>, DeepRequired<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepRequired<K>, DeepRequired<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepRequired<K>, DeepRequired<V>>
  : T extends Set<infer U>
  ? Set<DeepRequired<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepRequired<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepRequired<U>>
  : T extends Promise<infer U>
  ? Promise<DeepRequired<U>>
  : T extends {}
  ? {
      [K in keyof T]-?: DeepRequired<T[K]>;
    }
  : Required<T>;
/** Like Readonly but recursive */
export declare type DeepReadonly<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepReadonly<K>, DeepReadonly<V>>
  : T extends Set<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends ReadonlySet<infer U>
  ? ReadonlySet<DeepReadonly<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepReadonly<U>>
  : T extends Promise<infer U>
  ? Promise<DeepReadonly<U>>
  : T extends {}
  ? {
      readonly [K in keyof T]: DeepReadonly<T[K]>;
    }
  : IsUnknown<T> extends true
  ? unknown
  : Readonly<T>;
/** Make readonly object writable */
export declare type Writable<T> = {
  -readonly [P in keyof T]: T[P];
};
/** Like Writable but recursive */
export declare type DeepWritable<T> = T extends Builtin
  ? T
  : T extends Map<infer K, infer V>
  ? Map<DeepWritable<K>, DeepWritable<V>>
  : T extends ReadonlyMap<infer K, infer V>
  ? Map<DeepWritable<K>, DeepWritable<V>>
  : T extends WeakMap<infer K, infer V>
  ? WeakMap<DeepWritable<K>, DeepWritable<V>>
  : T extends Set<infer U>
  ? Set<DeepWritable<U>>
  : T extends ReadonlySet<infer U>
  ? Set<DeepWritable<U>>
  : T extends WeakSet<infer U>
  ? WeakSet<DeepWritable<U>>
  : T extends Promise<infer U>
  ? Promise<DeepWritable<U>>
  : T extends {}
  ? {
      -readonly [K in keyof T]: DeepWritable<T[K]>;
    }
  : T;
/** Combination of DeepPartial and DeepWritable */
export declare type Buildable<T> = DeepPartial<DeepWritable<T>>;
/** Similar to the builtin Omit, but checks the filter strictly. */
export declare type StrictOmit<T extends AnyRecord, K extends keyof T> = T extends AnyArray ? never : Omit<T, K>;
/** Similar to the builtin Extract, but checks the filter strictly */
export declare type StrictExtract<T, U extends Partial<T>> = Extract<T, U>;
declare type PickKeysByValue<T, V> = {
  [K in keyof T]: T[K] extends V ? K : never;
}[keyof T];
/** Omit all properties of given type in object type */
export declare type OmitProperties<T, P> = Omit<T, PickKeysByValue<T, P>>;
/** Pick all properties of given type in object type */
export declare type PickProperties<T, P> = Pick<T, PickKeysByValue<T, P>>;
/** Gets keys of an object which are optional */
export declare type OptionalKeys<T> = T extends unknown
  ? {
      [K in keyof T]-?: undefined extends {
        [K2 in keyof T]: K2;
      }[K]
        ? K
        : never;
    }[keyof T]
  : never;
/** Gets keys of an object which are required */
export declare type RequiredKeys<T> = T extends unknown ? Exclude<keyof T, OptionalKeys<T>> : never;
/** Gets keys of properties of given type in object type */
export declare type PickKeys<T, P> = Exclude<keyof PickProperties<T, P>, undefined>;
/** Recursively omit deep properties */
export declare type DeepOmit<T, Filter extends DeepModify<T>> = T extends Builtin
  ? T
  : T extends Map<infer KeyType, infer ValueType>
  ? Filter extends Map<KeyType, infer FilterValueType>
    ? FilterValueType extends DeepModify<ValueType>
      ? Map<KeyType, DeepOmit<ValueType, FilterValueType>>
      : T
    : T
  : T extends ReadonlyMap<infer KeyType, infer ValueType>
  ? Filter extends ReadonlyMap<KeyType, infer FilterValueType>
    ? FilterValueType extends DeepModify<ValueType>
      ? ReadonlyMap<KeyType, DeepOmit<ValueType, FilterValueType>>
      : T
    : T
  : T extends WeakMap<infer KeyType, infer ValueType>
  ? Filter extends WeakMap<KeyType, infer FilterValueType>
    ? FilterValueType extends DeepModify<ValueType>
      ? WeakMap<KeyType, DeepOmit<ValueType, FilterValueType>>
      : T
    : T
  : T extends Set<infer ItemType>
  ? Filter extends Set<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? Set<DeepOmit<ItemType, FilterItemType>>
      : T
    : T
  : T extends ReadonlySet<infer ItemType>
  ? Filter extends ReadonlySet<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? ReadonlySet<DeepOmit<ItemType, FilterItemType>>
      : T
    : T
  : T extends WeakSet<infer ItemType>
  ? Filter extends WeakSet<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? WeakSet<DeepOmit<ItemType, FilterItemType>>
      : T
    : T
  : T extends Array<infer ItemType>
  ? Filter extends Array<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? Array<DeepOmit<ItemType, FilterItemType>>
      : T
    : T
  : T extends Promise<infer ItemType>
  ? Filter extends Promise<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? Promise<DeepOmit<ItemType, FilterItemType>>
      : T
    : T
  : Filter extends AnyRecord
  ? {
      [K in keyof T as K extends keyof Filter ? (Filter[K] extends true ? never : K) : K]: K extends keyof Filter
        ? Filter[K] extends DeepModify<T[K]>
          ? DeepOmit<T[K], Filter[K]>
          : T[K]
        : T[K];
    }
  : never;
/** Recursively pick deep properties */
export declare type DeepPick<T, Filter extends DeepModify<T>> = T extends Builtin
  ? T
  : T extends Map<infer KeyType, infer ValueType>
  ? Filter extends Map<KeyType, infer FilterValueType>
    ? FilterValueType extends DeepModify<ValueType>
      ? Map<KeyType, DeepPick<ValueType, FilterValueType>>
      : T
    : T
  : T extends ReadonlyMap<infer KeyType, infer ValueType>
  ? Filter extends ReadonlyMap<KeyType, infer FilterValueType>
    ? FilterValueType extends DeepModify<ValueType>
      ? ReadonlyMap<KeyType, DeepPick<ValueType, FilterValueType>>
      : T
    : T
  : T extends WeakMap<infer KeyType, infer ValueType>
  ? Filter extends WeakMap<KeyType, infer FilterValueType>
    ? FilterValueType extends DeepModify<ValueType>
      ? WeakMap<KeyType, DeepPick<ValueType, FilterValueType>>
      : T
    : T
  : T extends Set<infer ItemType>
  ? Filter extends Set<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? Set<DeepPick<ItemType, FilterItemType>>
      : T
    : T
  : T extends ReadonlySet<infer ItemType>
  ? Filter extends ReadonlySet<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? ReadonlySet<DeepPick<ItemType, FilterItemType>>
      : T
    : T
  : T extends WeakSet<infer ItemType>
  ? Filter extends WeakSet<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? WeakSet<DeepPick<ItemType, FilterItemType>>
      : T
    : T
  : T extends Array<infer ItemType>
  ? Filter extends Array<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? Array<DeepPick<ItemType, FilterItemType>>
      : T
    : T
  : T extends Promise<infer ItemType>
  ? Filter extends Promise<infer FilterItemType>
    ? FilterItemType extends DeepModify<ItemType>
      ? Promise<DeepPick<ItemType, FilterItemType>>
      : T
    : T
  : Filter extends AnyRecord
  ? {
      [K in keyof T as K extends keyof Filter ? K : never]: Filter[K & keyof Filter] extends true
        ? T[K]
        : K extends keyof Filter
        ? Filter[K] extends DeepModify<T[K]>
          ? DeepPick<T[K], Filter[K]>
          : never
        : never;
    }
  : never;
declare type DeepModify<T> =
  | (T extends AnyRecord
      ? {
          [K in keyof T]?: undefined extends {
            [K2 in keyof T]: K2;
          }[K]
            ? NonUndefinable<T[K]> extends object
              ? true | DeepModify<NonUndefinable<T[K]>>
              : true
            : T[K] extends object
            ? true | DeepModify<T[K]>
            : true;
        }
      : never)
  | (T extends Array<infer E> ? Array<DeepModify<E>> : never)
  | (T extends Promise<infer E> ? Promise<DeepModify<E>> : never)
  | (T extends Set<infer E> ? Set<DeepModify<E>> : never)
  | (T extends ReadonlySet<infer E> ? ReadonlySet<DeepModify<E>> : never)
  | (T extends WeakSet<infer E> ? WeakSet<DeepModify<E>> : never)
  | (T extends Map<infer K, infer E> ? Map<K, DeepModify<E>> : never)
  | (T extends ReadonlyMap<infer K, infer E> ? ReadonlyMap<K, DeepModify<E>> : never)
  | (T extends WeakMap<infer K, infer E> ? WeakMap<K, DeepModify<E>> : never);
/** Remove keys with `never` value from object type */
export declare type NonNever<T extends {}> = Pick<
  T,
  {
    [K in keyof T]: T[K] extends never ? never : K;
  }[keyof T]
>;
export declare type NonEmptyObject<T extends {}> = keyof T extends never ? never : T;
/** Merge 2 types, properties types from the latter override the ones defined on the former type */
export declare type Merge<M, N> = Omit<M, keyof N> & N;
declare type _MergeN<T extends readonly any[], Result> = T extends readonly [infer Head, ...infer Tail]
  ? _MergeN<Tail, Merge<Result, Head>>
  : Result;
/** Merge N types, properties types from the latter override the ones defined on the former type */
export declare type MergeN<T extends readonly any[]> = _MergeN<T, {}>;
/** Mark some properties as required, leaving others unchanged */
export declare type MarkRequired<T, RK extends keyof T> = Exclude<T, RK> & Required<Pick<T, RK>>;
/** Mark some properties as optional, leaving others unchanged */
export declare type MarkOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
/** Convert union type to intersection #darkmagic */
export declare type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never;
declare type StringLiteral<T> = T extends string ? (string extends T ? never : T) : never;
declare const __OPAQUE_TYPE__: unique symbol;
/** Easily create opaque types ie. types that are subset of their original types (ex: positive numbers, uppercased string) */
export declare type Opaque<Type, Token extends string> = Token extends StringLiteral<Token>
  ? Type & {
      readonly [__OPAQUE_TYPE__]: Token;
    }
  : never;
/** Easily extract the type of a given object's values */
export declare type ValueOf<T> = T[keyof T];
/** Easily extract the type of a given array's elements */
export declare type ElementOf<T extends readonly any[]> = T extends readonly (infer ET)[] ? ET : never;
/** Type constraint for tuple inference */
export declare type Tuple<T = any> = [T] | T[];
/** Useful as a return type in interfaces or abstract classes with missing implementation */
export declare type AsyncOrSync<T> = PromiseLike<T> | T;
export declare type Awaited<T> = T extends PromiseLike<infer PT> ? PT : never;
export declare type AsyncOrSyncType<T> = T extends AsyncOrSync<infer PT> ? PT : never;
export interface Newable<T> {
  new (...args: any[]): T;
}
declare type IsEqualConsideringWritability<X, Y> = (<T>() => T extends X ? 1 : 2) extends <T>() => T extends Y ? 1 : 2
  ? true
  : false;
declare type IsFullyWritable<T extends object> = IsEqualConsideringWritability<
  {
    [Q in keyof T]: T[Q];
  },
  Writable<{
    [Q in keyof T]: T[Q];
  }>
>;
/** Gets keys of an object which are readonly */
export declare type ReadonlyKeys<T extends object> = {
  [P in keyof T]-?: IsFullyWritable<Pick<T, P>> extends true ? never : P;
}[keyof T];
/** Gets keys of an object which are writable */
export declare type WritableKeys<T extends {}> = {
  [P in keyof T]-?: IsFullyWritable<Pick<T, P>> extends true ? P : never;
}[keyof T];
/** Mark some properties which only the former including as optional and set the value to never */
declare type Without<T, U> = {
  [P in Exclude<keyof T, keyof U>]?: never;
};
/** get the XOR type which could make 2 types exclude each other */
export declare type XOR<T, U> = T | U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : T | U;
/** Functional programming essentials */
export declare type Head<T extends AnyArray> = T["length"] extends 0 ? never : T[0];
export declare type Tail<T extends AnyArray> = T["length"] extends 0
  ? never
  : ((...t: T) => void) extends (first: any, ...rest: infer Rest) => void
  ? Rest
  : never;
export declare type Exact<T, SHAPE> = T extends SHAPE
  ? Exclude<keyof T, keyof SHAPE> extends never
    ? T
    : never
  : never;
export {};
