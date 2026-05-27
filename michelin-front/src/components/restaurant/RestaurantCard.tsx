interface RestaurantCardProps {
  name: string
  category: string
  grade: string
  imageUrl: string
}

function RestaurantCard({ name, category, grade, imageUrl }: RestaurantCardProps) {
  return (
    <article className="group cursor-pointer w-full hover:-translate-y-[10px] transition-transform duration-300">
      {/* 이미지 */}
      <div
        className="w-full overflow-hidden bg-[#eee]"
        style={{ aspectRatio: '3/4' }}
      >
        <img
          src={imageUrl}
          alt={name}
          loading="lazy"
          className="w-full h-full object-cover
                     transition-transform duration-[1600ms]
                     group-hover:scale-105"
          style={{ display: 'block' }}
          onError={e => {
            if (e.currentTarget.dataset.errored) return
            e.currentTarget.dataset.errored = 'true'
            e.currentTarget.src = 'https://via.placeholder.com/300x400?text=NO+IMAGE'
          }}
        />
      </div>

      {/* 카드 정보 */}
      <div
        className="flex justify-between border-b border-[#ddd] pb-[10px]"
        style={{ marginTop: '20px' }}
      >
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            color: '#e62117',
            fontWeight: 800
          }}
        >
          {category}
        </span>
        <span
          style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: '0.65rem',
            fontWeight: 800,
            color: '#111'
          }}
        >
          {grade}
        </span>
      </div>

      {/* 음식점 이름 */}
      <h3
        style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: '1.8rem',
          margin: '12px 0 0',
          fontWeight: 700,
          color: '#111'
        }}
      >
        {name}
      </h3>
    </article>
  )
}

export default RestaurantCard