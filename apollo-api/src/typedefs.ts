import { gql } from "apollo-server";

// GraphQL Typedefinitions: these are needed to respond to introspection queries and to specify how to extend
// another schema (here BAGPND)
export const typeDefs = gql`
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  type BAGPND @key(fields: "bag0oorspronkelijkBouwjaar") {
    bag0oorspronkelijkBouwjaar: String!
    status: String
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    bagTest: [BAGPND]
  }
`;
