import { flow } from "lodash/fp";
import { ifMap, Predicate } from "../utilities";

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

export const getErrors = <T>({ errors }: ValidationPayload<T>) => errors;

export const validate = <T>(
  model: T,
  ...validators: ((payload: ValidationPayload<T>) => ValidationPayload<T>)[]
): string[] =>
  flow((model: T) => initialise(model), ...validators, getErrors)(model);

export const validateModelProperty = <T, K extends keyof T>(
  property: K,
  predicate: Predicate<T[K]>,
  error: string
) => ifMap(ifModelProperty(property, predicate), addError(error));
