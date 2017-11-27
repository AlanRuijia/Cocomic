import express from 'express';

import { updateLike, addChapter } from '../controllers/chapter';
import { getBook, getPopularBooks, getNewestBooks, addBook, getUserFavorates, getUserCollections } from '../controllers/book';

const router = express.Router();

router.post('/like', updateLike);
router.post('/addBook', addBook);
router.post('/addChapter', addChapter);
router.get('/popular/:offset/:amount', getPopularBooks);
router.get('/newest/:offset/:amount', getNewestBooks);
router.get('/userCollections', getUserCollections);
router.get('/userFavorates', getUserFavorates);
router.get('/:bookId', getBook);

export default router;
