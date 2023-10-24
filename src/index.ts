import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import gql from 'graphql-tag';
import { buildSubgraphSchema } from '@apollo/subgraph';


const paycheckData = 
[
  {
    id: '1',
    employeeId: 'emp-1',
    amount: "1000.34 USD"
  },
  {
    id: '2',
    employeeId: 'emp-2',
    amount: "2000.34 USD"
  }    
]

const typeDefs = gql`
  extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key", "@shareable"])

  type Query {
    me: User,
    getPaychecks: [Paycheck]
  }

  type User @key(fields: "id") {
    id: ID! ,
    username: String
  }

  type Employee @key(fields: "id",  resolvable: false) {
    id: ID!
  }

  type Paycheck @key(fields: "id"){
    id: ID!
    employee: Employee,
    amount: String!
  }
  
  
`;

const resolvers = {
  Query: {
    me() {
      return { id: '1', username: '@ava' };
    },
    getPaychecks() {
      return paycheckData
     }
  },
  User: {
    __resolveReference(user, { fetchUserById }) {
      return fetchUserById(user.id);
    },
  },
  Paycheck: {
    employee: (employee) => {
      console.log(employee);
      return {id: employee.employeeId};
    }
  }
  
};


const requestLogPlugin = {
  // Fires whenever a GraphQL request is received from a client.
  async requestDidStart(requestContext) {
    console.log(requestContext +  'Request started!');

    return {
      // Fires whenever Apollo Server will parse a GraphQL
      // request to create its associated document AST.
      async parsingDidStart(requestContext) {
        console.log('Parsing started!');
      },

      // Fires whenever Apollo Server will validate a
      // request's document AST against your GraphQL schema.
      async validationDidStart(requestContext) {
        console.log('Validation started!');
      },

      async executionDidStart(requestContext) {
        console.log('Execution started!');
      },
    };
  },
};


const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
  plugins : [requestLogPlugin]
  
});

  
const { url } = await startStandaloneServer(server, {
    listen: { port: 4001 },
  });
console.log(`🚀  Server ready at ${url}`);

