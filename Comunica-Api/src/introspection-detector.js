export function isIntrospectionQuery(query) {
  // By convention, GraphQL queries that contain fields starting with '__', indicate introspection.
  return query.indexOf('__') > 0;
}
