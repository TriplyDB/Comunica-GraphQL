import {runQuery} from "./index";

export async function getBrtFromBagQuery(args: any) {
  const context = {
    gerelateerdBRTgebouw: {
      "@reverse": "http://www.opengis.net/ont/geosparql#sfOverlaps"
    },
    label: "http://www.w3.org/2000/01/rdf-schema#label",
    INPUT: "http://bag.basisregistraties.overheid.nl/bag/id/pand/" + (args.bagId || args.CPNDV_CPNDI_PAND_ID),
    gerelateerdBAGpand: "http://www.opengis.net/ont/geosparql#sfOverlaps",
    identificatiecode: "http://bag.basisregistraties.overheid.nl/def/bag#identificatiecode",
    BAGpand: "http://bag.basisregistraties.overheid.nl/def/bag#pandrelatering"
  };

  const query = `{
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
  }`
  return (await runQuery(context, query)).body.data[0].BAGpand.gerelateerdBRTgebouw; // this is a schema
}
