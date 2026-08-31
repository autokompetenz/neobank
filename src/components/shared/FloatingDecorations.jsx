export default function FloatingDecorations() {
  return (
    <>
      <div className="parallax-floater parallax-floater--circle" style={{ top: '10%', right: '5%', animation: 'floatSlow 8s ease-in-out infinite' }} />
      <div className="parallax-floater parallax-floater--dot" style={{ top: '30%', left: '8%', animation: 'float 4s ease-in-out infinite 1s' }} />
      <div className="parallax-floater parallax-floater--ring" style={{ bottom: '15%', right: '12%', animation: 'floatSlow 10s ease-in-out infinite 2s' }} />
      <div className="parallax-floater parallax-floater--dot" style={{ bottom: '25%', left: '15%', animation: 'float 5s ease-in-out infinite 0.5s' }} />
    </>
  )
}
