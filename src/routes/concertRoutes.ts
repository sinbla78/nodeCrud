import express from 'express';
import { 
  uploadConcert,
  getConcert,
  getAllConcerts,
  updateConcert,
  deleteConcert
} from '../controllers/concertController';

const router = express.Router();

// 콘서트 업로드 (S3 링크 포함)
// POST /api/concerts
router.post('/', uploadConcert);

// 콘서트 정보 수정
// PATCH /api/concerts/:id
router.patch('/:id', updateConcert);

// 콘서트 삭제
// DELETE /api/concerts/:id
router.delete('/:id', deleteConcert);

// 특정 콘서트 조회 (ID 또는 UID로)
// GET /api/concerts/:id
router.get('/:id', getConcert);

// 모든 콘서트 목록 조회 (페이지네이션, 필터링 지원)
// GET /api/concerts?page=1&limit=20&category=pop&artist=아이유
router.get('/', getAllConcerts);

export default router;