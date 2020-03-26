import * as chai from "chai";

import * as DataFactory from "@rdfjs/data-model";
import { Factory } from "sparqlalgebrajs";
import { communicaExtendQuery } from "../middlewares/communicaExtendQuery";
import { gql } from "apollo-server";

var expect = chai.expect;
const OperationFactory = new Factory(DataFactory);

describe("Converter", () => {
  describe("GraphQL-Extend functions", () => {
    it("it should convert a simple extend query", async () => {
      const context = {
        "@context": {
          BAGPND: "http://bag.basisregistraties.overheid.nl/def/bag#Pand",
          gerelateerdBRTgebouw: {
            "@reverse": "http://www.opengis.net/ont/geosparql#sfOverlaps"
          },
          brt0hoogteniveau:
            "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau",
          bag0identificatiecode:
            "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode"
        }
      };
      const variables = {
        representations: [
          { __typename: "BAGPND", bag0identificatiecode: "0307100000342331" },
          { __typename: "BAGPND", bag0identificatiecode: "0363100012165404" }
        ]
      };

      return expect(
        JSON.stringify(
          (await communicaExtendQuery(
            `query($representations:[_Any!]!)
                    {_entities(representations:$representations){
                      ...on BAGPND{
                        gerelateerdBRTgebouw{
                          brt0hoogteniveau
                        }
                      }
                    }
                  }`,
            context,
            variables
          )).sparqlAlgebra,
          null,
          2
        )
      ).equals(
        JSON.stringify(
          OperationFactory.createProject(
            OperationFactory.createJoin(
              OperationFactory.createValues(
                [DataFactory.variable("representations")],
                [
                  {
                    "?representations": DataFactory.literal(
                      "0307100000342331",
                      "http://www.w3.org/2001/XMLSchema#string"
                    )
                  },
                  {
                    "?representations": DataFactory.literal(
                      "0363100012165404",
                      "http://www.w3.org/2001/XMLSchema#string"
                    )
                  }
                ]
              ),
              OperationFactory.createJoin(
                OperationFactory.createBgp([
                  OperationFactory.createPattern(
                    DataFactory.variable("_entities"),
                    DataFactory.namedNode(
                      "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode"
                    ),
                    DataFactory.variable("representations")
                  )
                ]),
                OperationFactory.createLeftJoin(
                  OperationFactory.createBgp([]),
                  OperationFactory.createBgp([
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities"),
                      DataFactory.namedNode(
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                      ),
                      DataFactory.variable(
                        "http://bag.basisregistraties.overheid.nl/def/bag#Pand"
                      )
                    ),
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities_gerelateerdBRTgebouw"),
                      DataFactory.namedNode(
                        "http://www.opengis.net/ont/geosparql#sfOverlaps"
                      ),
                      DataFactory.variable("_entities")
                    ),
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities_gerelateerdBRTgebouw"),
                      DataFactory.namedNode(
                        "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau"
                      ),
                      DataFactory.variable(
                        "_entities_gerelateerdBRTgebouw_brt0hoogteniveau"
                      )
                    )
                  ])
                )
              )
            ),
            [
              DataFactory.variable(
                "_entities_gerelateerdBRTgebouw_brt0hoogteniveau"
              )
            ]
          ),
          null,
          2
        )
      );
    });

    it.skip("it should convert a custom scalar extend query", async () => {
      const context = {
        "@context": {
          BAGPND: "http://bag.basisregistraties.overheid.nl/def/bag#Pand",
          gerelateerdBRTgebouw: {
            "@reverse": "http://www.opengis.net/ont/geosparql#sfOverlaps"
          },
          brt0hoogteniveau:
            "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau",
          bouwdatum:
            "http://bag.basisregistraties.overheid.nl/def/bag#bouwdatum",
          Date: "http://www.w3.org/2001/XMLSchema#date"
        }
      };
      const variables = {
        representations: [
          { __typename: "BAGPND", bouwdatum: "01-01-1996" },
          { __typename: "BAGPND", bouwdatum: "01-01-2020" }
        ]
      };
      const typeDefs = gql`
        extend type BAGPND @key(fields: "bouwdatum"){
          bouwdatum: Date! @external
          gerelateerdBRTgebouw: [brt0Gebouw]
          bag0huisletter: [String]
          bag0huisnummer: [Int]
        };
        scalar Date
        `;

      return expect(
        JSON.stringify(
          (await communicaExtendQuery(
            `query($representations:[_Any!]!)
                  {_entities(representations:$representations){
                    ...on BAGPND{
                      gerelateerdBRTgebouw{
                        brt0hoogteniveau
                      }
                    }
                  }
                }`,
            context,
            variables
          )).sparqlAlgebra,
          null,
          2
        )
      ).equals(
        JSON.stringify(
          OperationFactory.createProject(
            OperationFactory.createJoin(
              // OperationFactory.createBgp([]),
              OperationFactory.createValues(
                [DataFactory.variable("representations")],
                [
                  {
                    "?representations": DataFactory.literal(
                      "01-01-1996",
                      "http://www.w3.org/2001/XMLSchema#date"
                    )
                  },
                  {
                    "?representations": DataFactory.literal(
                      "01-01-2020",
                      "http://www.w3.org/2001/XMLSchema#date"
                    )
                  }
                ]
              ),
              OperationFactory.createJoin(
                OperationFactory.createBgp([
                  OperationFactory.createPattern(
                    DataFactory.variable("_entities"),
                    DataFactory.namedNode(
                      "http://bag.basisregistraties.overheid.nl/def/bag#bouwdatum"
                    ),
                    DataFactory.variable("representations")
                  )
                ]),
                OperationFactory.createLeftJoin(
                  OperationFactory.createBgp([]),
                  OperationFactory.createBgp([
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities"),
                      DataFactory.namedNode(
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                      ),
                      DataFactory.variable(
                        "http://bag.basisregistraties.overheid.nl/def/bag#Pand"
                      )
                    ),
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities_gerelateerdBRTgebouw"),
                      DataFactory.namedNode(
                        "http://www.opengis.net/ont/geosparql#sfOverlaps"
                      ),
                      DataFactory.variable("_entities")
                    ),
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities_gerelateerdBRTgebouw"),
                      DataFactory.namedNode(
                        "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau"
                      ),
                      DataFactory.variable(
                        "_entities_gerelateerdBRTgebouw_brt0hoogteniveau"
                      )
                    )
                  ])
                )
              )
            ),
            [
              DataFactory.variable(
                "_entities_gerelateerdBRTgebouw_brt0hoogteniveau"
              )
            ]
          ),
          null,
          2
        )
      );
    });
    it.skip("it should convert a combined key extend query", async () => {
      const context = {
        "@context": {
          BAGPND: "http://bag.basisregistraties.overheid.nl/def/bag#Pand",
          gerelateerdBRTgebouw: {
            "@reverse": "http://www.opengis.net/ont/geosparql#sfOverlaps"
          },
          brt0hoogteniveau:
            "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau",
          bouwjaar: "http://bag.basisregistraties.overheid.nl/def/bag#bouwjaar",
          bag0huisletter:
            "http://bag.basisregistraties.overheid.nl/def/bag#huisletter",
          bag0huisnummer:
            "http://bag.basisregistraties.overheid.nl/def/bag#huisnummer",
          bag0openbareRuimte:
            "http://bag.basisregistraties.overheid.nl/def/bag#bijbehorendeOpenbareRuimte",
          rdfs0label: "http://www.w3.org/2000/01/rdf-schema#label"
        }
      };
      const variables = {
        representations: [
          {
            __typename: "BAGPND",
            bag0huisletter: "a",
            bag0huisnummer: "11",
            bag0openbareRuimte: { rdfs0label: "Koolmeesstraat" }
          },
          {
            __typename: "BAGPND",
            bag0huisletter: "b",
            bag0huisnummer: "12",
            bag0openbareRuimte: { rdfs0label: "van Houtstraat" }
          }
        ]
      };
      const typeDefs = gql`
        extend type BAGPND
          @key(
            fields: "bag0huisletter bag0huisnummer bag0openbareRuimte { rdfs0label }"
          ) {
          bag0openbareRuimte: [OpenbareRuimte] @external
          bag0huisletter: [String] @external
          bag0huisnummer: [Int] @external
          bouwjaar: [Int]
          gerelateerdBRTgebouw: [brt0Gebouw]
        }

        extend type OpenbareRuimte @key(fields: "rdfs0label") {
          rdfs0label: [String] @external
          straatLengte: [Int]
        }

        type brt0Gebouw {
          brt0bronactualiteit: [String]
          brt0bronnauwkeurigheid: [Float]
          brt0hoogteniveau: [Int]
          brt0objectBeginTijd: [String]
          brt0tijdstipRegistratie: [String]
        }
      `;

      return expect(
        JSON.stringify(
          (await communicaExtendQuery(
            `query($representations:[_Any!]!)
                {_entities(representations:$representations){
                  ...on BAGPND{
                    bouwjaar
                    gerelateerdBRTgebouw{
                      brt0hoogteniveau
                    }
                  }
                }
              }`,
            context,
            variables
          )).sparqlAlgebra,
          null,
          2
        )
      ).equal(
        JSON.stringify(
          OperationFactory.createProject(
            OperationFactory.createJoin(
              // OperationFactory.createBgp([]),
              OperationFactory.createValues(
                [DataFactory.variable("representations")],
                [
                  {
                    "?representations": DataFactory.literal(
                      "01-01-1996",
                      "http://www.w3.org/2001/XMLSchema#date"
                    )
                  },
                  {
                    "?representations": DataFactory.literal(
                      "01-01-2020",
                      "http://www.w3.org/2001/XMLSchema#date"
                    )
                  }
                ]
              ),
              OperationFactory.createJoin(
                OperationFactory.createBgp([
                  OperationFactory.createPattern(
                    DataFactory.variable("_entities"),
                    DataFactory.namedNode(
                      "http://bag.basisregistraties.overheid.nl/def/bag#bouwdatum"
                    ),
                    DataFactory.variable("representations")
                  )
                ]),
                OperationFactory.createLeftJoin(
                  OperationFactory.createBgp([]),
                  OperationFactory.createBgp([
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities"),
                      DataFactory.namedNode(
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
                      ),
                      DataFactory.variable(
                        "http://bag.basisregistraties.overheid.nl/def/bag#Pand"
                      )
                    ),
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities_gerelateerdBRTgebouw"),
                      DataFactory.namedNode(
                        "http://www.opengis.net/ont/geosparql#sfOverlaps"
                      ),
                      DataFactory.variable("_entities")
                    ),
                    OperationFactory.createPattern(
                      DataFactory.variable("_entities_gerelateerdBRTgebouw"),
                      DataFactory.namedNode(
                        "http://brt.basisregistraties.overheid.nl/def/top10nl#hoogteniveau"
                      ),
                      DataFactory.variable(
                        "_entities_gerelateerdBRTgebouw_brt0hoogteniveau"
                      )
                    )
                  ])
                )
              )
            ),
            [
              DataFactory.variable(
                "_entities_gerelateerdBRTgebouw_brt0hoogteniveau"
              ),
              DataFactory.variable("_entities_bouwjaar")
            ]
          ),
          null,
          2
        )
      );
    });
  });
});
