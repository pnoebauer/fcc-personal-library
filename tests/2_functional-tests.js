/*
 *
 *
 *       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
 *       -----[Keep the tests in the same order!]-----
 *
 */

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let _id = '';

suite('Functional Tests', function () {
	/*
	 * ----[EXAMPLE TEST]----
	 * Each test should completely test the response of the API end-point including response status code!
	 */
	test('#example Test GET /api/books', function (done) {
		chai
			.request(server)
			.get('/api/books')
			.end(function (err, res) {
				assert.equal(res.status, 200);
				assert.isArray(res.body, 'response should be an array');
				assert.property(
					res.body[0],
					'commentcount',
					'Books in array should contain commentcount'
				);
				assert.property(res.body[0], 'title', 'Books in array should contain title');
				assert.property(res.body[0], '_id', 'Books in array should contain _id');
				done();
			});
	});
	/*
	 * ----[END of EXAMPLE TEST]----
	 */

	suite('Routing tests', function () {
		suite(
			'POST /api/books with title => create book object/expect book object',
			function () {
				test('Test POST /api/books with title', function (done) {
					chai
						.request(server)
						.post('/api/books')
						.send({
							title: 'Test Title',
						})
						.end((err, res) => {
							_id = res.body['_id'];
							assert.equal(res.status, 200);
							assert.isObject(res.body, 'post response should be an object of the book');
							assert.property(res.body, '_id', 'Books object should contain the _id');
							assert.property(res.body, 'title', 'Books object should contain the title');
							assert.equal(res.body.title, 'Test Title');
							done();
						});
				});

				test('Test POST /api/books with no title given', function (done) {
					chai
						.request(server)
						.post('/api/books')
						.end((err, res) => {
							assert.equal(res.body, 'missing required field title');
							done();
						});
				});
			}
		);

		suite('GET /api/books => array of books', function () {
			test('Test GET /api/books', function (done) {
				chai
					.request(server)
					.get('/api/books')
					.end((err, res) => {
						assert.equal(res.status, 200);
						assert.isArray(res.body, 'body is an array');
						assert.isObject(res.body[0], 'body contains an object');
						assert.property(
							res.body[0],
							'commentcount',
							'Books in array should contain commentcount'
						);
						assert.property(res.body[0], 'title', 'Books in array should contain title');
						assert.property(res.body[0], '_id', 'Books in array should contain _id');
						done();
					});
			});
		});

		suite('GET /api/books/[id] => book object with [id]', function () {
			test('Test GET /api/books/[id] with id not in db', function (done) {
				chai
					.request(server)
					.get(`/api/books/${'999993ba42474d09702d7fcf'}`)
					.end((err, res) => {
						// console.log('---------', res.body);
						assert.equal(res.body, 'no book exists');
						done();
					});
			});

			test('Test GET /api/books/[id] with valid id in db', function (done) {
				chai
					.request(server)
					.get(`/api/books/${_id}`)
					.end((err, res) => {
						// console.log('---------', res.body);
						assert.equal(res.status, 200);
						assert.isObject(res.body, 'get response should be an object of the book');
						assert.property(res.body, '_id', 'Books object should contain the _id');
						assert.property(res.body, 'title', 'Books object should contain the title');
						// assert.equal(res.body.title, 'Test Title');
						done();
					});
			});
		});

		suite('POST /api/books/[id] => add comment/expect book object with id', function () {
			test('Test POST /api/books/[id] with comment', function (done) {
				chai
					.request(server)
					.post(`/api/books/${_id}`)
					.send({
						comment: 'Test Comment',
					})
					.end((err, res) => {
						assert.equal(res.status, 200);
						assert.isObject(res.body, 'post response should be an object of the book');
						assert.property(res.body, '_id', 'Books object should contain the _id');
						assert.property(res.body, 'title', 'Books object should contain the title');
						assert.isArray(res.body.comments, 'the comments field should be an array');
						done();
					});
			});

			test('Test POST /api/books/[id] without comment field', function (done) {
				chai
					.request(server)
					.post(`/api/books/${_id}`)
					.end((err, res) => {
						assert.equal(res.body, 'missing required field comment');
						done();
					});
			});

			test('Test POST /api/books/[id] with comment, id not in db', function (done) {
				chai
					.request(server)
					.post(`/api/books/${'999993ba42474d09702d7fcf'}`)
					.send({
						comment: 'Test Comment',
					})
					.end((err, res) => {
						assert.equal(res.body, 'no book exists');
						done();
					});
			});
		});

		suite('DELETE /api/books/[id] => delete book object id', function () {
			test('Test DELETE /api/books/[id] with valid id in db', function (done) {
				chai
					.request(server)
					.delete(`/api/books/${_id}`)
					.end((err, res) => {
						assert.equal(res.body, 'delete successful');
						done();
					});
			});

			test('Test DELETE /api/books/[id] with id not in db', function (done) {
				chai
					.request(server)
					.delete(`/api/books/${'999993ba42474d09702d7fcf'}`)
					.end((err, res) => {
						assert.equal(res.body, 'no book exists');
						done();
					});
			});
		});
	});
});
