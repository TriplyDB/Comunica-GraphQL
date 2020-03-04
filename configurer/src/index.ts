import * as superagent from "superagent";

const endpoint =
 "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/services/knowledge-graph/sparql";
 const endpointType = "SPARQL";
//const endpoint = "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/fragments";
//const endpointType = "fragments";
const typeDefs = `
  type Query  {
      brewedBy: [brewery],
      regio: [buurt]
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

  type buurt {
    hasGeometry: [geometery],
    sfWithin: [wijk],
    label: [String],
    regioCode: [String]
  }

  type geometery {
    asWKT: [String]
  }

  type wijk {
    hasGeometry: [geometery],
    sfWithin: [gemeente],
    label: [String],
    regioCode: [String]
  }

  type gemeente {
    hasGeometry: [geometery],
    sfWithin: [land],
    label: [String],
    regioCode: [String]
  }

  type land {
    hasGeometry: [geometery],
    label: [String],
    regioCode: [String]
  }


  type brewery {
    address: [Address],
    email: [String],
    jaarproduktie: [String]
  }
  type Address {
    addressLocality: [String],
    postalCode: [String]
    streetAddress: [String]
  }
  `;

const context = {
  "@context": {
    brewedBy: "https://data.labs.kadaster.nl/dbeerpedia/dbeerpedia/vocab/brewedby",
    address: "http://schema.org/address",
    email: "http://schema.org/email",
    opgericht: "https://data.labs.kadaster.nl/dbeerpedia/dbeerpedia/vocab/jaarproduktie",
    addressLocality: "http://schema.org/addressLocality",
    postalCode: "http://schema.org/postalCode",
    streetAddress: "http://schema.org/streetAddress",
    hasGeometry: "http://schema.org/addressLocality",
    sfWithin: "http://schema.org/addressLocality",
    bouwjaar:"http://bag.basisregistraties.overheid.nl/def/bag#oorspronkelijkBouwjaar",
    asWKT: "http://www.opengis.net/ont/geosparql#asWKT",
    label: "http://www.w3.org/2000/01/rdf-schema#label",
    regioCode: "https://data.pldn.nl/cbs/wijken-buurten/def/cbs#regiocode",
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
