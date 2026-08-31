export default function PageHero({ title, lead, children }) {
  return (
    <div className="page-hero">
      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </div>
  )
}
