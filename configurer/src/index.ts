import * as superagent from "superagent";

const endpoint =
  "https://api.nightly.triply.cc/datasets/ysg/bob/services/bob/sparql";
const endpointType = "SPARQL";
const typeDefs = `
  type Query  {
      mes: me
  }
  type me {
    name: [String]
  }
  `;

const context = {
  "@context": {
    me: "http://example.org/me",
    name: "http://example.org/name",
    mes: "http://example.org/me"
  }
};

superagent
  .patch("http://localhost:3000/config")
  .send({ endpoint, endpointType, typeDefs, context })
  .catch(console.error)
  .then((response: superagent.Response) => {
    if (response.error) console.error(response.error);
    console.info(response.text);
  });
