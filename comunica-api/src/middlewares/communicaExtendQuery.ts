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

function retrieveDatatype(value: any): RDF.NamedNode | "EnumValue" {
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
  const predicate =
    context["@context"]["" + Object.keys(variables.representations[0])[1]];
  const variablesBinding = [variable("representations")];
  const valueBindings = variables.representations.map(
    (variable: { [key: string]: any }) => {
      const value = variable[Object.keys(variable)[1]];
      if (context["@context"][value]) {
        return { "?representations": namedNode(context["@context"][value]) };
      } else {
        const datatype = retrieveDatatype(value);
        return { "?representations": literal("" + value, datatype) };
      }
    }
  );

  //CONTRUCTION OF COMBINED VALUES CLAUSE WITH SPARQL
  const sparqlAlgebra = OperationFactory.createProject(
    OperationFactory.createJoin(
      OperationFactory.createValues(variablesBinding, valueBindings),
      OperationFactory.createJoin(
        OperationFactory.createBgp([
          OperationFactory.createPattern(
            DataFactory.variable("_entities"),
            DataFactory.namedNode(predicate),
            DataFactory.variable("representations")
          )
        ]),
        sparqlAlgebraCommunica.input
      )
    ),
    sparqlAlgebraCommunica.variables
  );
  console.info(toSparql(sparqlAlgebra));
  return {
    sparqlAlgebra: sparqlAlgebra,
    singularizeVariables: {}
  };
}
