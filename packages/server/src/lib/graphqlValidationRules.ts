import type {ValidationRule} from 'graphql';
import depthLimit from 'graphql-depth-limit';
import {createComplexityRule, simpleEstimator} from 'graphql-query-complexity';

export const GRAPHQL_MAX_DEPTH = 8;
export const GRAPHQL_MAX_COMPLEXITY = 1000;

export function buildValidationRules(): ValidationRule[] {
  return [
    depthLimit(GRAPHQL_MAX_DEPTH),
    createComplexityRule({
      maximumComplexity: GRAPHQL_MAX_COMPLEXITY,
      estimators: [simpleEstimator({defaultComplexity: 1})],
    }),
  ];
}
