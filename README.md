# Federation over GraphQL and RDF sources

This prototype illustrates how one can federate over a combination
of any number of GraphQL interfaces and RDF-based interfaces via a single GraphQL endpoint.

## Details

### Comunica source

**Location:** `Comunica-Api/`

Using Comunica and GraphQL-LD, this wraps over a single RDF-based source, and exposes it as a GraphQL endpoint.
Additionally, a simple Apollo component is set up that can handle queries against a GraphQL context.

Whenever a query reaches this server, this component will check whether or not this is an introspection query.
If it is an introspection query, the query will be delegated to the internal Apollo component.
If it is not an introspection query, the query will be delegated to the Comunica/GraphQL-LD component.

**Required configuration:**
* RDF source URL: raw RDF file, SPARQL endpoint, TPF interface, ...
* JSON-LD context: for non-introspection queries handled by GraphQL-LD
* GraphQL schema: for introspection queries handled by Apollo

### GraphQL source

**Location:** `dummy-graphQL-endpoint/`

This sets up a simple GraphQL endpoint with some dummy resolvers.

This can be replaced by any other GraphQL endpoint.

### GraphQL federator

**Location:** `Comunica-Apollo-Federation-Example`

This sets up a root GraphQL endpoint that federates over any number of GraphQL endpoints.
In this case, it federates over localhost:3000 and localhost:3001,
which correspond to a Comunica/GraphQL-LD source and a GraphQL source.

The configured sources can be changed easily within the source code.

## Usage

Run the following scripts in separate terminal sessions.

TODO: make a convenience script for starting everything in parallel.

Start the Comunica source (port 3000):
```bash
cd Comunica-Api
npm run dev
```

Start the GraphQL source (port 3001):
```bash
cd dummy-graphQL-endpoint
npm run dev
```

Start the GraphQL federator (port 3500):
```bash
cd Comunica-Apollo-Federation-Example
npm run dev
```

Now, we can execute any GraphQL query at http://localhost:3500.
The GraphQL federator will automatically delegate between the Comunica source and the GraphQL source.
