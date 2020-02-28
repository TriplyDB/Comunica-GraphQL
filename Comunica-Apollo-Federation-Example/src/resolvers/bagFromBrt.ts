import {runQuery} from "./index";

// Here we send an augmented query to the Comunica endpoint.
// Note that we `re-implement` the type structure that we already specify in the typedef. This is partly because
// we need to add an input argument to the query in a specific way so that it is also  part of the context
// partly because need to add the @single tag to the end of the statment in order to not get an array back.

export async function getBagFromBrtQuery(args: any) {

  const context = {
    identificatiecode: "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
    BRTGBW: { "@reverse": "http://www.opengis.net/ont/geosparql#sfOverlaps" },
    gerelateerdBAGpand: "http://www.opengis.net/ont/geosparql#sfOverlaps",
    bagstatus: "http://bag.basisregistraties.overheid.nl/def/bag#status",
    INPUT: "http://brt.basisregistraties.overheid.nl/top10nl/id/gebouw/" + args.brtId
  }

  const query = `{
    BRTGBW(_:INPUT) @single
        {
          gerelateerdBAGpand
              {
                identificatiecode @single
                bagstatus @single
              }
          }
  }`

  return (await runQuery(context, query)).body.data[0].BRTGBW.gerelateerdBAGpand;
}
