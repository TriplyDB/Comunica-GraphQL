// Resolvers define the technique for fetching the types defined in the
// schema. This resolver retrieves books from the "books" array above.
const Panden = [
  {
    bag0oorspronkelijkBouwjaar: "0738100000000001",
    bag0identificatiecode: "0738100000000001",
    status: "Actief"
  },
  {
    bag0oorspronkelijkBouwjaar: "0738100000000170",
    bag0identificatiecode: "0738100000000170",
    status: "Actief"
  },
  {
    bag0oorspronkelijkBouwjaar: "0738100000000235",
    bag0identificatiecode: "0738100000000235",
    status: "Actief"
  }
];

export const resolvers = {
  Query: {
    bagTest: () => Panden
  }
};
