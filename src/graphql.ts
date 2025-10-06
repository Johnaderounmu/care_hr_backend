import { ApolloServer } from 'apollo-server-express';
import { Application } from 'express';
import { gql } from 'apollo-server-core';
import jwt from 'jsonwebtoken';

const jwtSecret = process.env.JWT_SECRET || 'dev-secret';

export async function startGraphQL(app: Application) {
  const typeDefs = gql`
    type Job { id: ID!, title: String }
    type Document { id: ID!, filename: String }
    type Query { jobs: [Job], documents: [Document] }
    type Mutation { noop: Boolean }
  `;

  const resolvers = {
    Query: {
      users: () => {
        // a real impl would query DB; we expose user from context
        return [];
      },
      documents: () => [],
    },
    Mutation: {
      noop: () => true,
    },
  };

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }: { req: any }) => {
      const auth = req.headers?.authorization || '';
      const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
      if (token) {
        try {
          const payload = jwt.verify(token, jwtSecret);
          return { user: payload };
        } catch {
          return { user: null };
        }
      }
      return { user: null };
    },
  } as any);

  await server.start();
  // Cast to any to avoid mismatched @types/express versions between packages
  server.applyMiddleware({ app: app as any, path: '/graphql' });
}
