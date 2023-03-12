import { Predicate } from "../utilities";

export type ValidationPayload<T> = { model: T; errors: string[] };

export const initialise = <T>(model: T): ValidationPayload<T> => ({
  model,
  errors: [],
});

export const ifModelProperty =
  <T, K extends keyof T>(property: K, predicate: Predicate<T[K]>) =>
  ({ model }: ValidationPayload<T>) =>
    predicate(model[property]);

export const addError =
  <T>(error: string) =>
  ({ model, errors }: ValidationPayload<T>) => ({
    model,
    errors: [...errors, error],
  });

export const getErrors = <T>(payload: ValidationPayload<T>) => payload.errors;
