import * as superagent from "superagent";

// const endpoint =
//   "https://api.nightly.triply.cc/datasets/ysg/bob/services/bob/sparql";
// const endpointType = "SPARQL";
const endpoint =
  "https://api.nightly.triply.cc/datasets/ysg/bob/fragments";
const endpointType = "fragments";
const typeDefs = `
  type Query  {
      mes: [me],
      hero: [hero]
  }

  type me {
    name: [String]
  }

  type hero {
    name: [String]
    id2: [String]
    friends: [hero]
  }
  `;

const context = {
  "@context": {
    me: "http://example.org/me",
    id2: "http://example.org/id",
    mes: "http://example.org/me",
    name: "http://example.org/name",
    hero: "http://example.org/hero",
    human: "http://example.org/human",
    height: "http://example.org/height",
    friends: "http://example.org/friends",
    episode: "http://example.org/episode",
    primaryFunction: "http://example.org/primaryFunction",
    JEDI: "http://example.org/types/Jedi",
    Droid: "http://example.org/types/Droid",
    Human: "http://example.org/types/Human",
    appearsIn: "http://example.org/appearsIn",
    EMPIRE: "http://example.org/types/Empire"
  }
};

superagent
  .patch("http://localhost:3000/config")
  .send({ endpoint, endpointType, typeDefs, context })
  .then((response: superagent.Response) => {
    if (response?.error) console.error(response.error);
    console.error(response?.status, response?.text)
  }).catch((e)=>{
    console.error(e?.status, e?.response?.text)
  });
