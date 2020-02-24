import {Client} from "graphql-ld";
import {QueryEngineSparqlEndpoint} from "graphql-ld-sparqlendpoint";

async function request(query,context) {
  // Define a JSON-LD context

  // Create a GraphQL-LD client based on a SPARQL endpoint
  const endpoint = 'https://api.labs.kadaster.nl/datasets/kadaster/bag/services/bag/sparql';
  const client = new Client({ context, queryEngine: new QueryEngineSparqlEndpoint(endpoint) });

  // Define a query
  // Execute the query
  const promise = await client.query({ query })
  console.log('done',promise)
}

async function main() {
  const query = `
  {
    identificatiecode @single
    bagstatus(label_nl: "Pand in gebruik (status pand)") @single
}
   `;

const context = {
  "@context": {
    "label_nl": { "@id": "http://www.w3.org/2000/01/rdf-schema#label", "@language": "nl" },
    "label": "http://www.w3.org/2000/01/rdf-schema#label" ,
    "rdftype": "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
    "bagbouwjaar": "http://bag.basisregistraties.overheid.nl/def/bag#oorspronkelijkBouwjaar",
    "bagpand": "http://bag.basisregistraties.overheid.nl/def/bag#Pand",
    "pandrelatering": "http://bag.basisregistraties.overheid.nl/def/bag#pandrelatering",
    "bagstatus": "http://bag.basisregistraties.overheid.nl/def/bag#status",
    "pandingebruik" : "http://bag.basisregistraties.overheid.nl/id/begrip/PandInGebruik",
    "identificatiecode":"http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode"
  }
};

  // Get query
  await request(query, context)
}

main()
