'use strict';
require('dotenv').config();
const mongoose = require('mongoose');

mongoose
	.connect(process.env.DB, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.catch(err => console.log(err));

mongoose.set('useFindAndModify', false);

const bookSchema = new mongoose.Schema(
	{
		title: {type: String, required: true},
		comments: [String],
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
			try {
				const books = await Book.find({}).exec();
				// console.log(books);
				const transformedBooks = books.map(book => ({
					_id: book['_id'],
					title: book.title,
					commentcount: book.comments.length,
				}));

				return res.json(transformedBooks);
			} catch (e) {
				return res.json({error: e + 'error retrieving books'});
			}

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
				// console.log(title, 'post book saved');

				return res.json(book);
			} catch (e) {
				return res.json('missing required field title');
			}
		})

		.delete(async function (req, res) {
			//if successful response will be 'complete delete successful'
			try {
				const deletedAll = await Book.deleteMany({}).exec();
				// console.log({deletedCount: deletedAll.deletedCount});
				return res.json('complete delete successful');
			} catch (e) {
				// console.log('could not delete all', e);
				return res.json('could not delete all');
			}
		});

	app
		.route('/api/books/:id')
		.get(async function (req, res) {
			let bookid = req.params.id;
			//json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}

			try {
				const book = await Book.findById(bookid).exec();
				// console.log(book, 'book findbyid');

				if (book) {
					// console.log(book, 'found and res');
					return res.json(book);
				} else {
					// console.log('no book exists - get', bookid);
					return res.json('no book exists');
				}
			} catch (e) {
				// console.log('no book exists -get ', bookid, e);
				return res.json('no book exists');
			}
		})

		.post(async function (req, res) {
			let bookid = req.params.id;
			let comment = req.body.comment;
			//json res format same as .get
			// console.log('----------', req.body, req.params);

			if (!comment) {
				// console.log('missing required field comment');
				return res.json('missing required field comment');
			}
			try {
				const updatedBook = await Book.findByIdAndUpdate(
					bookid,
					{$push: {comments: comment}},
					{new: true}
				);
				if (updatedBook) {
					// console.log({updatedBook});
					return res.json(updatedBook);
				} else {
					// console.log('no book exists - post', bookid);
					return res.json('no book exists');
				}
			} catch (e) {
				// console.log('no book exists - post', bookid, e);
				return res.json('no book exists');
			}
		})

		.delete(async function (req, res) {
			let bookid = req.params.id;
			//if successful response will be 'delete successful'
			// console.log('delete');

			if (!bookid) {
				// console.log('no book exists');
				return res.json('no book exists');
			}

			try {
				const deletedBook = await Book.findByIdAndDelete(bookid);
				// console.log(deletedBook, '------deleted');
				if (deletedBook) {
					return res.json('delete successful');
				} else {
					// console.log('no book exists');
					return res.json('no book exists');
				}
			} catch (e) {
				// console.log('no book exists', e);
				return res.json('no book exists');
			}
		});
};
