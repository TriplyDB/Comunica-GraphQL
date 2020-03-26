import { toSparql } from "sparqlalgebrajs";
import { literal, namedNode, variable } from "@rdfjs/data-model";
import { Converter } from "graphql-to-sparql";
import * as RDF from "rdf-js";
import { IVariablesDictionary } from "graphql-to-sparql";
import { Factory, Algebra } from "sparqlalgebrajs";
import * as DataFactory from "@rdfjs/data-model";

let converter: Converter = new Converter();
const OperationFactory = new Factory(DataFactory);

export async function printSPARQLQuery(
  query: string,
  context?: { [key: string]: any },
  variables?: IVariablesDictionary
) {
  const algebra = await converter.graphqlToSparqlAlgebra(query, context, {
    variablesDict: variables
  });
  console.info(toSparql(algebra));
}

function retrieveDatatype(value: any): RDF.NamedNode {
  const type = typeof value;
  if (type === "string") {
    return namedNode("http://www.w3.org/2001/XMLSchema#string");
  } else if (type === "boolean") {
    return namedNode("http://www.w3.org/2001/XMLSchema#boolean");
  } else if (type === "bigint") {
    return namedNode("http://www.w3.org/2001/XMLSchema#integer");
  } else if (type === "number" && Number.isInteger(value)) {
    return namedNode("http://www.w3.org/2001/XMLSchema#integer");
  } else if (type === "number") {
    return namedNode("http://www.w3.org/2001/XMLSchema#float");
  }
}

async function communicaQuery(
  query: string,
  context: { [key: string]: any }
): Promise<Algebra.Operation> {
  query = query.replace(
    `query($representations:[_Any!]!)`,
    `query($representations:_Any!)`
  );
  var sparqlAlgebraCommunica: Algebra.Operation = await converter.graphqlToSparqlAlgebra(
    query,
    context,
    {
      variablesDict: { representations: { kind: "StringValue", value: "" } }
    }
  );
  sparqlAlgebraCommunica.input.left.patterns = sparqlAlgebraCommunica.input.left.patterns.filter(
    (item: RDF.BaseQuad) => {
      item.predicate.value != "entities" &&
        item.predicate.value != "representations";
    }
  );
  return sparqlAlgebraCommunica;
}

export async function communicaExtendQuery(
  query: string,
  context: { [key: string]: any },
  variables: { [key: string]: any }
) {
  // CONVERSION OF GRAPHQL to SPARQL

  const sparqlAlgebraCommunica = await communicaQuery(query, context);

  // GENERATION OF VALUES CLAUSE
  const valuesBgp = Object.keys(variables.representations[0])
    .map((key: string) => {
      if (key !== "__typename") {
        const predicate = context["@context"]["" + key];
        return OperationFactory.createPattern(
          DataFactory.variable("_entities"),
          DataFactory.namedNode(predicate),
          DataFactory.variable("representations_" + key)
        );
      }
    })
    .filter(x => x);
  const variablesBinding = Object.keys(variables.representations[0])
    .map((key: string) => {
      if (key !== "__typename") {
        return variable("representations_" + key);
      }
    })
    .filter(x => x);
  const valueBindings = variables.representations.map(
    (variable: { [key: string]: any }) => {
      return Object.keys(variable)
        .map((key: string) => {
          if (key !== "__typename") {
            const value = variable[key];
            if (context["@context"][value]) {
              return {
                [`?representations_${key}`]: namedNode(
                  context["@context"][value]
                )
              };
            } else {
              const datatype = retrieveDatatype(value);
              return {
                [`?representations_${key}`]: literal("" + value, datatype)
              };
            }
          }
        })
        .filter(x => x)
        .reduce((obj, item) => {
          obj[Object.keys(item)[0]] = item[Object.keys(item)[0]];
          return obj;
        }, {});
    }
  );
  //CONTRUCTION OF COMBINED VALUES CLAUSE WITH SPARQL
  const sparqlAlgebra = OperationFactory.createProject(
    OperationFactory.createJoin(
      OperationFactory.createValues(variablesBinding, valueBindings),
      OperationFactory.createJoin(
        OperationFactory.createBgp(valuesBgp),
        sparqlAlgebraCommunica.input
      )
    ),
    sparqlAlgebraCommunica.variables
  );
  return {
    sparqlAlgebra: sparqlAlgebra,
    singularizeVariables: {}
  };
}
