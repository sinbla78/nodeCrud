import mongoose, { Document, Schema } from "mongoose";

export interface IConcert extends Document {
  _id: mongoose.Types.ObjectId;
  uid: string; // 사용자 지정 ID (timestamp 포함)
  title: string;
  artist: string;
  venue: string;
  date: Date;
  time?: string;
  price?: number;
  description?: string;
  category?: string;
  ticketLink?: string;
  posterImage?: string; // S3 URL
  galleryImages: string[]; // S3 URLs 배열
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ConcertSchema = new Schema<IConcert>(
  {
    _id: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    uid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    artist: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      index: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    time: {
      type: String,
      trim: true,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // HH:MM 형식 검증
    },
    price: {
      type: Number,
      min: 0,
      max: 10000000, // 천만원 제한
    },
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },
    category: {
      type: String,
      trim: true,
      enum: [
        "pop",
        "rock",
        "jazz",
        "classical",
        "hiphop",
        "electronic",
        "indie",
        "folk",
        "r&b",
        "country",
        "musical",
        "opera",
        "other",
      ],
      default: "other",
      index: true,
    },
    ticketLink: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: "올바른 URL 형식이 아닙니다.",
      },
    },
    posterImage: {
      type: String,
      trim: true,
      validate: {
        validator: function (v: string) {
          return (
            !v || /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(v)
          );
        },
        message: "올바른 이미지 URL 형식이 아닙니다.",
      },
    },
    galleryImages: [
      {
        type: String,
        trim: true,
        validate: {
          validator: function (v: string) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i.test(v);
          },
          message: "올바른 이미지 URL 형식이 아닙니다.",
        },
      },
    ],
    status: {
      type: String,
      enum: ["upcoming", "ongoing", "completed", "cancelled"],
      default: "upcoming",
      index: true,
    },
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 30,
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt 자동 관리
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// 인덱스 설정
ConcertSchema.index({ date: 1, artist: 1 });
ConcertSchema.index({ venue: 1, date: 1 });
ConcertSchema.index({ category: 1, date: 1 });
ConcertSchema.index({ status: 1, date: 1 });
ConcertSchema.index({
  title: "text",
  artist: "text",
  venue: "text",
  description: "text",
}); // 텍스트 검색용

// Virtual 필드 - 콘서트 상태 자동 업데이트
ConcertSchema.virtual("isUpcoming").get(function () {
  return this.date > new Date();
});

ConcertSchema.virtual("isPast").get(function () {
  return this.date < new Date();
});

// 미들웨어 - 저장 전 상태 자동 업데이트
ConcertSchema.pre("save", function (next) {
  this.updatedAt = new Date();

  // 날짜 기반 상태 자동 업데이트
  if (this.status === "upcoming" || this.status === "ongoing") {
    const now = new Date();
    const concertDate = new Date(this.date);

    if (concertDate < now) {
      this.status = "completed";
    }
  }

  next();
});

// 정적 메서드들
ConcertSchema.statics.findUpcoming = function () {
  return this.find({
    date: { $gte: new Date() },
    status: { $ne: "cancelled" },
  }).sort({ date: 1 });
};

ConcertSchema.statics.findByArtist = function (artist: string) {
  return this.find({
    artist: new RegExp(artist, "i"),
  }).sort({ date: 1 });
};

ConcertSchema.statics.findByVenue = function (venue: string) {
  return this.find({
    venue: new RegExp(venue, "i"),
  }).sort({ date: 1 });
};

ConcertSchema.statics.searchConcerts = function (query: string) {
  return this.find(
    {
      $text: { $search: query },
    },
    {
      score: { $meta: "textScore" },
    }
  ).sort({ score: { $meta: "textScore" } });
};

export const Concert = mongoose.model<IConcert>("Concert", ConcertSchema);
