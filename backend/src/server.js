/* eslint-disable new-cap */
require('dotenv').config();

const http = require('http');
const express = require('express');
const cors = require('cors');
const {ApolloServer} = require('apollo-server-express');

const {ApolloServerPluginDrainHttpServer} = require('apollo-server-core');
const {makeExecutableSchema} = require('@graphql-tools/schema');
const {WebSocketServer} = require('ws');
const {useServer} = require('graphql-ws/lib/use/ws');

const {RedisPubSub} = require('graphql-redis-subscriptions');
const Redis = require('ioredis');

const mongoose = require('mongoose');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const port = process.env.SERVER_PORT;
const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASSWORD;
const dbName = process.env.DB_NAME;
const dbURI = `mongodb+srv://${dbUsername}:${dbPassword}@paymates.873s7.mongodb.net/${dbName}?retryWrites=true&w=majority`;

const schema = makeExecutableSchema({typeDefs, resolvers});

const app = express();
app.use(cors());
const httpServer = http.createServer(app);

const wsServer = new WebSocketServer({
  server: httpServer,
  path: '/graphql',
});

// https://djaytechdiary.com/graphql-subscriptions-with-redis-pubsub
const options = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? process.env.REDIS_PORT : '6379',
  retryStrategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000);
  },
};

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
});

const serverCleanup = useServer({schema, context: () => {
  return {pubsub};
}}, wsServer);


const server = new ApolloServer({
  schema,
  context: ({req}) => ({req, pubsub}),
  cors: cors(),
  plugins: [
    ApolloServerPluginDrainHttpServer({httpServer}),
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});


server.start().then(() => {
  server.applyMiddleware({app});

  mongoose.connect(dbURI).then(() => {
    console.log('Connected to MongoDB');
    return httpServer.listen(port);
  }).then((res) => {
    console.log(`Server running at http://localhost:${port}${server.graphqlPath}`);
  }).catch((err) => console.log(err));
});
