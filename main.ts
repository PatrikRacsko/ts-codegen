import fetch from 'node-fetch'
import {buildClientSchema, printSchema,parse } from 'graphql'
import {codegen} from '@graphql-codegen/core'
const fs = require('browserify-fs')
import * as typescriptPlugin from '@graphql-codegen/typescript';
import * as typescriptGQPlugin from '@graphql-codegen/typescript-graphql-request';

const introspectionQuery = `fragment FullType on __Type {
  kind
  name
  fields(includeDeprecated: true) {
    name
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
    isDeprecated
    deprecationReason
  }
  possibleTypes {
    ...TypeRef
  }
}
fragment InputValue on __InputValue {
  name
  type {
    ...TypeRef
  }
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
        ofType {
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
      }
    }
  }
}
query IntrospectionQuery {
  __schema {
    queryType {
      name
    }
    mutationType {
      name
    }
    types {
      ...FullType
    }
    directives {
      name
      locations
      args {
        ...InputValue
      }
    }
  }
}`

async function getGQSchema() {
    const endpoint = (<HTMLInputElement>document.getElementById('userInput')).value;
    console.log(endpoint)
    const {data, errors} = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({query: introspectionQuery})
    }).then((response ) => response.json())
    const schema = buildClientSchema(data)
    const parsedSchema = parse(printSchema(schema))
    const outputFile = 'schema.ts';
    console.log('schema', parsedSchema)
    // TODO toto generuje error kvoli pluginom
    const result = await codegen({config: {}, documents: [], filename: outputFile, pluginMap: {
        typescriptGraphqlRequest: typescriptGQPlugin
        },
        plugins: [{typescriptGraphqlRequest: {}}], schema: parsedSchema})

    //const path = '/Users/patrikracsko/WebstormProjects/lowcode/packages/gq-gen/vanilla-ts/schema.ts'
    /*fs.writeFile(path, result, () => {
        fs.readFile(path, 'utf-8', function(data : any) {
            console.log('data')
            console.log(data);
        });
    });*/
}

document.getElementById('getGQ').addEventListener('click', getGQSchema)
