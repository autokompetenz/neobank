import { RefreshCw, TrendingDown, Heart, BarChart3 } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito di consolidamento Prestiter',
  eyebrow: 'Consolidamento',
  hero: 'Raggruppa i tuoi piccoli debiti in un\'unica mensilità più semplice da gestire.',
  badge: 'Consolidation',
  path: '/prets/consolidation',
  minMontant: 300, maxMontant: 3000000,
  minDuree: 6, maxDuree: 10,
  cibles: ['Persone con più piccoli debiti'],
  description: 'Più scoperti bancari, piccoli debiti che si accumulano? Il nostro prestito di consolidamento da 300€ a 3 000 000€ ti permette di raggruppare tutto in un\'unica mensilità fissa, più facile da gestire. Respira, ci pensiamo noi.',
  avantages: [
    { icon: RefreshCw, title: 'Un\'unica mensilità', text: 'Basta il mal di testa delle scadenze multiple. Un solo prestito, un\'unica data.' },
    { icon: TrendingDown, title: 'Tasso unico', text: 'TAEG fisso del 4,5% sull\'intero importo consolidato.' },
    { icon: Heart, title: 'Sollievo finanziario', text: 'Riprendi il controllo delle tue finanze con una soluzione chiara.' },
  ],
  exemple: { icon: BarChart3, title: 'Ahmed, 42 anni, debiti multipli', scenario: 'Tre scoperti bancari e un credito revolving al 18% presso diversi istituti. Consolidamento di 550€ su 8 mesi per raggruppare tutto.', mensualite: '71,33 €' },
  conditions: [
    { title: 'Importo', text: 'Da 300 € a 3 000 000 € (importo minimo più elevato)' },
    { title: 'Durata', text: 'Da 6 a 10 mesi' },
    { title: 'Debiti da consolidare', text: 'Elencare i debiti da raggruppare nel modulo' },
    { title: 'Età minima', text: '18 anni minimo' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'Elenco dei debiti', desc: 'Importo, creditore e tipo di ciascun debito' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi e organizzare i rimborsi' },
  ],
  faq: [
    { q: 'Quali tipi di debiti posso consolidare?', r: 'Scoperti bancari, piccoli crediti al consumo, debiti familiari — qualsiasi tipo di piccolo debito.' },
    { q: 'Il prestito rimborsa i miei debiti direttamente?', r: 'I fondi ti vengono versati, sei tu a rimborsare i tuoi debiti. Ti aiutiamo a organizzare.' },
    { q: 'Posso consolidare se sono già in ritardo nei pagamenti?', r: 'Contattaci per studiare la tua situazione. Troviamo una soluzione adatta.' },
  ],
}

export default function Consolidation() { return <PretTypeLayout data={data} /> }
