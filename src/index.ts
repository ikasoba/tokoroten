import { ObjectType, UnionToItersection } from "./utils.js";

export type StylizerResult<T> = null | {
  value: T;
};

export type Stylizer<T> = (input: unknown) => StylizerResult<T>;

export type Infer<T> = T extends Stylizer<infer T> ? T : never;

export const string: Stylizer<string> = (input) =>
  typeof input === "string" ? { value: input } : null;

export const number: Stylizer<number> = (input) =>
  typeof input === "number" ? { value: input } : null;

export const boolean: Stylizer<boolean> = (input) =>
  typeof input === "boolean" ? { value: input } : null;

const _null: Stylizer<null> = (input) =>
  input === null ? { value: input } : null;

const _undefined: Stylizer<undefined> = (input) =>
  input === undefined ? { value: input } : null;

const _const =
  <T>(value: T): Stylizer<T> =>
  (input) =>
    input === value ? { value } : null;

export { _null as null, _undefined as undefined, _const as const };

export const any: Stylizer<any> = (input) => ({ value: input });
export const unknown: Stylizer<unknown> = (input) => ({ value: input });

export const lazy =
  <T>(T: () => Stylizer<T>): Stylizer<T> =>
  (input) =>
    T()(input);

export const opt =
  <T>(T: Stylizer<T>): Stylizer<T | undefined> =>
  (input) => {
    const result = T(input);
    if (result) return result;

    return { value: undefined };
  };

export const map =
  <T, R>(T: Stylizer<T>, fn: (input: T) => R): Stylizer<R> =>
  (input) => {
    const result = T(input);
    if (result == null) return null;

    return {
      value: fn(result.value),
    };
  };

export function validate<T>(
  T: Stylizer<T>,
  fn: (input: T) => boolean
): Stylizer<T>;
export function validate<T, R extends T>(
  T: Stylizer<T>,
  fn: (input: T) => input is R
): Stylizer<R>;
export function validate<T>(
  T: Stylizer<T>,
  fn: (input: T) => boolean
): Stylizer<T> {
  return (input) => {
    const result = T(input);
    if (result == null || !fn(result.value)) return null;

    return {
      value: result.value,
    };
  };
}

export const stringed =
  <T extends string | number | bigint | boolean | null | undefined>(
    T: Stylizer<T>
  ): Stylizer<`${T}`> =>
  (input) => {
    const result = T(input);
    if (result == null) return null;

    return { value: `${result.value}` };
  };

export const regexp = (regexp: RegExp): Stylizer<string> =>
  validate(string, (x) => new RegExp(regexp).test(x));

export const union =
  <T extends Stylizer<any>[]>(types: T): Stylizer<Infer<T[number]>> =>
  (input) => {
    for (const T of types) {
      const result = T(input);
      if (result) return result;
    }

    return null;
  };

export const intersection =
  <T extends Stylizer<any>[]>(
    types: T
  ): Stylizer<UnionToItersection<Infer<T[number]>>> =>
  (input: any) => {
    for (const T of types) {
      const result = T(input);
      if (result == null) return null;
    }

    return {
      value: input,
    };
  };

export const object =
  <T extends Record<string | number, any>>(table: {
    [K in keyof T]: Stylizer<T[K]>;
  }): Stylizer<ObjectType<T>> =>
  (input: any) => {
    if (typeof input !== "object" || input == null) return null;

    const result: any = {};

    for (const key in table) {
      const tmp = table[key](input[key]);

      if (tmp == null) return null;

      result[key] = tmp.value;
    }

    return {
      value: result,
    };
  };

export const array =
  <T>(T: Stylizer<T>): Stylizer<T[]> =>
  (input) => {
    if (!Array.isArray(input)) return null;

    const result: T[] = [];

    for (const item of input) {
      const tmp = T(item);

      if (tmp == null) continue;

      result.push(tmp.value);
    }

    return {
      value: result,
    };
  };
