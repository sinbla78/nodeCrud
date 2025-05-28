import express from "express";
import { ObjectId } from "mongodb";
import { Concert } from "../models/concert";

/**
 * @swagger
 * /concert:
 *   post:
 *     summary: 콘서트 정보 업로드 (S3 링크 포함)
 *     description: 프론트엔드에서 S3에 업로드한 이미지 URL과 함께 콘서트 정보를 MongoDB에 저장합니다. UID에서 timestamp를 추출하여 ObjectId로 변환합니다.
 *     tags: [Concerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - uid
 *               - title
 *               - artist
 *               - venue
 *               - date
 *             properties:
 *               uid:
 *                 type: string
 *                 description: 사용자 지정 ID (timestamp 포함)
 *                 example: concert_1703123456789_abc123
 *               title:
 *                 type: string
 *                 description: 콘서트 제목
 *                 example: 아이유 콘서트 2024
 *               artist:
 *                 type: string
 *                 description: 아티스트명
 *                 example: 아이유
 *               venue:
 *                 type: string
 *                 description: 공연장
 *                 example: 올림픽공원 체조경기장
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 공연 날짜
 *                 example: 2024-06-15
 *               time:
 *                 type: string
 *                 description: 공연 시간 (HH:MM 형식)
 *                 example: "19:00"
 *               price:
 *                 type: number
 *                 description: 티켓 가격 (원)
 *                 example: 150000
 *               description:
 *                 type: string
 *                 description: 콘서트 설명
 *                 example: 아이유의 특별한 콘서트
 *               category:
 *                 type: string
 *                 enum: [pop, rock, jazz, classical, hiphop, electronic, indie, folk, r&b, country, musical, opera, other]
 *                 description: 음악 카테고리
 *                 example: pop
 *               ticketLink:
 *                 type: string
 *                 format: uri
 *                 description: 티켓 구매 링크
 *                 example: https://ticket.interpark.com/example
 *               posterImage:
 *                 type: string
 *                 format: uri
 *                 description: S3에 업로드된 포스터 이미지 URL
 *                 example: https://your-bucket.s3.amazonaws.com/concerts/poster.jpg
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: S3에 업로드된 갤러리 이미지 URL 배열
 *                 example: ["https://your-bucket.s3.amazonaws.com/concerts/gallery1.jpg", "https://your-bucket.s3.amazonaws.com/concerts/gallery2.jpg"]
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 콘서트 태그
 *                 example: ["발라드", "K-POP", "솔로"]
 *     responses:
 *       201:
 *         description: 콘서트 업로드 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트 정보 업로드 성공
 *                 concert:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: MongoDB ObjectId
 *                     uid:
 *                       type: string
 *                       description: 사용자 지정 ID
 *                     title:
 *                       type: string
 *                     artist:
 *                       type: string
 *                     venue:
 *                       type: string
 *                     date:
 *                       type: string
 *                       format: date
 *                     posterImage:
 *                       type: string
 *                     galleryImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                 imageInfo:
 *                   type: object
 *                   properties:
 *                     posterImageProvided:
 *                       type: boolean
 *                     galleryImagesCount:
 *                       type: number
 *       400:
 *         description: 잘못된 요청 데이터
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 필수 필드가 누락되었습니다. (uid, title, artist, venue, date)
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 서버 에러로 콘서트 업로드 실패
 *                 error:
 *                   type: string
 */
export const uploadConcert = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const {
      uid, // timestamp가 포함된 사용자 지정 ID
      title,
      artist,
      venue,
      date,
      time,
      price,
      description,
      category,
      ticketLink,
      posterImage, // 프론트엔드에서 S3에 업로드한 포스터 이미지 URL
      galleryImages, // 프론트엔드에서 S3에 업로드한 갤러리 이미지 URL 배열
      tags,
    } = req.body;

    // 필수 필드 검증
    if (!uid || !title || !artist || !venue || !date) {
      res.status(400).json({
        message:
          "필수 필드가 누락되었습니다. (uid, title, artist, venue, date)",
      });
      return;
    }

    // uid 중복 확인
    const existingConcert = await Concert.findOne({ uid });
    if (existingConcert) {
      res.status(400).json({ message: "이미 존재하는 콘서트 UID입니다." });
      return;
    }

    // 이미지 URL 유효성 검증 (선택사항)
    if (posterImage && !isValidImageUrl(posterImage)) {
      res
        .status(400)
        .json({ message: "올바르지 않은 포스터 이미지 URL입니다." });
      return;
    }

    if (galleryImages && galleryImages.length > 0) {
      for (const imageUrl of galleryImages) {
        if (!isValidImageUrl(imageUrl)) {
          res
            .status(400)
            .json({ message: "올바르지 않은 갤러리 이미지 URL입니다." });
          return;
        }
      }
    }

    // uid에서 timestamp 추출하여 ObjectId 생성
    let mongoId: ObjectId;
    try {
      // uid에서 timestamp 부분 추출 (예: "concert_1703123456789_abc" -> "1703123456789")
      const timestampMatch = uid.match(/(\d{13})/); // 13자리 timestamp 찾기
      if (timestampMatch) {
        const timestamp = parseInt(timestampMatch[1]);
        const timestampInSeconds = Math.floor(timestamp / 1000);
        mongoId = new ObjectId(timestampInSeconds);
      } else {
        // timestamp를 찾을 수 없으면 새로운 ObjectId 생성
        mongoId = new ObjectId();
        console.warn(
          `UID에서 timestamp를 찾을 수 없음: ${uid}, 새로운 ObjectId 생성: ${mongoId}`
        );
      }
    } catch (error) {
      // 변환 실패 시 새로운 ObjectId 생성
      mongoId = new ObjectId();
      console.warn(
        `UID를 ObjectId로 변환 실패: ${uid}, 새로운 ObjectId 생성: ${mongoId}`
      );
    }

    // MongoDB ObjectId 중복 확인 (추가 안전장치)
    const existingById = await Concert.findById(mongoId);
    if (existingById) {
      mongoId = new ObjectId(); // 중복 시 새로운 ObjectId 생성
      console.warn(`ObjectId 충돌 발생, 새로운 ObjectId 생성: ${mongoId}`);
    }

    // 콘서트 정보 생성
    const newConcert = new Concert({
      _id: mongoId, // timestamp 기반 ObjectId 사용
      uid: uid,
      title,
      artist,
      venue,
      date: new Date(date),
      time,
      price: price ? parseInt(price) : null,
      description,
      category,
      ticketLink,
      posterImage: posterImage || "",
      galleryImages: galleryImages || [],
      tags: tags || [],
      status: "upcoming",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // MongoDB에 저장
    await newConcert.save();

    console.log(
      `콘서트 정보 저장 완료: ${title} (UID: ${uid}, ObjectId: ${mongoId})`
    );

    res.status(201).json({
      message: "콘서트 정보 업로드 성공",
      concert: {
        id: mongoId,
        uid: uid,
        title,
        artist,
        venue,
        date,
        time,
        price,
        posterImage,
        galleryImages,
        createdAt: newConcert.createdAt,
      },
      imageInfo: {
        posterImageProvided: !!posterImage,
        galleryImagesCount: galleryImages ? galleryImages.length : 0,
      },
    });
  } catch (error) {
    console.error("콘서트 업로드 에러:", error);
    res.status(500).json({
      message: "서버 에러로 콘서트 업로드 실패",
      error: error instanceof Error ? error.message : "알 수 없는 에러",
    });
  }
};

// 이미지 URL 유효성 검증 함수
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // S3 URL 패턴 검증
  const s3UrlPattern =
    /^https:\/\/[\w.-]+\.s3\.[\w.-]+\.amazonaws\.com\/.*\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;
  const generalUrlPattern = /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i;

  return s3UrlPattern.test(url) || generalUrlPattern.test(url);
};

/**
 * @swagger
 * /concert/{id}:
 *   get:
 *     summary: 특정 콘서트 정보 조회
 *     description: ObjectId 또는 UID로 특정 콘서트의 상세 정보를 조회합니다.
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 콘서트 ObjectId 또는 UID
 *         example: concert_1703123456789_abc123
 *     responses:
 *       200:
 *         description: 콘서트 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트 정보 조회 성공
 *                 concert:
 *                   $ref: '#/components/schemas/Concert'
 *       404:
 *         description: 콘서트를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 */
export const getConcert = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    let concert;
    // ObjectId 형식인지 확인
    if (ObjectId.isValid(id)) {
      concert = await Concert.findById(id);
    } else {
      // uid로 검색
      concert = await Concert.findOne({ uid: id });
    }

    if (!concert) {
      res.status(404).json({ message: "콘서트를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      message: "콘서트 정보 조회 성공",
      concert,
    });
  } catch (error) {
    console.error("콘서트 조회 에러:", error);
    res.status(500).json({ message: "콘서트 조회 실패" });
  }
};

/**
 * @swagger
 * /concert:
 *   get:
 *     summary: 콘서트 목록 조회 (페이지네이션, 필터링 지원)
 *     description: 모든 콘서트 목록을 페이지네이션과 필터링을 통해 조회합니다.
 *     tags: [Concerts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 페이지 번호
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 페이지당 항목 수
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [pop, rock, jazz, classical, hiphop, electronic, indie, folk, r&b, country, musical, opera, other]
 *         description: 음악 카테고리 필터
 *       - in: query
 *         name: artist
 *         schema:
 *           type: string
 *         description: 아티스트명 필터 (부분 검색)
 *         example: 아이유
 *       - in: query
 *         name: venue
 *         schema:
 *           type: string
 *         description: 공연장 필터 (부분 검색)
 *         example: 올림픽공원
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [upcoming, ongoing, completed, cancelled]
 *         description: 콘서트 상태 필터
 *     responses:
 *       200:
 *         description: 콘서트 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트 목록 조회 성공
 *                 concerts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Concert'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalConcerts:
 *                       type: integer
 *                       example: 95
 *                     limit:
 *                       type: integer
 *                       example: 20
 *                 filters:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     artist:
 *                       type: string
 *                     venue:
 *                       type: string
 *                     status:
 *                       type: string
 *       500:
 *         description: 서버 에러
 */
export const getAllConcerts = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { page = 1, limit = 20, category, artist, venue, status } = req.query;

    // 필터 조건 구성
    const filter: any = {};
    if (category) filter.category = category;
    if (artist) filter.artist = new RegExp(artist as string, "i");
    if (venue) filter.venue = new RegExp(venue as string, "i");
    if (status) filter.status = status;

    const concerts = await Concert.find(filter)
      .sort({ date: 1, createdAt: -1 })
      .limit(parseInt(limit as string))
      .skip((parseInt(page as string) - 1) * parseInt(limit as string));

    const totalConcerts = await Concert.countDocuments(filter);
    const totalPages = Math.ceil(totalConcerts / parseInt(limit as string));

    res.status(200).json({
      message: "콘서트 목록 조회 성공",
      concerts,
      pagination: {
        currentPage: parseInt(page as string),
        totalPages,
        totalConcerts,
        limit: parseInt(limit as string),
      },
      filters: { category, artist, venue, status },
    });
  } catch (error) {
    console.error("콘서트 목록 조회 에러:", error);
    res.status(500).json({ message: "콘서트 목록 조회 실패" });
  }
};

/**
 * @swagger
 * /concert/{id}:
 *   put:
 *     summary: 콘서트 정보 수정
 *     description: ObjectId 또는 UID로 특정 콘서트의 정보를 수정합니다. UID는 수정할 수 없습니다.
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 콘서트 ObjectId 또는 UID
 *         example: concert_1703123456789_abc123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 콘서트 제목
 *                 example: 아이유 콘서트 2024 (수정됨)
 *               artist:
 *                 type: string
 *                 description: 아티스트명
 *                 example: 아이유
 *               venue:
 *                 type: string
 *                 description: 공연장
 *                 example: 잠실 올림픽주경기장
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 공연 날짜
 *                 example: 2024-07-15
 *               time:
 *                 type: string
 *                 description: 공연 시간
 *                 example: "20:00"
 *               price:
 *                 type: number
 *                 description: 티켓 가격
 *                 example: 180000
 *               description:
 *                 type: string
 *                 description: 콘서트 설명
 *               category:
 *                 type: string
 *                 enum: [pop, rock, jazz, classical, hiphop, electronic, indie, folk, r&b, country, musical, opera, other]
 *                 description: 음악 카테고리
 *               ticketLink:
 *                 type: string
 *                 format: uri
 *                 description: 티켓 구매 링크
 *               posterImage:
 *                 type: string
 *                 format: uri
 *                 description: S3 포스터 이미지 URL
 *               galleryImages:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: S3 갤러리 이미지 URL 배열
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 콘서트 태그
 *               status:
 *                 type: string
 *                 enum: [upcoming, ongoing, completed, cancelled]
 *                 description: 콘서트 상태
 *     responses:
 *       200:
 *         description: 콘서트 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트 정보 수정 성공
 *                 concert:
 *                   $ref: '#/components/schemas/Concert'
 *       404:
 *         description: 콘서트를 찾을 수 없음
 *       500:
 *         description: 서버 에러
 */
export const updateConcert = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // uid 수정 방지
    if (updateData.uid) {
      delete updateData.uid;
    }

    updateData.updatedAt = new Date();

    let concert;
    if (ObjectId.isValid(id)) {
      concert = await Concert.findByIdAndUpdate(id, updateData, { new: true });
    } else {
      concert = await Concert.findOneAndUpdate({ uid: id }, updateData, {
        new: true,
      });
    }

    if (!concert) {
      res.status(404).json({ message: "콘서트를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      message: "콘서트 정보 수정 성공",
      concert,
    });
  } catch (error) {
    console.error("콘서트 수정 에러:", error);
    res.status(500).json({ message: "콘서트 수정 실패" });
  }
};

/**
 * @swagger
 * /concert/{id}:
 *   delete:
 *     summary: 콘서트 삭제
 *     description: ObjectId 또는 UID로 특정 콘서트를 삭제합니다.
 *     tags: [Concerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 콘서트 ObjectId 또는 UID
 *         example: concert_1703123456789_abc123
 *     responses:
 *       200:
 *         description: 콘서트 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트 삭제 성공
 *                 deletedConcert:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       description: MongoDB ObjectId
 *                     uid:
 *                       type: string
 *                       description: 사용자 지정 ID
 *                     title:
 *                       type: string
 *                       description: 콘서트 제목
 *       404:
 *         description: 콘서트를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 콘서트를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 */
export const deleteConcert = async (
  req: express.Request,
  res: express.Response
) => {
  try {
    const { id } = req.params;

    let concert;
    if (ObjectId.isValid(id)) {
      concert = await Concert.findByIdAndDelete(id);
    } else {
      concert = await Concert.findOneAndDelete({ uid: id });
    }

    if (!concert) {
      res.status(404).json({ message: "콘서트를 찾을 수 없습니다." });
      return;
    }

    res.status(200).json({
      message: "콘서트 삭제 성공",
      deletedConcert: {
        id: concert._id,
        uid: concert.uid,
        title: concert.title,
      },
    });
  } catch (error) {
    console.error("콘서트 삭제 에러:", error);
    res.status(500).json({ message: "콘서트 삭제 실패" });
  }
};
