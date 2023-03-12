export type Predicate<T> = (value: T) => boolean;

export const isNullOrUndefined = <T>(value: T) =>
  value === null || value === undefined;
