const Converter = require("graphql-to-sparql").Converter;
import { IVariablesDictionary } from "graphql-to-sparql";

const context = {
  bouwjaar:
    "http://bag.basisregistraties.overheid.nl/def/bag#oorspronkelijkBouwjaar",
  label: "http://www.w3.org/2000/01/rdf-schema#label",
  bagstatus: "http://bag.basisregistraties.overheid.nl/def/bag#status",
  identificatiecode:
    "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
  getBag: {
    "@reverse":
      "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode"
  },
  regio: "https://data.pldn.nl/cbs/wijken-buurten/def/dimension#regio",
  test: "https://example.com/test"
};

const query = `
test(bouwjaar:1700){bouwjaar}`;

const variablesDict: IVariablesDictionary = {
  episode: { kind: "EnumValue", value: "JEDI" }
};

async function test() {
  const algebra = await new Converter().graphqlToSparqlAlgebra(query, context);
  console.info(JSON.stringify(algebra, null, 2));
}

test();
