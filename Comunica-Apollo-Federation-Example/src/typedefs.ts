import { gql } from "apollo-server-express";

// GraphQL Typedefinitions: these are needed to respond to introspection queries and to specify how to extend
// another schema (here BAGPND)
export const typeDefs = gql`
  type Query {
    getBagFromBrt(brtId: String): [BAGpand]
    getBrtFromBag(bagId: String): [BRTGBW]
  }

  type BRTGBW {
    label: String
    gerelateerdBAGpand: [BAGpand]
  }

  extend type BAGPND @key(fields: "CPNDV_CPNDI_PAND_ID") {
    CPNDV_CPNDI_PAND_ID: String @external
    gerelateerdBRTgebouw: [BRTGBW]
  }

  type BAGpand {
    identificatiecode: String
    bagstatus: String
    gerelateerdBRTgebouw: [BRTGBW]
  }
`;
