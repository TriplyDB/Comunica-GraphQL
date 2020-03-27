import express from "express";
import bodyParser from "body-parser";
import { GraphQLSchema, DocumentNode } from "graphql";
import {ExecutionResult} from "graphql/execution";
import { isApolloQuery, isExtendQuery } from "./introspection-detector";
import { communicaExtendQuery } from "./middlewares/communicaExtendQuery";
import { ApolloServer, gql, Config } from "apollo-server-express";
import { buildFederatedSchema } from "@apollo/federation";
import { Client as GraphQLClient } from "graphql-ld";
import { QueryEngineComunica } from "graphql-ld-comunica";
import { QueryEngineSparqlEndpoint } from "graphql-ld-sparqlendpoint";
import commander from "commander";
import { GraphQLResponse } from "apollo-server-types";

const DEBUG = true;
function log(...args:any[]){
  if (DEBUG) console.log(args);
}

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
let comunicaServer: GraphQLClient;

app.use(bodyParser.json()); // for parsing application/json

app.patch("/config", function(req, res) {
  const configArgs: RequestConfig = req.body;

  let curatedConfig: ComApiConfig = {};

  if (configArgs.endpoint) curatedConfig.endpoint = configArgs.endpoint;
  if (configArgs.endpointType) curatedConfig.endpointType = configArgs.endpointType as ComApiConfig["endpointType"];
  if (configArgs.context) curatedConfig.context = configArgs.context;
  if (configArgs.typeDefs) curatedConfig.typeDefs = gql(configArgs.typeDefs);
  // TODO validate further

  config = { ...(config || {}), ...curatedConfig };

  apolloServer = new ApolloServer(<Config>{ schema:buildFederatedSchema({ typeDefs: config.typeDefs }) });

  if (config.endpointType === "SPARQL") {
    comunicaServer = new GraphQLClient({
      context: config.context,
      queryEngine: new QueryEngineSparqlEndpoint(config.endpoint)
    });
  } else if (config.endpointType === "fragments") {
    comunicaServer = new GraphQLClient({
      context: config.context,
      queryEngine: new QueryEngineComunica({
        sources: [{ type: "hypermedia", value: config.endpoint }]
      })
    });
  } else {
    return res
      .status(400)
      .send(
        "endpoint type is not configured. Please specify endpointType."
      );
  }
  log("Successfully configured");
  res.status(200).send("Successfully configured");
  log(config.endpoint);
});

// Setting up the post request which we use to pass the arguments to Comunica
app.post("/query", function(req, res) {
  if (!config) {
    return res
      .status(400)
      .send(
        "Server is not configured. Specify {endpoint, typeDefs, context} at /config first."
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
  const variables = req.body.variables;
  // NB: don't be tempted to refactor this into isApolloQuery(query) ? apolloServer.executeOperation : comunicaServer.query
  let request: Promise<GraphQLResponse|ExecutionResult<any>>;
  if (isApolloQuery(query)) {
    request = apolloServer.executeOperation({ query });
  } else if (isExtendQuery(query)) {
    request = communicaExtendQuery(query, config.context, variables).then(comunicaServer.query);
  } else {
    request = comunicaServer.query({query: query});
  }
  request
    .then((r) => {
      if (isApolloQuery(query)) {
        res.send(r);
        log("Introspection Succes");
      } else if (isExtendQuery(query)) {
        const results = {
          data: {
            _entities: r.data[0][""][0]["entities"]
          }
        };
        log(JSON.stringify(results, null, 2));
        res.send(results);
        log("Extend query Success");
      } else {
        log(JSON.stringify(r, null, 2));
        res.send({data: r.data[0]});
        log("Query Success");
      }
    })
    .catch(e => {
      log("Error:", e);
      res.status(400).send(e.message);
    });
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
