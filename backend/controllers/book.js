import db from '../db';
import { uploadImages } from './image';

export const getBook = async (req, res) => {
  try {
    const { bookId } = req.params;
    const bookQuery = `
    SELECT id, user_id as "userId", title, cover_image as "coverImage", description, root_chapter_id as "rootChapterId"
    FROM book WHERE id=($1)
    `;
    const { rows: books } = await db.query(bookQuery, [bookId]);
    if (books === undefined || books.length === 0) Error();

    const chapterQuery = `
    SELECT id, title, user_id as "userId", book_id as "bookId", parent_id as "parentId",
    like_sum as "likeSum", images, create_date as "createDate", title, description
    FROM chapter WHERE book_id=($1)
    `;
    const { rows: chapters } = await db.query(chapterQuery, [bookId]);
    res.json({ books, chapters });
  } catch (e) {
    res.status(404).json({ message: 'book not found' });
  }
};

const getBooks = async (req, res, query) => {
  try {
    const { offset, amount } = req.params;
    const { rows: books } = await db.query(query, [amount, offset]);
    if (books === undefined || books.length === 0) Error();

    res.json({ books });
  } catch (e) {
    res.status(404).json({ message: 'book not found' });
  }
};

export const getPopularBooks = async (req, res) => {
  const query = `
  SELECT id, title, cover_image as "coverImage", description, like_sum, user_id
  FROM book ORDER BY like_sum LIMIT $1 Offset $2
  `;
  getBooks(req, res, query);
};

export const addBook = async (req, res) => {
  // note: we don't try/catch this because if connecting throws an exception
  // we don't need to dispose of the client (it will be undefined)
  const client = await db.pool.connect();
  try {
    const {
      bookTitle,
      coverImage,
      description,
      chapters,
    } = req.body;
    const { uid: userId } = req.session;
    const chapterImagesList = [];
    for (let i = 0; i < chapters.length(); i += 1) {
      chapterImagesList.push(uploadImages(chapters[i].images));
    }

    await client.query('BEGIN');
    // Insert book
    const bookQuery = `
    INSERT INTO book(user_id, title, cover_image, description)
    VALUES ($1, $2, $3, $4) RETURNING id
    `;
    const bookQueryValues = [userId, bookTitle, coverImage, description];
    const { id: bookId } = await client.query(bookQuery, bookQueryValues);
    // Insert chapter
    const chapterIds = [0];
    const chapterQuery = `
    INSERT INTO chapter(user_id, book_id, title, description, parent_id, images)
    VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
    `;
    for (let i = 0; i < chapters.length(); i += 1) {
      const chapterQueryValues = [userId, bookId, chapters[i].title, chapters[i].description, chapterIds.slice(-1), chapterImagesList[i]];
      const { id: chapterId } = await client.query(chapterQuery, chapterQueryValues); // eslint-disable-line no-await-in-loop
      chapterIds.push(chapterId);
    }
    // Update book root_chapter_id info
    const updateQuery = `
    UPDATE book
    SET root_chapter_id = $1
    WHERE id=($2)`;
    const updateQueryValues = [chapterIds[1], bookId];
    await client.query(updateQuery, updateQueryValues);
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: e.message });
  } finally {
    client.release();
  }
};
