// queries.js

// 1. Import MongoDB client
const { MongoClient } = require('mongodb');

// 2. Connection URI & DB details
const uri = 'mongodb://localhost:27017';
const dbName = 'plp_bookstore';
const collectionName = 'books';

// 3. Async function wrapper
async function runQueries() {
  const client = new MongoClient(uri);

  try {
    // 4. Connect to MongoDB
    await client.connect();
    console.log("✅ Connected to MongoDB");

    // 5. Get collection
    const db = client.db(dbName);
    const books = db.collection(collectionName);

// 1. Find all books in a specific genre
const genre = "Fantasy"; 
const genreBooks = await books.find({ genre: genre }).toArray();
console.log(`\n📚 Books in genre "${genre}":`);
console.log(genreBooks);

// 2. Find books published after a certain year
const year = 1950;
const recentBooks = await books.find({ published_year: { $gt: year } }).toArray();
console.log(`\n📖 Books published after ${year}:`);
console.log(recentBooks);

// 3. Find books by a specific author
const author = "George Orwell";
const authorBooks = await books.find({ author: author }).toArray();
console.log(`\n✍️ Books by ${author}:`);
console.log(authorBooks);

// 4. Update the price of a specific book
const bookTitleToUpdate = "1984";
const newPrice = 15.99;

const updateResult = await books.updateOne(
  { title: bookTitleToUpdate },         // filter
  { $set: { price: newPrice } }         // update
);

console.log(`\n💰 Update Result:`, updateResult.modifiedCount, "document(s) updated");

const updatedBook = await books.findOne({ title: bookTitleToUpdate });
console.log("Updated book:", updatedBook);

// 5. Delete a book by its title
const bookTitleToDelete = "Moby Dick";

const deleteResult = await books.deleteOne({ title: bookTitleToDelete });
console.log(`\n🗑️ Delete Result:`, deleteResult.deletedCount, "document(s) deleted");

// Verify it's gone
const deletedBook = await books.findOne({ title: bookTitleToDelete });
console.log("Check if deleted:", deletedBook);

// 6. Find books that are both in stock and published after 2010
const advancedBooks = await books.find({
  in_stock: true,
  published_year: { $gt: 2010 }
}).toArray();

console.log("\n📘 Books in stock & published after 2010:");
console.log(advancedBooks);
// 7. Projection: return only title, author, and price
const projectionBooks = await books.find(
  {}, //  (all books)
  { projection: { title: 1, author: 1, price: 1, _id: 0 } }
).toArray();

console.log("\n📝 Books with only title, author, and price:");
console.log(projectionBooks);

// 8. Sort books by price ascending
const ascBooks = await books.find({}).sort({ price: 1 }).toArray();
console.log("\n⬆️ Books sorted by price (ascending):");
console.log(ascBooks);

// 8b. Sort books by price descending
const descBooks = await books.find({}).sort({ price: -1 }).toArray();
console.log("\n⬇️ Books sorted by price (descending):");
console.log(descBooks);
// 9. Pagination: 5 books per page
const page = 1; // change this to 2, 3... for other pages
const pageSize = 5;

const paginatedBooks = await books.find({})
  .sort({ title: 1 })        // sort for consistent results
  .skip((page - 1) * pageSize)
  .limit(pageSize)
  .toArray();

console.log(`\n📑 Page ${page} (5 books per page):`);
console.log(paginatedBooks);
// 10. Aggregation: Average price of books by genre
const avgPriceByGenre = await books.aggregate([
  { $group: { _id: "$genre", avgPrice: { $avg: "$price" } } },
  { $sort: { avgPrice: -1 } } // (highestfirst)
]).toArray();

console.log("\n📊 Average price of books by genre:");
console.log(avgPriceByGenre);

// 11. Aggregation: Author with the most books
const topAuthor = await books.aggregate([
  { $group: { _id: "$author", totalBooks: { $sum: 1 } } },
  { $sort: { totalBooks: -1 } },
  { $limit: 1 } // only the top author
]).toArray();

console.log("\n👑 Author with the most books:");
console.log(topAuthor);

// 12. Aggregation: Group books by publication decade
const booksByDecade = await books.aggregate([
  {
    $project: {
      decade: { $multiply: [{ $floor: { $divide: ["$published_year", 10] } }, 10] },
      title: 1
    }
  },
  {
    $group: {
      _id: "$decade",
      totalBooks: { $sum: 1 },
      titles: { $push: "$title" }
    }
  },
  { $sort: { _id: 1 } } // sort by decade ascending
]).toArray();

console.log("\n📅 Books grouped by publication decade:");
console.log(booksByDecade);
// 13. Create an index on the title field
await books.createIndex({ title: 1 });
console.log("\n📑 Index created on title field");
// 14. Create a compound index on author and published_year
await books.createIndex({ author: 1, published_year: -1 });
console.log("\n📑 Compound index created on author + published_year");
// 15. Use explain() to see performance before/after indexing
const explainQuery = await books.find({ title: "1984" }).explain("executionStats");
console.log("\n⚡ Explain plan for query on title:");
console.log(JSON.stringify(explainQuery.executionStats, null, 2));










  } catch (err) {
    console.error("❌ Error:", err);
  } finally {
    // 6. Always close connection
    await client.close();
    console.log("🔒 Connection closed");
  }
}

// Run the function
runQueries().catch(console.error);
