const express = require( 'express')
const { ApolloServer } = require( 'apollo-server-express')
const { gql } = require( 'apollo-server-express')
const superagent = require( "superagent")
const {buildFederatedSchema} = require("@apollo/federation")

// Code to set up a GraphQl endpoint that resolves to a Comunica based server. Effectively this means that
// GraphQL queries can be sent to a SPARQL (or LDF in another implementation) and the expected JSON is
// returned.

// GraphQL Typedefinitions: these are needed to respond to introspection queries and to specify how to extend
// another schema (here BAGPND)
const typeDefs = gql`
type Query {
  getBagFromBrt(brtId: String): [BAGpand],
  getBrtFromBag(bagId: String): [BRTGBW]
}

type BRTGBW {
  label: String
  gerelateerdBAGpand: [BAGpand]
}

extend type BAGPND @key(fields: "CPNDV_CPNDI_PAND_ID"){
    CPNDV_CPNDI_PAND_ID: String @external
    gerelateerdBRTgebouw: [BRTGBW]
}

type BAGpand  {
  identificatiecode: String
  bagstatus: String
  gerelateerdBRTgebouw: [BRTGBW]
}
`
// The same endpoint is used in this example code
//const endpoint = "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/services/knowledge-graph/sparql"
const endpoint = "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/fragments"

// Helper function for the resolver. Here, we send an augmented query to the Comunica endpoint
// Note that we `re-implement` the type structure that we already specify above. This is partly because
// we need to add an input argument to the query in a specific way so that it is also  part of the context
// partly because need to add the @single tag to the end of the statment in order to not get an array back.
async function getBagFromBrtQuery(args) {
    const input = "http://brt.basisregistraties.overheid.nl/top10nl/id/gebouw/"+args.brtId
    const contextBRT = {
      "@context": {
          "identificatiecode":"http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
          "BRTGBW": {"@reverse":"http://www.opengis.net/ont/geosparql#sfOverlaps"},
          "gerelateerdBAGpand": "http://www.opengis.net/ont/geosparql#sfOverlaps",
          "bagstatus": "http://bag.basisregistraties.overheid.nl/def/bag#status",
          "INPUT" : input
        }
      }
    const res = await superagent.post("http://localhost:3000").send(
      {
        "endpoint":endpoint,
        "query":`{
                BRTGBW(_:INPUT) @single
                    {
                      gerelateerdBAGpand
                          {
                            identificatiecode @single
                            bagstatus @single
                          }
                      }
              }`,
        "context" : contextBRT
      }
    )
    const thingToReturn = res.body.data[0].BRTGBW.gerelateerdBAGpand
    console.info(thingToReturn)
    return thingToReturn
  }

// Helper function for the resolvers
async function getBrtFromBagQuery(args) {

  var input
  if(args.bagId){
      input = args.bagId
  }
  else{
      input = args.CPNDV_CPNDI_PAND_ID
  }

  const inp = "http://bag.basisregistraties.overheid.nl/bag/id/pand/"+input

  const contextBAG = {
    "@context": {
        "gerelateerdBRTgebouw": {"@reverse":"http://www.opengis.net/ont/geosparql#sfOverlaps"},
        "label" : "http://www.w3.org/2000/01/rdf-schema#label",
        "INPUT" : inp,
        "gerelateerdBAGpand": "http://www.opengis.net/ont/geosparql#sfOverlaps",
        "identificatiecode":"http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
      "BAGpand": "http://bag.basisregistraties.overheid.nl/def/bag#pandrelatering"
      }
    }
    const res = await superagent.post("http://localhost:3000").send(
      {
        "endpoint":endpoint,
        "query":`{
                BAGpand(_:INPUT) @single
                {
                  gerelateerdBRTgebouw
                  {
                    label @single
                    gerelateerdBAGpand
                    {
                      identificatiecode @single
                    }
                  }
                }
              }`,
        "context" : contextBAG
      }
    )
    const thingToReturn = res.body.data[0].BAGpand.gerelateerdBRTgebouw
    console.info(thingToReturn)
    return thingToReturn
  }

// Defining the resolvers
const resolvers = {
  Query: {
      getBagFromBrt(parent, args, ctx, info) {
        return getBagFromBrtQuery(args);
      },
      getBrtFromBag(parent, args, ctx, info) {
        return getBrtFromBagQuery(args);
      }
  },
  BAGPND: {
    gerelateerdBRTgebouw(parent, args, ctx, info) {
        return getBrtFromBagQuery(parent);
      }
  }
}

// Setting up the Apollo server
const PORT = process.env.PORT || 3500
const app = express()
const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ]),
  playground:true
  // More possible options:
  // engine:false,
  // reporting:false
  // tracing: true
});

// Expose the server
server.applyMiddleware({ app })
app.listen(PORT, () =>
  console.log(`Listening at http://localhost:${PORT}/graphql`)
)
