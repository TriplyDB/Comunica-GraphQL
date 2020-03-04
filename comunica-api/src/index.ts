import express from "express";
import bodyParser from "body-parser";
import { GraphQLSchema, DocumentNode } from "graphql";
import { isApolloQuery } from "./introspection-detector";
import { ApolloServer, gql, Config } from "apollo-server-express";
import { buildFederatedSchema } from "@apollo/federation";
import { Client } from "graphql-ld";
import { QueryEngineComunica } from "graphql-ld-comunica";
import { QueryEngineSparqlEndpoint } from "graphql-ld-sparqlendpoint";
import { Converter } from "graphql-to-sparql";
import { IVariablesDictionary } from "graphql-to-sparql";
import commander from "commander";
import { toSparql } from "sparqlalgebrajs";

QueryEngineComunica;
interface RequestConfig {
  endpoint?: string;
  endpointType?: string;
  typeDefs?: string;
  context?: { [key: string]: any };
}

interface ComApiConfig {
  endpoint?: string;
  endpointType?: "SPARQL" | "fragments";
  typeDefs?: DocumentNode;
  schema?: GraphQLSchema;
  context?: { [key: string]: any };
}

let config: ComApiConfig;
const app = express();
let apolloServer: ApolloServer;
let comunicaServer: Client;

let converter: Converter = new Converter();

async function printSPARQLQuery(
  query: string,
  context?: { [key: string]: any },
  variables?: IVariablesDictionary
) {
  const algebra = await converter.graphqlToSparqlAlgebra(
    query,
    context,
    variables
  );
  console.info(toSparql(algebra));
}

app.use(bodyParser.json()); // for parsing application/json

app.patch("/config", async function(req, res) {
  const configuration: RequestConfig = req.body;

  let converted: ComApiConfig = {};
  if (configuration.endpoint) converted.endpoint = configuration.endpoint;
  if (configuration.endpointType)
    converted.endpointType = configuration.endpointType as ComApiConfig["endpointType"];
  if (configuration.context) converted.context = configuration.context;
  if (configuration.typeDefs) converted.typeDefs = gql(configuration.typeDefs);
  // TODO validate
  config = { ...(config ? config : {}), ...converted };

  const schema = buildFederatedSchema({ typeDefs: config.typeDefs });
  const APOLLO_SERVER: Config = { schema };
  apolloServer = new ApolloServer(APOLLO_SERVER);
  if (config.endpointType === "SPARQL") {
    comunicaServer = new Client({
      context: config.context,
      queryEngine: new QueryEngineSparqlEndpoint(config.endpoint)
    });
  } else if (config.endpointType === "fragments") {
    comunicaServer = new Client({
      context: config.context,
      queryEngine: new QueryEngineComunica({
        sources: [{ type: "hypermedia", value: config.endpoint }]
      })
    });
  } else {
    return res
      .status(400)
      .send(
        "endpoint type is not configured. Specify endpointType at /config first."
      );
  }
  console.info("Successfully configured");
  res.sendStatus(200);
  console.info(config.endpoint);
});

// Setting up the post request which we use to pass the arguments to Comunica
app.post("/query", async function(req, res) {
  if (!config) {
    return res
      .status(400)
      .send(
        "Server is not configured. Specify {endpoint, typedef, context} at /config first."
      );
  }
  if (!config.context)
    return res
      .status(400)
      .send("context is not configured. Specify context at /config first.");
  if (!config.endpoint)
    return res
      .status(400)
      .send("endpoint is not configured. Specify endpoint at /config first.");
  if (!config.typeDefs)
    return res
      .status(400)
      .send("typeDefs is not configured. Specify typeDefs at /config first.");

  const query = req.body.query;
  const variablesDict: IVariablesDictionary = req.body.variables;

  // NB: don't be tempted to refactor this into isApolloQuery(query) ? apolloServer.executeOperation : comunicaServer.query
  const request = isApolloQuery(query)
    ? apolloServer.executeOperation({ query })
    : comunicaServer.query({
        query: query,
        variables: { variablesDict }
      });
  try {
    const r = await request;
    if (isApolloQuery(query)) {
      res.send(r);
      console.info("Introspection Succes");
    } else {
      console.info(JSON.stringify(r, null, 2));
      res.send({
        data: r.data[0]
      });
      printSPARQLQuery(query, config.context, variablesDict);
      console.info("Query Success");
    }
  } catch (e) {
    console.error("Error:", e);
    res.status(400).send(e.message);
  }
});
const DEFAULT_PORT = 3000;
commander.option(
  "-p, --port <port>",
  "Port number, defaults to " + DEFAULT_PORT
);
commander.parse(process.argv);
const port = commander.port || DEFAULT_PORT;
app.listen(port);
console.info("Comunica-Api listening at http://localhost:" + port);
