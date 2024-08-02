import Transaction from "../models/transaction.model.js";

const transactionResolver = {
  Query: {
    transactions: async (_, __, context) => {
      try {
        if (!context.getUser()) throw new Error("Unauthorized");

        const userId = await context.getUser()._id;
        const transactions = await Transaction.find({ userId });

        return transactions;
      } catch (err) {
        console.error(`Error in Transactions: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
    transaction: async (_, { transactionId }, context) => {
      try {
        const transaction = await Transaction.find({ transactionId });
        return transaction;
      } catch (err) {
        console.error(`Error in Transaction: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
  },
  Mutation: {
    createTransaction: async (_, { input }, context) => {
      try {
        const newTransaction = await Transaction({
          ...input,
          userId: context.getUser()._id,
        });

        newTransaction.save();
        return newTransaction;
      } catch (err) {
        console.error(`Error in Create Transaction: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },

    updateTransaction: async (_, { input }) => {
      try {
        const updatedTransaction = await Transaction.findByIdAndUpdate(
          input.transactionId,
          input,
          { new: true }
        );
        return updatedTransaction;
      } catch (err) {
        console.error(`Error in Update Transaction: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
    deleteTransaction: async (_, { transactionId }) => {
      try {
        const deletedTransaction = await Transaction.findByIdAndDelete(
          transactionId
        );
        return deletedTransaction;
      } catch (err) {
        console.error(`Error in Delete Transaction: ${err.message}`);
        throw new Error(err.message || "Internal Server Error");
      }
    },
  },
};

export default transactionResolver;
