'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ padding: '2rem', marginTop: '80px', textAlign: 'center' }}>
      <h2>Ada kesalahan!</h2>
      <p>{error.message}</p>
      <button onClick={() => reset()}>Coba Lagi</button>
    </div>
  )
}
