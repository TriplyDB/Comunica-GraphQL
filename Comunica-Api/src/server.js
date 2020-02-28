import express from "express";
import bodyParser from "body-parser";
import {requestComunica} from "./server-comunica";
import {requestApollo} from "./server-apollo";
import {isIntrospectionQuery} from "./introspection-detector";
const app = express();

// This code sets up an express server which can be used to send a POST request
// to with a GraphQL-LD query which will then be passed to Comunica or Apollo.
// The resulting JSON is passed back to the requestor.

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
  const schema = req.body.schema;
  const request = isIntrospectionQuery(query) ? requestApollo : requestComunica;
  request(query, context, endpoint, schema)
    .then(result => {
      console.info(JSON.stringify(result.data, null, 2));
      res.send(result);
    })
    .catch(e => {
      res.send(e);
    });
});
app.listen(3000);
