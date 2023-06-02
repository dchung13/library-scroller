const { User, Book } = require('../models');

const resolvers = {
    Query: {
        user: async () => {
            return User.find();
        },
        books: async (parent, { _id }) => {
            const params = _id ? { _id } : {};
            return Book.find(params);
        },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }
            return user;
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            return user;
        },
        saveBook: async (parent, { ...bookData }, context) => {
            const book = await Book.create(...bookData);
            const user = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: book } },
                { new: true }
            );
            return user;
        },
        removeBook: async (parent, { bookId }, context) => {
            const book = await Book.findOne({ bookId });
            const user = await User.findOneAndUpdate(
                { _id: context.user._id },
                {$pull: { savedBooks: book }},
                { new: true }
            );
            return user;
        },
    },
};

module.exports = resolvers;