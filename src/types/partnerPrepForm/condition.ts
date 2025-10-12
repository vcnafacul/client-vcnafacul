export enum Operator {
  Equal = "Equal",
  NotEqual = "NotEqual",
  GreaterThan = "GreaterThan",
  GreaterThanOrEqual = "GreaterThanOrEqual",
  LessThan = "LessThan",
  LessThanOrEqual = "LessThanOrEqual",
  Contains = "Contains",
}

export enum Logic {
  And = "And",
  Or = "Or",
}

export interface BaseCondition {
  questionId: string;
  operator: Operator;
  expectedValue: string | number | boolean;
}

export interface ComplexCondition {
  conditions: BaseCondition[];
  logic: Logic;
}
