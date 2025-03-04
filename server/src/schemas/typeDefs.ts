const typeDefs = `
    type User {
        _id: ID
        username: String
        email: String
        password: String
        savedGames: [RentalGame]
        gameCount: Int
    }

    type Game {
        _id: ID
        publisher: String
        released: String
        description: String
        image: String
        title: String
        available: Boolean
    }

    type RawgGame {
        publisher: String
        released: String
        description: String
        image: String
        title: String
    }

    type RentalGame {
        _id: Game
        returnDate: String
    }
    
    type RawgResults {
        slug: String
        name: String
    }

    type Auth {
        token: ID!
        user: User
    }

    type Query {
        me: User
        gameSwapLibrary: [Game]
        searchBar(title: String!): [Game]
    }

    type Mutation {
        loginUser(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveGame(_id: ID!): [RentalGame]
        removeGame(_id: ID!): [RentalGame]
        rawgGamesByName(title: String!): [RawgResults]
        rawgGameInfoSlug(rawgSlug: String!): RawgGame
    }
`;

export default typeDefs;