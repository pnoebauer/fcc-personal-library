'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// mongoose.set('useFindAndModify', false);

const bookSchema = new mongoose.Schema(
	{
		title: {type: String, required: true},
		comment: [String],
		// createdAt: {type: Date, default: Date.now, transform: v => v.toDateString()},
		// updatedAt: {type: Date, default: Date.now, transform: v => v.toDateString()},
	},
	{versionKey: false}
	// {
	// 	timestamps: {
	// 		createdAt: 'created_on',
	// 		updatedAt: 'updated_on',
	// 	},
	// }
);

const Book = mongoose.model('Book', bookSchema);
// Book.deleteMany({}, () => console.log('deleted all'));

module.exports = function (app) {
	app
		.route('/api/books')
		.get(async function (req, res) {
			//response will be array of book objects
			//json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
			const books = await Book.find({}).exec();
			console.log(books);
			const transformedBooks = books.map(book => ({
				_id: book['_id'],
				title: book.title,
				commentcount: book.comment.length,
			}));

			res.json(transformedBooks);

			// const booksAgg = await Book.aggregate([
			// 	{$group: {_id: '$title', commentcount: {$sum: 1}}},
			// ]);
			// console.log(booksAgg, booksAgg.length, booksAgg[0]);
		})

		.post(async function (req, res) {
			const title = req.body.title;
			//response will contain new book object including at least _id and title
			// console.log(title);

			try {
				const book = await new Book({title}).save();

				return res.json(book);
			} catch (e) {
				return res.json('missing required field title');
			}
		})

		.delete(function (req, res) {
			//if successful response will be 'complete delete successful'
		});

	app
		.route('/api/books/:id')
		.get(function (req, res) {
			let bookid = req.params.id;
			//json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
		})

		.post(function (req, res) {
			let bookid = req.params.id;
			let comment = req.body.comment;
			//json res format same as .get
			console.log(req.body, req.params, req.query);
		})

		.delete(function (req, res) {
			let bookid = req.params.id;
			//if successful response will be 'delete successful'
		});
};
