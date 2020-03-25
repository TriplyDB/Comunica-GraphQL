// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const Panden = [
  // {
  //   bag0oorspronkelijkBouwjaar: 2020,
  //   bag0identificatiecode: "0363100012165404",
  //   status: "Actief"
  // },
  {
    bag0oorspronkelijkBouwjaar: 2020,
    bag0identificatiecode: "0307100000342331",
    status: "Actief"
  }
];

export const resolvers = {
  Query: {
    bagTest: () => Panden
  }
};
