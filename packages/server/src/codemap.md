# packages/server/src/

## Responsibility
Server source root. Holds process entry points plus backend layers for commands, models, resolvers, infrastructure, and generic GraphQL type helpers.

## Design
Multi-entry service root rather than single application object. `index.ts`, `scheduler.ts`, and `run.ts` share `AppDataSource` and command functions but start different runtime surfaces.

## Flow
1. Process entry point initializes database access.
2. API path builds resolver schema; scheduler path registers cron jobs; runner path dispatches a command.
3. Commands and resolvers access entities and infrastructure adapters directly.

## Integration
- Parent package scripts invoke these files via `ts-node --swc`.
- Child maps document application services, entity schema, resolvers, and adapters.
