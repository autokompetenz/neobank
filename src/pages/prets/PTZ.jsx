import { Heart, HeartHandshake, Sparkles, Hand } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito a tasso 0% — PTZ Solidale',
  eyebrow: 'PTZ Solidale',
  hero: 'Un prestito senza alcun interesse, riservato ai profili più fragili. Rimborsi solo il capitale.',
  badge: 'Taux 0%',
  path: '/prets/ptz',
  tauxZero: true,
  minMontant: 100, maxMontant: 50000,
  minDuree: 3, maxDuree: 6,
  cibles: ['Beneficiari', 'Persone in difficoltà', 'Profili esclusi dal sistema bancario'],
  description: 'Il nostro PTZ solidale è un prestito senza interessi, finanziato da privati prestatori solidali. Riservato ai profili più fragili: beneficiari di assegni, persone in difficoltà finanziaria temporanea, profili esclusi dal sistema bancario classico. Rimborsi solo il capitale preso in prestito.',
  avantages: [
    { icon: Heart, title: 'Zero interessi', text: 'Rimborsi esattamente ciò che hai preso in prestito. Neppure un centesimo in più.' },
    { icon: HeartHandshake, title: 'Finanziamento solidale', text: 'Privati prestatori solidali finanziano il tuo prestito senza cercare profitto.' },
    { icon: Sparkles, title: 'Seconda possibilità', text: 'Pensato per coloro che il sistema bancario classico ha escluso.' },
  ],
  exemple: { icon: Hand, title: 'Fatima, beneficiaria RSA', scenario: 'Una bolletta elettrica non pagata minacciava il taglio. PTZ solidale di 200€ su 4 mesi allo 0%, rimborso di soli 50€ al mese.', mensualite: '50,00 €' },
  conditions: [
    { title: 'Importo', text: 'Da 100 € a 50 000 €' },
    { title: 'Durata', text: 'Da 3 a 6 mesi' },
    { title: 'TAEG', text: '0 % — nessun interesse' },
    { title: 'Validazione', text: 'Soggetta a validazione speciale dal team Prestiter' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Giustificativo di situazione', desc: 'Certificazione RSA, avviso di situazione o qualsiasi documento che provi la tua fragilità finanziaria' },
  ],
  faq: [
    { q: 'Chi può beneficiare del tasso 0%?', r: 'I profili più fragili: beneficiari RSA, persone in difficoltà, esclusi bancari.' },
    { q: 'Il tasso 0% è garantito?', r: 'Sì, nessun interesse, nessun costo nascosto. Rimborsi solo il capitale.' },
    { q: 'I tempi di risposta sono più lunghi?', r: 'Sì, dalle 24 alle 48h, poiché è necessaria una validazione più rigorosa.' },
  ],
}

export default function PTZ() { return <PretTypeLayout data={data} /> }
