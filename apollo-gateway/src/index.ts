import {ApolloServer, Config} from "apollo-server";
import {ApolloGateway} from "@apollo/gateway";

const gateway = new ApolloGateway({
 serviceList: [
   { name: 'comunica-service-1', url: 'http://localhost:3000/query' },
   { name: 'graphql-service-1', url: 'http://localhost:3001' },
 ]
});

const APOLLO_CONFIG: Config = {
 gateway,
 playground: true,
 subscriptions: false,
};
const server = new ApolloServer(APOLLO_CONFIG);

// Expose server
const PORT = process.env.PORT || 3500;
server.listen(PORT, () => console.log(`Listening at http://localhost:${PORT}/graphql`));
