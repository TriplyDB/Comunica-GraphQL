import { Client } from "graphql-ld";
import { QueryEngineComunica } from "graphql-ld-comunica";
//import {QueryEngineSparqlEndpoint} from "graphql-ld-sparqlendpoint";
import express from "express";
import bodyParser from "body-parser";
const app = express();

// This code sets up an express server which can be used to send a POST request
// to with a GraphQL-LD query which will then be passed to Comunica. The resulting
// JSON is passed back to the requestor.

async function request(query, context, endpoint) {
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
app.use(bodyParser.json()); // for parsing application/json
// Some feedback in case an options request is sent
app.options("/", function(req, res) {
  console.info("GOT OPTIONS REQUEST");
  res.send({ test: "test" });
});

// Setting up the post request which we use to pass the arguments to Comunica
app.post("/", function(req, res) {
  console.info("Got a POST request with this data:", req.body);
  const endpoint = req.body.endpoint;
  const query = req.body.query;
  const context = req.body.context;
  request(query, context, endpoint)
    .then(result => {
      console.info(JSON.stringify(result.data, null, 2));
      res.send(result);
    })
    .catch(e => {
      res.send(e);
    });
});
app.listen(3000);
