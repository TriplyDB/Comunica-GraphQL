import * as superagent from "superagent";

const endpoint = "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/services/knowledge-graph/sparql";
const endpointType = "SPARQL";
const typeDefs = `
  type Query  {
    bag0bijbehorendeOpenbareRuimte(bag0identificatiecode: String, bag0naamOpenbareRuimte: String): [bag0OpenbareRuimte]
    bag0bijbehorendeWoonplaats(bag0identificatiecode: String, bag0naamWoonplaats: String): [bag0Woonplaats]
    bag0hoofdadres(bag0huisletter: String, bag0huisnummer: Int, bag0huisnummertoevoeging: String, bag0identificatiecode: String, bag0postcode: String): [bag0Nummeraanduiding]
    bag0nevenadres(bag0huisletter: String, bag0huisnummer: Int, bag0huisnummertoevoeging: String, bag0identificatiecode: String, bag0postcode: String): [bag0Nummeraanduiding]
    bag0pandrelatering(bag0oorspronkelijkBouwjaar: Int,  bag0identificatiecode: String): [bag0Pand]
  }

  extend type BAGPND @key(fields: "pandkey"){
      pandkey: String @external
      gerelateerdBRTgebouw: [brt0Gebouw]
  }

  type bag0Pand  {
    bag0identificatiecode: [String]
    bag0oorspronkelijkBouwjaar: [Int]
    bag0status: [bag0Status]
    bag0verblijfsobject: [bag0Verblijfsobject]
    geo0hasGeometry: [geo0Geometry]
    brt0bijbehoordGebouw: [brt0Gebouw]
    geo0sfWithin: [cbs0Buurt]
  }

  type bag0Nummeraanduiding {
    bag0bijbehorendeOpenbareRuimte: [bag0OpenbareRuimte]
    bag0huisletter: [String]
    bag0huisnummer: [Int]
    bag0huisnummertoevoeging: [String]
    bag0identificatiecode: [String]
    bag0postcode: [String]
    bag0status: [bag0Status]
    verblijfsobject: [bag0Verblijfsobject]
  }

  type bag0OpenbareRuimte {
    bag0bijbehorendeWoonplaats: [bag0Woonplaats]
    bag0identificatiecode: [String]
    bag0naamOpenbareRuimte: [String]
    bag0status: [bag0Status]
  }

  type bag0Status {
    dct0source: [String]
    rdfs0label: [String]
    skos0broader: [bag0Status]
    skos0definition: [String]
  }

  type bag0Verblijfsobject {
    bag0hoofdadres: [bag0Nummeraanduiding]
    bag0nevenadres: [bag0Nummeraanduiding]
    bag0identificatiecode: [String]
    bag0oppervlakte: [Int]
    bag0pandrelatering: [bag0Pand]
    bag0status: [bag0Status]
    geo0hasGeometry: [geo0Geometry]
  }

  type bag0Woonplaats {
    bag0identificatiecode: [String]
    bag0naamWoonplaats: [String]
    bag0status: [bag0Status]
    geo0hasGeometry: [geo0Geometry]
  }

  type brt0Gebouw {
    brt0bronactualiteit: [String]
    brt0bronnauwkeurigheid: [Float]
    brt0hoogteniveau: [Int]
    brt0objectBeginTijd: [String]
    brt0tijdstipRegistratie: [String]
    geo0hasGeometry: [geo0Geometry]
    geo0sfOverlaps: [bag0Pand]
  }

  type geo0Geometry {
    geo0asWKT: [String]
  }

  type cbs0Buurt{
    rdfs0label: [String]
    owl0sameAs: [cbs02016Buurt]
    geo0sfWithin: [cbs0Wijk]
  }

  type cbs0Wijk{
    rdfs0label: [String]
    owl0sameAs: [cbs02016Wijk]
    geo0sfWithin: [cbs0Gemeente]
  }

  type cbs0Gemeente{
    rdfs0label: [String]
    owl0sameAs: [cbs02016Gemeente]
  }

  type cbs02016Buurt{
    geo0hasGeometry: [geo0Geometry]
  }

  type cbs02016Wijk{
    geo0hasGeometry: [geo0Geometry]
  }

  type cbs02016Gemeente{
    geo0hasGeometry: [geo0Geometry]
  }


`;

const context = {
  "@context": {
    brt0bijbehoordGebouw: {"@reverse": "http://www.opengis.net/ont/geosparql#sfOverlaps" },
    verblijfsobject: {"@reverse": "http://bag.basisregistraties.overheid.nl/def/bag#hoofdadres"},
    "bag0Nummeraanduiding": "http://bag.basisregistraties.overheid.nl/def/bag#Nummeraanduiding",
    "bag0OpenbareRuimte": "http://bag.basisregistraties.overheid.nl/def/bag#OpenbareRuimte",
    "bag0Pand": "http://bag.basisregistraties.overheid.nl/def/bag#Pand",
    "bag0Status": "http://bag.basisregistraties.overheid.nl/def/bag#Status",
    "bag0Verblijfsobject": "http://bag.basisregistraties.overheid.nl/def/bag#Verblijfsobject",
    "bag0Woonplaats": "http://bag.basisregistraties.overheid.nl/def/bag#Woonplaats",
    "bag0bijbehorendeOpenbareRuimte": "http://bag.basisregistraties.overheid.nl/def/bag#bijbehorendeOpenbareRuimte",
    "bag0bijbehorendeWoonplaats": "http://bag.basisregistraties.overheid.nl/def/bag#bijbehorendeWoonplaats",
    "bag0hoofdadres": "http://bag.basisregistraties.overheid.nl/def/bag#hoofdadres",
    "bag0huisletter": "http://bag.basisregistraties.overheid.nl/def/bag#huisletter",
    "bag0huisnummer": "http://bag.basisregistraties.overheid.nl/def/bag#huisnummer",
    "bag0huisnummertoevoeging": "http://bag.basisregistraties.overheid.nl/def/bag#huisnummertoevoeging",
    "bag0identificatiecode": "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
    "bag0naamOpenbareRuimte": "http://bag.basisregistraties.overheid.nl/def/bag#naamOpenbareRuimte",
    "bag0nevenadres": "http://bag.basisregistraties.overheid.nl/def/bag#nevenadres",
    "bag0oorspronkelijkBouwjaar": "http://bag.basisregistraties.overheid.nl/def/bag#oorspronkelijkBouwjaar",
    "bag0oppervlakte": "http://bag.basisregistraties.overheid.nl/def/bag#oppervlakte",
    "bag0pandrelatering": "http://bag.basisregistraties.overheid.nl/def/bag#pandrelatering",
    "bag0postcode": "http://bag.basisregistraties.overheid.nl/def/bag#postcode",
    "bag0status": "http://bag.basisregistraties.overheid.nl/def/bag#status",
    "bag0verblijfsobject": {"@reverse": "http://bag.basisregistraties.overheid.nl/def/bag#gerelateerdPand"},
    "brt0Gebouw": "http://brt.basisregistraties.overheid.nl/def/top10nl#Gebouw",
    "brt0bronactualiteit": "http://brt.basisregistraties.overheid.nl/def/top10nl#bronactualiteit",
    "brt0bronnauwkeurigheid": "http://brt.basisregistraties.overheid.nl/def/top10nl#bronnauwkeurigheid",
    "brt0hoogteniveau": "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau",
    "brt0objectBeginTijd": "http://brt.basisregistraties.overheid.nl/def/top10nl#objectBeginTijd",
    "brt0tijdstipRegistratie": "http://brt.basisregistraties.overheid.nl/def/top10nl#tijdstipRegistratie",
    "dct0source": "http://purl.org/dc/terms/source",
    "geo0Geometry": "http://www.opengis.net/ont/geosparql#Geometry",
    "geo0asWKT": "http://www.opengis.net/ont/geosparql#asWKT",
    "geo0hasGeometry": "http://www.opengis.net/ont/geosparql#hasGeometry",
    "geo0sfOverlaps": "http://www.opengis.net/ont/geosparql#sfOverlaps",
    "geo0sfWithin": "http://www.opengis.net/ont/geosparql#sfWithin",
    "rdfs0label": "http://www.w3.org/2000/01/rdf-schema#label",
    "skos0broaser": "http://www.w3.org/2004/02/skos/core#broader",
    "skos0definition": "http://www.w3.org/2004/02/skos/core#definition",
    "owl0sameAs" : "http://www.w3.org/2002/07/owl#sameAs"
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
