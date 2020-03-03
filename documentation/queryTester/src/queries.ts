const Converter = require("graphql-to-sparql").Converter;
const algebra = new Converter().graphqlToSparqlAlgebra(
  `{
  getBag(bouwjaar:1880){
    bagstatus {
      label
    }
  }
}`,
  {
    brewedBy:
      "https://data.labs.kadaster.nl/dbeerpedia/dbeerpedia/vocab/brewedby",
    address: "http://schema.org/address",
    email: "http://schema.org/email",
    bouwjaar:
      "http://bag.basisregistraties.overheid.nl/def/bag#oorspronkelijkBouwjaar",
    opgericht:
      "https://data.labs.kadaster.nl/dbeerpedia/dbeerpedia/vocab/jaarproduktie",
    addressLocality: "http://schema.org/addressLocality",
    postalCode: "http://schema.org/postalCode",
    streetAddress: "http://schema.org/streetAddress",
    hasGeometry: "http://schema.org/addressLocality",
    sfWithin: "http://schema.org/addressLocality",
    asWKT: "http://www.opengis.net/ont/geosparql#asWKT",
    label: "http://www.w3.org/2000/01/rdf-schema#label",
    regioCode: "https://data.pldn.nl/cbs/wijken-buurten/def/cbs#regiocode",
    bagstatus: "http://bag.basisregistraties.overheid.nl/def/bag#status",
    identificatiecode:
      "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
    getBag: {
      "@reverse":
        "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode"
    },
    regio: "https://data.pldn.nl/cbs/wijken-buurten/def/dimension#regio"
  }
);
console.info(JSON.stringify(algebra, null, 2));
