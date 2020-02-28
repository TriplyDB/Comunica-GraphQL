
import { makeExecutableSchema } from 'graphql-tools';
import { ApolloServer, Config, gql } from "apollo-server";
import { GraphQLSchema } from "graphql";
import { buildFederatedSchema } from "@apollo/federation";

let apolloServer: ApolloServer;

const init = (schema: GraphQLSchema) => {
  const APOLLO_CONFIG: Config = { schema }
  apolloServer = new ApolloServer(APOLLO_CONFIG);
}


export async function requestApollo(query: string) {
  return apolloServer.executeOperation({ query })

}

init(buildFederatedSchema({
  typeDefs: gql`
  type Query {
    getBagFromBrt(brtId: String): [BAGpand]
    getBrtFromBag(bagId: String): [BRTGBW]
  }

  type BRTGBW {
    label: String
    gerelateerdBAGpand: [BAGpand]
  }

  type BAGpand {
    identificatiecode: String
    bagstatus: String
    gerelateerdBRTgebouw: [BRTGBW]
  }`
}));
//
// requestApollo(// query
//   `
//   {
//     __schema {
//       types {
//         name
//       }
//     }
//   }
//   `
// ).then(console.info).catch(console.error)
