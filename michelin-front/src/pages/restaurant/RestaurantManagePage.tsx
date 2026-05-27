function RestaurantManagePage() {
  return (
    <div
      style={{
        fontFamily: "'Space Mono', monospace",
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem 5vw',
        textAlign: 'center',
      }}
    >
      <p style={{ fontSize: '10px', letterSpacing: '3px', color: '#e62117', marginBottom: '12px' }}>
        ● ADMIN
      </p>
      <h1
        style={{
          fontFamily: "'Playfair Display', serif",
          fontWeight: 900,
          fontSize: 'clamp(2rem, 5vw, 3.5rem)',
          letterSpacing: '-2px',
          color: '#111',
          margin: '0 0 16px',
        }}
      >
        RESTAURANT MANAGEMENT
      </h1>
      <p style={{ fontSize: '10px', letterSpacing: '2px', color: '#aaa' }}>
        COMING SOON
      </p>
    </div>
  )
}

export default RestaurantManagePage