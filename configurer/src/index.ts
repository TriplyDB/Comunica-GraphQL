import * as superagent from "superagent";

const endpoint =
 "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/services/knowledge-graph/sparql";
 const endpointType = "SPARQL";
//const endpoint = "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/fragments";
//const endpointType = "fragments";
const typeDefs = `
  type Query  {
      getBag(bouwjaar: Int): [BAGpand]
      test(bouwjaar: Int): [BAGpand]
  }


  type BAGpand  {
    identificatiecode: [String]
    bagstatus: [Label]
    bouwjaar: Int
    }

  type Label {
    label: [String]
  }
  `;

const context = {
  "@context": {
    bouwjaar:"http://bag.basisregistraties.overheid.nl/def/bag#oorspronkelijkBouwjaar",
    label: "http://www.w3.org/2000/01/rdf-schema#label",
    bagstatus: "http://bag.basisregistraties.overheid.nl/def/bag#status",
    identificatiecode:"http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
    getBag: {"@reverse":"http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode"},
    regio: "https://data.pldn.nl/cbs/wijken-buurten/def/dimension#regio",
    test: "https://example.com/test"
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
