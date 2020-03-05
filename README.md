# GraphQL API over Linked Data sources

The repository implements a regular GraphQL API over Linked Data
sources. The API must be manually configured once per Linked Data
source, and can then be queried by others.

Optionally, it is possible to mix Linked Data backends with regular
GraphQL backends, and expose them through one unified GraphQL Gateway.

## Usage

Exposing a Linked Data source through GraphQL currently requires
perfoming the following two steps (in that order):

  1. Start a Comunica service.
  2. Run a configuration script.

### Start a Comunica service

Start a Comunica service with the following commands:

```sh
cd comunica-api
yarn
yarn run dev
```

By default, Comunica will run on port 3000.  Use the `--port` flag to
set a different port.

### Run a configuration script

Each Comunica service must be configured with one configuration
script.  The configuration script includes the URL at which the
Comunica service is exposed.

The following commands run a configuration script:

```sh
cd configurer
yarn
yarn run dev
```

Running the configuration script resets the configuration of the
corresponding Comunica service.

Because service and configuration are decoupled, the GraphQL API has
no downtime during configuration changes.

## Advanced usage

The above instructions explain the basic use case of running one
GraphQL API over one Linekd Data source.

This section explains to following more advanced use cases:

  - Exposing multiple Linked Data sources.
  - Mix Linked Data sources with regular GraphQL endpoints.
  - Run a GraphQL Gateway + developer GUI

### Expose multiple Linked Data sources

Multiple Linked Data sources can be exposed by running multiple
Comunica services (see above).  Each Comunica service must run on a
different port.

For each Comunica service a different configuration script must be
run.

### Mix with regular GraphQL backends

In addition to Linked Data backends, you can also start zero or more
regular GraphQL backends.

This is done by running the following commands:

```sh
cd apollo-api
yarn
yarn run dev
```

The default port for the regular GraphQL backend is 3001.  A different
port can be specified with the `--port` flag.

### Start a GraphQL Gateway

Run the following commands to start a unified GraphQL Gateway over an
arbitrary number of Linked Data and non-Linked Data backends:

```sh
cd apollo-gateway
yarn
yarn run dev
```

The default port for the Gateway is 3500.  A different port can be
specified with the `--port` flag.

This list of used backens is stored in variable `serviceList` in flle
[apollo-gateway/src/index.ts](apollo-gateway/src/index.ts).

## Source structure

This sections explans the structure of the source files in this
repository.

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

### Query the Linked Data backend

```graphql
{
  bag0hoofdadres(
    bag0postcode:"7311KZ",
    bag0huisnummer:110
  ) {
    verblijfsobject{
      bag0oppervlakte
      bag0pandrelatering{
        bag0oorspronkelijkBouwjaar
        geo0hasGeometry{geo0asWKT}
        brt0bijbehoordGebouw{
          geo0hasGeometry{geo0asWKT}
        }
      }
    }
  }
}
```

```json
{
  "data": {
    "bag0hoofdadres": [
      {
        "verblijfsobject": [
          {
            "bag0oppervlakte": [
              8870
            ],
            "bag0pandrelatering": [
              {
                "bag0oorspronkelijkBouwjaar": [
                  1982
                ],
                "geo0hasGeometry": [
                  {
                    "geo0asWKT": [
                      "POLYGON((5.962296605 52.212026196,5.962124204 52.211948229,5.962208274 52.211816531,5.962341019 52.211608612,5.962427406 52.211629295,5.962401366 52.211670336,5.96243599 52.211678759,5.962482474 52.211640208,5.962541463 52.211667046,5.96266271 52.211722217,5.962618977 52.211758472,5.962510659 52.211849015,5.962326577 52.212001809,5.962305394 52.212019044,5.962296605 52.212026196))"
                    ]
                  }
                ],
                "gebouw": [
                  {
                    "geo0hasGeometry": [
                      {
                        "geo0asWKT": [
                          "POLYGON((5.962481413 52.211850344,5.962277515 52.212019746,5.962101416 52.211939774,5.962470588 52.211633049,5.962644906 52.21171222,5.962569254 52.211775082,5.962593376 52.211786037,5.962503755 52.21186049,5.962481413 52.211850344))",
                          "POLYGON((5.962336701 52.211611923,5.96243663 52.211633169,5.962411859 52.211681843,5.962196424 52.211860837,5.962336701 52.211611923))"
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```
Two queries that shouw how the BAG is connected to the CBS data set.
```GraphQL
{
  bag0hoofdadres(bag0postcode:"1091VA", bag0huisnummer:255){
    verblijfsobject{
      bag0oppervlakte
      bag0status{
        rdfs0label
      }
      bag0pandrelatering{
        bag0oorspronkelijkBouwjaar
        bag0identificatiecode
        geo0sfWithin{
          rdfs0label
          geo0sfWithin{
            rdfs0label
          }
        }
      }
    }
  }
}
```

```JSON
{
  "data": {
    "bag0hoofdadres": [
      {
        "verblijfsobject": [
          {
            "bag0oppervlakte": [
              50,
              53,
              80
            ],
            "bag0status": [
              {
                "rdfs0label": [
                  "Verblijfsobject in gebruik (status verblijfsobject)"
                ]
              }
            ],
            "bag0pandrelatering": [
              {
                "bag0oorspronkelijkBouwjaar": [
                  1902
                ],
                "bag0identificatiecode": [
                  "0363100012165404"
                ],
                "geo0sfWithin": [
                  {
                    "rdfs0label": [
                      "Oosterparkbuurt Zuidwest"
                    ],
                    "geo0sfWithin": [
                      {
                        "rdfs0label": [
                          "Oosterparkbuurt"
                        ]
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

```graphql
{
  bag0pandrelatering(bag0identificatiecode: "0363100012165404"){
    geo0sfWithin{
      rdfs0label
      geo0sfWithin{
        rdfs0label
        geo0sfWithin{
          rdfs0label
          owl0sameAs{
            geo0hasGeometry{
              geo0asWKT
            }
          }
        }
      }
    }
  }
}
```

```json
{
  "data": {
    "bag0pandrelatering": [
      {
        "geo0sfWithin": [
          {
            "rdfs0label": [
              "Oosterparkbuurt Zuidwest"
            ],
            "geo0sfWithin": [
              {
                "rdfs0label": [
                  "Oosterparkbuurt"
                ],
                "geo0sfWithin": [
                  {
                    "rdfs0label": [
                      "Amsterdam"
                    ],
                    "owl0sameAs": [
                      {
                        "geo0hasGeometry": [
                          {
                            "geo0asWKT": [
                              "MULTIPOLYGON(((4.9806828979168 52.33076108613,4.9808593115408 52.330761161751
                              ...
                            ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
}
```


## Known limitations

- Two different backends that are exposed through the cannot have the
  same queries specified in their type definitions.
