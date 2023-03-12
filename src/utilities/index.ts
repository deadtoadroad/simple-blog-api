import { Predicate } from "./predicates";
export * from "./predicates";

export const ifMap =
  <T>(predicate: Predicate<T>, map: (value: T) => T) =>
  (value: T) =>
    predicate(value) ? map(value) : value;
