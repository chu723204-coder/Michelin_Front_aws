// src/components/review/ReviewSection.tsx
import { useState } from "react";

interface Reply {
  replyId: number;
  author: string;
  content: string;
  date: string;
}

interface Review {
  reviewId: number;
  author: string;
  rating: number;
  content: string;
  date: string;
  reply: Reply | null;
}

const MOCK_REVIEWS: Review[] = [
  {
    reviewId: 1,
    author: "홍길동",
    rating: 5,
    content: "분위기도 좋고 음식도 훌륭했습니다. 코스 요리 하나하나가 정말 인상적이었어요.",
    date: "2026.05.10",
    reply: {
      replyId: 1,
      author: "가게 사장",
      content: "소중한 리뷰 감사합니다! 다음에도 방문해주세요 😊",
      date: "2026.05.11",
    },
  },
  {
    reviewId: 2,
    author: "김미식",
    rating: 4,
    content: "맛은 훌륭했지만 웨이팅이 조금 길었어요. 그래도 충분히 기다릴 만한 가치가 있었습니다.",
    date: "2026.04.22",
    reply: null,
  },
  {
    reviewId: 3,
    author: "이맛집",
    rating: 5,
    content: "미쉐린 스타를 받은 이유가 있네요. 서비스도 음식도 완벽했습니다.",
    date: "2026.03.15",
    reply: null,
  },
];

const renderStars = (rating: number) => "★".repeat(rating) + "☆".repeat(5 - rating);

interface ReviewSectionProps {
  restaurantId: number; // ✅ 나중에 API 연동 시 사용
}

function ReviewSection({ }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [newReview, setNewReview] = useState({ rating: 5, content: "" });
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");

  const handleSubmitReview = () => {
    if (!newReview.content.trim()) return;
    const review: Review = {
      reviewId: Date.now(),
      author: "나",
      rating: newReview.rating,
      content: newReview.content,
      date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(".", ""),
      reply: null,
    };
    setReviews([review, ...reviews]);
    setNewReview({ rating: 5, content: "" });
  };

  const handleSubmitReply = (reviewId: number) => {
    if (!replyContent.trim()) return;
    setReviews(reviews.map(r =>
      r.reviewId === reviewId
        ? { ...r, reply: { replyId: Date.now(), author: "나", content: replyContent, date: new Date().toLocaleDateString("ko-KR").replace(/\. /g, ".").replace(".", "") } }
        : r
    ));
    setReplyingTo(null);
    setReplyContent("");
  };

  const handleDeleteReview = (reviewId: number) => {
    setReviews(reviews.filter(r => r.reviewId !== reviewId));
  };

  return (
    <section
      className="px-4 sm:px-8 lg:px-[5vw] pb-16"
      style={{ fontFamily: "'Space Mono', monospace" }}
    >
      <div className="max-w-[700px]">
        <p className="text-[9px] tracking-[3px] text-[#aaa] mb-6">
          REVIEWS — {reviews.length}건
        </p>

        {/* 리뷰 작성 폼 */}
        <div className="border border-[#eee] p-5 mb-8">
          <p className="text-[9px] tracking-[3px] text-[#aaa] mb-4">WRITE A REVIEW</p>

          {/* 별점 선택 */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-[#aaa] tracking-[1px]">RATING</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setNewReview({ ...newReview, rating: star })}
                  className="text-lg cursor-pointer bg-transparent border-none"
                  style={{ color: star <= newReview.rating ? "#e62117" : "#ddd" }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* 내용 입력 */}
          <textarea
            value={newReview.content}
            onChange={(e) => setNewReview({ ...newReview, content: e.target.value })}
            placeholder="리뷰를 작성해주세요..."
            rows={3}
            className="w-full border border-[#eee] p-3 text-[11px] resize-none outline-none focus:border-[#111] transition-colors"
            style={{ fontFamily: "'Space Mono', monospace", letterSpacing: "0.5px" }}
          />

          <button
            onClick={handleSubmitReview}
            className="mt-3 px-6 py-2 bg-[#111] text-white text-[10px] tracking-[2px] border-none cursor-pointer hover:bg-[#333] transition-colors"
          >
            등록
          </button>
        </div>

        {/* 리뷰 목록 */}
        <div className="flex flex-col gap-0">
          {reviews.map((review, i) => (
            <div key={review.reviewId} className={`py-5 ${i < reviews.length - 1 ? "border-b border-[#eee]" : ""}`}>

              {/* 리뷰 헤더 */}
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#f0f0f0] flex items-center justify-center text-[11px] font-medium text-[#111]">
                    {review.author[0]}
                  </div>
                  <div>
                    <span className="text-[12px] font-medium text-[#111]">{review.author}</span>
                    <div className="text-[11px] text-[#e62117] mt-0.5">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <span className="text-[10px] text-[#aaa]">{review.date}</span>
              </div>

              {/* 리뷰 내용 */}
              <p className="text-[11px] text-[#666] leading-relaxed ml-10 mb-3">{review.content}</p>

              {/* 버튼 영역 */}
              <div className="ml-10 flex items-center gap-4">
                {/* 본인 리뷰일 때만 삭제 버튼 */}
                {review.author === "나" && (
                  <button
                    onClick={() => handleDeleteReview(review.reviewId)}
                    className="text-[10px] text-[#aaa] hover:text-[#e62117] transition-colors bg-transparent border-none cursor-pointer tracking-[1px]"
                  >
                    삭제
                  </button>
                )}

                {/* 답글 달기 버튼 - 답글 없을 때만 표시 */}
                {!review.reply && replyingTo !== review.reviewId && (
                  <button
                    onClick={() => setReplyingTo(review.reviewId)}
                    className="text-[10px] text-[#aaa] hover:text-[#111] transition-colors bg-transparent border-none cursor-pointer tracking-[1px]"
                  >
                    ↳ 답글 달기
                  </button>
                )}
              </div>

              {/* 답글 입력 폼 */}
              {replyingTo === review.reviewId && (
                <div className="ml-10 mt-3 border-l-2 border-[#eee] pl-4">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="답글을 작성해주세요..."
                    rows={2}
                    className="w-full border border-[#eee] p-3 text-[11px] resize-none outline-none focus:border-[#111] transition-colors"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleSubmitReply(review.reviewId)}
                      className="px-4 py-1.5 bg-[#111] text-white text-[10px] tracking-[1px] border-none cursor-pointer hover:bg-[#333] transition-colors"
                    >
                      등록
                    </button>
                    <button
                      onClick={() => { setReplyingTo(null); setReplyContent(""); }}
                      className="px-4 py-1.5 bg-transparent text-[#aaa] text-[10px] tracking-[1px] border border-[#eee] cursor-pointer hover:text-[#111] transition-colors"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}

              {/* 기존 답글 표시 */}
              {review.reply && (
                <div className="ml-10 mt-3 border-l-2 border-[#eee] pl-4">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[#111] flex items-center justify-center text-[9px] text-white">
                        {review.reply.author[0]}
                      </div>
                      <span className="text-[11px] font-medium text-[#111]">{review.reply.author}</span>
                    </div>
                    <span className="text-[10px] text-[#aaa]">{review.reply.date}</span>
                  </div>
                  <p className="text-[11px] text-[#666] leading-relaxed ml-7">{review.reply.content}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ReviewSection;