# GraphQL API over Linked Data sources

The repository implements a GraphQL API over Linked Data. The API
must be manually configured once and can then be used by others to
query. It is possible to mix Linked Data backends with regular
GraphQL backends, exposing both through the same GraphQL API.

## Usage

In order to illustrate how this GraphQL API over Linked Data sources
works, we are going to run 3 servers:

### Start a Linked Data backend

Run the following commands to start a Linked Data backend for our
Graph API. It will run at port 3000 by default.
If you wish to run multiple Linked-Data backends, supply a unique port number with the `port` option.

```sh
cd comunica-api
yarn
yarn run dev #--port=3002
```

The Linked Data backend must be configured after the linked data backend has been (re-)started.
This is done by running the following commands:

```sh
cd configurer
yarn
yarn run dev
```

### Start a normal GraphQL backend

Run the following commands to start a normal GraphQL backend. It will
run at port 3001 by default.
If you wish to run multiple GraphQL backends, supply a unique port number with the `port` option.

```sh
cd apollo-api
yarn
yarn run dev #--port=3004
```

This illustrates that we can mix Linked Data with non-Linked Data
backends. We can start zero or more non-Linked Data backends.

### Start the Gateway

Run the following commands to start the GraphQL API which uses the
above started backends. It will run at port 3500, where GraphQL
queries can now be issued over the Linked Data and non-Linked Data
backends.

If you have more than one Linked-Data backend, or more than one GraphQL-backend, or you use non-default ports for the backends (by supplying a `port` argument as described above),
you will first need to change the list of endpoints (`serviceList`) in [apollo-gateway/src/index.ts](apollo-gateway/src/index.ts) to reflect the changes.

```sh
cd apollo-gateway
yarn
yarn run dev
```

## Source structure

### Comunica source (`comunica-api`)

Using Comunica and GraphQL-LD, this wraps over a single RDF-based
source, and exposes it as a GraphQL endpoint. Additionally, a simple
Apollo component is set up that can handle instrospection queries against
the GraphQL schema.

Whenever a query reaches this server, this component will check
whether or not this is an introspection query. If it is an
introspection query, the query will be delegated to the internal
Apollo component. If it is not an introspection query, the query will
be delegated to the Comunica/GraphQL-LD component.

Required configuration:

- RDF source URL : raw RDF file, SPARQL endpoint, TPF interface, …
- JSON-LD context: for non-introspection queries handled by GraphQL-LD
- GraphQL schema: for introspection queries handled by Apollo

### GraphQL source (`apollo-api`)

This sets up a simple GraphQL endpoint with some dummy resolvers.

This can be replaced by any other GraphQL endpoint.

### GraphQL federator (`apollo-gateway`)

This sets up a root GraphQL endpoint that federates over any number of
GraphQL endpoints. In this case, it federates over
http://localhost:3000 and http://localhost:3001, which correspond to a
Comunica/GraphQL-LD source and a GraphQL source.

The configured sources can be changed easily within the source code.

## Example queries

### Query the schema

```graphql
{
  __schema {
    types {
      name
    }
  }
}
```

### Query the non-Linked Data backend

```graphql
{
  books {
    author
  }
}
```

### Query the Linked Data backend

```graphql
{
  mes {
    name
  }
}
```

```graphql
{
  hero {
    name
    friends {
      name
    }
  }
}
```

```graphql
{
  hero {
    name
    id2
  }
}
```

```graphql
{
  getBag(bouwjaar: 1880) {
    identificatiecode
    bagstatus {
      label
    }
  }
}
```

## Known limitations

- Two different endpoints can not have the same queries specified in their typedefs.
