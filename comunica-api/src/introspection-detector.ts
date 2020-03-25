export function isApolloQuery(query: string) {
  // By convention, GraphQL queries that contain fields starting with '__', indicate introspection.
  return query.indexOf("__") > 0 || query.indexOf("_service") > 0; // Also capture service description queries, as sent by Apollo Gateway
}

export function isExtendQuery(query: string) {
  return query.indexOf("_entities") > 0 && query.indexOf("representations") > 0; // Also capture service description queries, as sent by Apollo Gateway
}
