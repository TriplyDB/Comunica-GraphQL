import { Converter } from "graphql-to-sparql";
import * as RDF from "rdf-js";
import { Factory, Algebra } from "sparqlalgebrajs";
import * as DataFactory from "@rdfjs/data-model";

let converter: Converter = new Converter();
const OperationFactory = new Factory(DataFactory);

interface Context {
  // TODO improve in future
  [key: string]: any;
}

function retrieveDatatype(value: any): RDF.NamedNode {
  const type = typeof value;
  if (type === "string") {
    return DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#string");
  } else if (type === "boolean") {
    return DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#boolean");
  } else if (type === "bigint") {
    return DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  } else if (type === "number" && Number.isInteger(value)) {
    return DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#integer");
  } else if (type === "number") {
    return DataFactory.namedNode("http://www.w3.org/2001/XMLSchema#float");
  }
}

async function comunicaQuery(query: string, context: Context) {
  query = query.replace(
    `query($representations:[_Any!]!)`,
    `query($representations:_Any!)`
  );
  const sparqlAlgebraComunica: Algebra.Operation = await converter.graphqlToSparqlAlgebra(
    query,
    context,
    {
      variablesDict: { representations: { kind: "StringValue", value: "" } }
    }
  );
  sparqlAlgebraComunica.input.left.patterns = sparqlAlgebraComunica.input.left.patterns.filter(
    (item: RDF.BaseQuad) => {
      item.predicate.value != "entities" &&
        item.predicate.value != "representations";
    }
  );
  return sparqlAlgebraComunica;
}

function returnLiteral(value: string, datatype: RDF.NamedNode) {
  const x = DataFactory.literal(value, datatype);
  if ("http://www.w3.org/2001/XMLSchema#string" === datatype.value) {
    x.datatype = null;
  }
  return x;
}

export async function comunicaExtendQuery(
  query: string,
  context: Context,
  variables: { representations: { [key: string]: any }[] }
) {
  // CONVERSION OF GRAPHQL to SPARQL

  const sparqlAlgebraComunica = await comunicaQuery(query, context);

  const representations = variables.representations;

  // GENERATION OF variables bgp
  const valuesBgp = Object.keys(representations[0])
    .filter(key => key !== "__typename")
    .map(key =>
      OperationFactory.createPattern(
        DataFactory.variable("_entities"),
        DataFactory.namedNode(context["@context"]["" + key]),
        DataFactory.variable("representations_" + key)
      )
    );

  // GENERATION OF VALUES CLAUSE
  const variablesBinding = Object.keys(representations[0])
    .filter(key => key !== "__typename")
    .map(key => DataFactory.variable("representations_" + key));

  const valueBindings = representations.map(variable =>
    Object.keys(variable)
      .filter(key => key !== "__typename")
      .map((key: string) => ({
        [`?representations_${key}`]: context["@context"][variable[key]]
          ? DataFactory.namedNode(context["@context"][variable[key]])
          : returnLiteral("" + variable[key], retrieveDatatype(variable[key]))
      }))
      .reduce((obj, item) => ({ ...obj, ...item }), {})
  );

  //CONTRUCTION OF COMBINED VALUES CLAUSE WITH SPARQL
  const sparqlAlgebra = OperationFactory.createProject(
    OperationFactory.createJoin(
      OperationFactory.createValues(variablesBinding, valueBindings),
      OperationFactory.createJoin(
        OperationFactory.createBgp(valuesBgp),
        sparqlAlgebraComunica.input
      )
    ),
    [...variablesBinding, ...sparqlAlgebraComunica.variables]
  );
  const singularizedVars: { [key: string]: boolean } = {};
  for (var variableBind of [
    ...variablesBinding,
    ...sparqlAlgebraComunica.variables
  ]) {
    var name: string = "";
    for (const element of variableBind.value.split("_")) {
      name = name + element;
      name = name.replace("_entities", "entities");
      if (name.includes("entities")) {
        singularizedVars[name] = false;
      } else {
        singularizedVars[name] = true;
      }
      name = name + "_";
    }
  }
  singularizedVars[""] = false;
  singularizedVars["entities"] = false;
  return {
    sparqlAlgebra: sparqlAlgebra,
    singularizeVariables: singularizedVars
  };
}
