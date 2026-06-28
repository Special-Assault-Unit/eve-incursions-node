import {GraphQLObjectType, GraphQLSchema, GraphQLString, parse, validate} from 'graphql';
import type {GraphQLFieldConfigMap} from 'graphql';
import {describe, expect, it} from 'vitest';
import {buildValidationRules} from './graphqlValidationRules';

function buildRecursiveSchema(): GraphQLSchema {
  let recursiveType: GraphQLObjectType;
  recursiveType = new GraphQLObjectType({
    name: 'Recursive',
    fields: (): GraphQLFieldConfigMap<unknown, unknown> => ({
      child: {type: recursiveType},
      value: {type: GraphQLString},
    }),
  });

  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: 'Query',
      fields: {
        root: {type: recursiveType},
      },
    }),
  });
}

describe('buildValidationRules', () => {
  it('rejects recursive GraphQL queries that exceed the depth limit', () => {
    const schema = buildRecursiveSchema();
    const document = parse(`
      query TooDeep {
        root {
          child {
            child {
              child {
                child {
                  child {
                    child {
                      child {
                        child {
                          child {
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `);

    const errors = validate(schema, document, [...buildValidationRules()]);

    expect(errors.map(error => error.message).some(message => message.includes('exceeds maximum operation depth'))).toBe(true);
  });

  it('accepts legitimate GraphQL queries within the depth and complexity budget', () => {
    const schema = buildRecursiveSchema();
    const document = parse(`
      query Legitimate {
        root {
          child {
            value
          }
        }
      }
    `);

    const errors = validate(schema, document, [...buildValidationRules()]);

    expect(errors).toHaveLength(0);
  });

  it('rejects broad GraphQL queries that exceed the complexity budget', () => {
    const schema = buildRecursiveSchema();
    const fields = Array.from({length: 1100}, (_, index) => `field${index}: value`).join('\n');
    const document = parse(`
      query TooBroad {
        root {
          ${fields}
        }
      }
    `);

    const errors = validate(schema, document, [...buildValidationRules()]);

    expect(errors.map(error => error.message)).toContain('The query exceeds the maximum complexity of 1000. Actual complexity is 1101');
  });
});
