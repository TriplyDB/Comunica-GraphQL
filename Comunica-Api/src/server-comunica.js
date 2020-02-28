import { Client } from "graphql-ld";
import { QueryEngineComunica } from "graphql-ld-comunica";

export async function requestComunica(query, context, endpoint, schema) {
  // Create a GraphQL-LD client based on a LDF endpoint
  //
  const comunicaConfig = {
    sources: [{ type: "hypermedia", value: endpoint }]
  };

  const client = new Client({
    context,
    queryEngine: new QueryEngineComunica(comunicaConfig)
  });
  // Execute the query
  return client.query({ query });
}
