import express from "express";
import bodyParser from "body-parser";
import { GraphQLSchema, DocumentNode } from "graphql";
import { isApolloQuery } from "./introspection-detector";
import { ApolloServer, gql, Config } from "apollo-server-express";
import { buildFederatedSchema } from "@apollo/federation";
import { Client } from "graphql-ld";
import { QueryEngineComunica } from "graphql-ld-comunica";
import { QueryEngineSparqlEndpoint } from "graphql-ld-sparqlendpoint";
QueryEngineComunica;
interface RequestConfig {
  endpoint?: string;
  typeDefs?: string;
  context?: { [key: string]: any };
}

interface ComApiConfig {
  endpoint?: string;
  typeDefs?: DocumentNode;
  schema?: GraphQLSchema;
  context?: { [key: string]: any };
}

let config: ComApiConfig;
const app = express();
let apolloServer: ApolloServer;
let comunicaServer: Client;

app.use(bodyParser.json()); // for parsing application/json

app.patch("/config", async function(req, res) {
  const configuration: RequestConfig = req.body;

  let converted: ComApiConfig = {};
  if (configuration.endpoint) converted.endpoint = configuration.endpoint;
  if (configuration.context) converted.context = configuration.context;
  if (configuration.typeDefs) converted.typeDefs = gql(configuration.typeDefs);
  // TODO validate
  config = { ...config ? config : {}, ...converted };

  const schema = buildFederatedSchema({ typeDefs: config.typeDefs });
  const APOLLO_SERVER: Config = { schema }
  apolloServer = new ApolloServer(APOLLO_SERVER);

  comunicaServer = new Client({
    context: config.context,
    queryEngine: new QueryEngineSparqlEndpoint(config.endpoint)
  });
  console.info("Successfully configured")
  res.sendStatus(200);
  console.info(config.endpoint)
})

// Setting up the post request which we use to pass the arguments to Comunica
app.post("/query", async function(req, res) {
  if (!config) {
    return res.status(400).send("Server is not configured. Specify {endpoint, typedef, context} at /config first.");
  }
  if (!config.context) return res.status(400).send("context is not configured. Specify context at /config first.");
  if (!config.endpoint) return res.status(400).send("endpoint is not configured. Specify endpoint at /config first.");
  if (!config.typeDefs) return res.status(400).send("typeDefs is not configured. Specify typeDefs at /config first.");

  const query = req.body.query;

  // NB: don't be tempted to refactor this into isApolloQuery(query) ? apolloServer.executeOperation : comunicaServer.query
  const request =  (isApolloQuery(query))? apolloServer.executeOperation({ query }) : comunicaServer.query({ query });

  try {
    const r = (await request);

    console.info(JSON.stringify(r,null,2))
    res.send(r);
    console.info("Success")
  } catch (e) {
    console.error("Error:", e);
    res.status(400).send(e.message);
  }
});
console.info("Comunica-Api listening at http://localhost:3000")
app.listen(3000);
