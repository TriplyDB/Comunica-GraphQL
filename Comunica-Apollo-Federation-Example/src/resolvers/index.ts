import {getBrtFromBagQuery} from "./brtFromBag";
import {getBagFromBrtQuery} from "./bagFromBrt";
import * as superagent from "superagent";

const endpoint = "https://api.labs.kadaster.nl/datasets/kadaster/knowledge-graph/fragments";

export const runQuery = (context: any, query: string) => superagent.post("http://localhost:3000").send({ endpoint, query, context: { "@context": context } });

export const resolvers =  {
  Query: {
    getBagFromBrt: (_parent: any, args: any, _ctx: any, _info: any) => getBagFromBrtQuery(args),
    getBrtFromBag: (_parent: any, args: any, _ctx: any, _info: any) => getBrtFromBagQuery(args)
  },
  BAGPND: {
    gerelateerdBRTgebouw: (parent: any, _args: any, _ctx: any, _info: any) => getBrtFromBagQuery(parent)
  }
};
