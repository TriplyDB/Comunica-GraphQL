# Introspection

The Apollo GraphQL endpoint that was set up in this repository has been successfully used to support an Apollo federation server that can federate queries over several sources. We hypothesized that it was possible to do this because we had:

- A queryable GraphQL endpoint
- A specified extension in the schema of the endpoint

To realize these two points we used Apollo. However we would like to investigate if it is possible to make a more direct connection with the Comunica module without depending on Apollo. If we wish to use federation without using Apollo, we would have to at least be able to adhere to the two above requirements. We should note here that it was only a working hypothesis that these two points are sufficient. There is a full specification of what should be implemented in order to be able to contribute a graphql endpoint that can be used for federation [here](https://www.apollographql.com/docs/apollo-server/federation/federation-spec/)

So perhaps we can tackle a more simple problem: making use of Comunica, we may want to simply retrieve a schema (whether this is stored or dynamically generated does not matter for this discussion). This way, users wanting to query a linked data source with GraphQL have at least an indication of what queries they can send. For this we use introspection queries.

The introspection queries can range from fairly simple to comprehensively scraping the schema. Following the simple [tutorial](https://graphql.org/learn/introspection/) provided for on graphql.org, we could start with the following query:

```graphql
{
  __schema {
    types {
      name
    }
  }
}
```
For which we get the example response from our endpoint in this repository (only  part is shown):

```json
{
  "data": {
    "__schema": {
      "types": [
        {
          "name": "Query"
        },
        {
          "name": "_Any"
        },
        {
          "name": "_Entity"
        },
        {
          "name": "BAGPND"
        },
        {
          "name": "String"
        },
        {
          "name": "BRTGBW"
        },
        {
          "name": "BAGpand"
        }
      ]
    }
  }
}
```
Or the following to obtain the queries:

```GraphQL
{
  __schema {
    queryType {
      name
    }
  }
}
```
For the current example this only returns `query` as that is the only queryType defined.

For all of the types from the first query we can get more information, basically retrieving part of the schema for `BAGpand` by running the following query:

```GraphQL
{
  __type(name: "BAGpand") {
    name
    fields {
      name
      type {
        name
        kind
        ofType {
          name
          kind
        }
      }
    }
  }
}
```
which results in the following response with part of the schema
```JSON
{
  "data": {
    "__type": {
      "name": "BAGpand",
      "fields": [
        {
          "name": "identificatiecode",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "bagstatus",
          "type": {
            "name": "String",
            "kind": "SCALAR",
            "ofType": null
          }
        },
        {
          "name": "gerelateerdBRTgebouw",
          "type": {
            "name": null,
            "kind": "LIST",
            "ofType": {
              "name": "BRTGBW",
              "kind": "OBJECT"
            }
          }
        }
      ]
    }
  }
}
```
Now we know which fields are on the `BAGpand` type and which types they are of. It would be very nice to be able to send these queries directly to a Comunica endpoint.

What we would like to actually obtain with an introspection query is information to (re)build the Schema from one query. This can be achieved with the following query ([source](https://github.com/graphql/graphql-js/blob/master/src/utilities/getIntrospectionQuery.js)):

```graphql
query IntrospectionQuery {
    __schema {
      queryType { name }
      mutationType { name }
      subscriptionType { name }
      types {
        ...FullType
      }
      directives {
        name
        description
        args {
          ...InputValue
        }
        locations
      }
    }
  }
  fragment FullType on __Type {
    kind
    name
    description
    fields(includeDeprecated: true) {
      name
      description
      args {
        ...InputValue
      }
      type {
        ...TypeRef
      }
      isDeprecated
      deprecationReason
    }
    inputFields {
      ...InputValue
    }
    interfaces {
      ...TypeRef
    }
    enumValues(includeDeprecated: true) {
      name
      description
      isDeprecated
      deprecationReason
    }
    possibleTypes {
      ...TypeRef
    }
  }
  fragment InputValue on __InputValue {
    name
    description
    type { ...TypeRef }
    defaultValue
  }
  fragment TypeRef on __Type {
    kind
    name
    ofType {
      kind
      name
      ofType {
        kind
        name
        ofType {
          kind
          name
        }
      }
    }
  }
```
As explained [here](https://github.com/apollographql/apollo-server/blob/2b0688fc8802d3600c1cf1cda82af79cce163698/docs/source/testing/mocking.md), this query 'scrapes' all the information based on the graphql [specification](http://spec.graphql.org/June2018/#sec-Schema-Introspection) for types. The results from the query (in the example schema.json) can then be converted into a GraphQL schema object using the following block of code. It uses `buildClientSchema` utility from the `graphql` package

```typescript
const { buildClientSchema } = require('graphql');
const introspectionResult = require('schema.json');

const schema = buildClientSchema(introspectionResult.data);
```


The example result would be too long to display as a code snippet but is saved in this folder under [introspection_result](introspection_result.json)

What we can tell is that if the full introspection functionality is to be uphold the following should be implemented: https://github.com/graphql/graphql-js/blob/master/src/type/introspection.js. But it does seem to be sufficient for Apollo if the above Introspect Query is implemented (it may be enough if it returns a certain predefined answer). Note that we are now talking about displaying the schema. For federation we most likely have to implement the specifications mentioned at the beginning of this document.

It is difficult to estimate whether it is worth the effort to implement the above, to then further implement the Apollo Federation Specification. There is a lot of effort involved the specifications for introspection and federation mentioned in this document. The problem is now captured in a (admittedly simplified) Apollo shell around Comunica. With improvements around the resolver, continuing the current path would be a cost/time efficient direction.
