import { useState, useEffect, useRef } from 'react'

export default function LoanSimulator() {
  const [amount, setAmount] = useState(5000)
  const [duration, setDuration] = useState(6)
  const taeg = 0.045
  const monthlyRate = taeg / 12
  const monthlyPayment = amount * monthlyRate * Math.pow(1 + monthlyRate, duration) / (Math.pow(1 + monthlyRate, duration) - 1)
  const totalCost = monthlyPayment * duration
  const totalInterest = totalCost - amount

  return (
    <div className="simulator-card">
      <h3>Simula il tuo prestito</h3>
      <div className="simulator-group">
        <div className="simulator-label">
          <span>Importo</span>
          <strong>{amount.toLocaleString('fr-FR')} €</strong>
        </div>
        <input type="range" className="simulator-range" min={100} max={3000000} step={100} value={amount} onChange={e => setAmount(Number(e.target.value))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
          <span>100 €</span>
          <span>3 000 000 €</span>
        </div>
      </div>
      <div className="simulator-group">
        <div className="simulator-label">
          <span>Durata</span>
          <strong>{duration} mesi</strong>
        </div>
        <input type="range" className="simulator-range" min={3} max={120} step={1} value={duration} onChange={e => setDuration(Number(e.target.value))} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}>
          <span>3 mesi</span>
          <span>120 mesi</span>
        </div>
      </div>
      <div className="simulator-result">
        <div style={{ textAlign: 'center' }}>
          <div className="label">Mensilità</div>
          <div className="value">{monthlyPayment.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="label">Costo totale</div>
          <div className="value">{totalCost.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="label">TAEG</div>
          <div className="value" style={{ color: 'var(--green)' }}>4,5%</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="label">Interessi</div>
          <div className="value" style={{ color: 'var(--green)' }}>+{totalInterest.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div>
        </div>
      </div>
      <p className="simulator-note">Simulazione indicativa. TAEG fisso 4,5%. Nessuna spesa di pratica.</p>
    </div>
  )
}
