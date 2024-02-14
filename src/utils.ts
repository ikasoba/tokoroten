export type UnionToItersection<T> = (
  T extends infer T ? (_: T) => void : never
) extends (_: infer T) => void
  ? T
  : never;

export type IncludeKey<T, U> = {
  [K in keyof T]: U extends T[K] ? K : never;
}[keyof T];

export type ExcludeKey<T, U> = {
  [K in keyof T]: U extends T[K] ? never : K;
}[keyof T];

export type ObjectType<T> = {
  [K in IncludeKey<T, undefined>]?: T[K];
} & {
  [K in ExcludeKey<T, undefined>]: T[K];
};
