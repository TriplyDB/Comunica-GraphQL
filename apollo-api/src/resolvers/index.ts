// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const Panden = [
  {
    pandkey: "0363100012165404",
    status: "Actief",
    WaterstofGebruik: "101"
  },
  {
    pandkey: "0307100000342331",
    status: "Actief",
    WaterstofGebruik: "102"
  }
];

export const resolvers = {
  Query: {
    bagTest: () => Panden
  }
};
