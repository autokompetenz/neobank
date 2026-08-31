import { HeartHandshake, Lock, FileText } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito tra privati (P2P)',
  eyebrow: 'Prestito P2P',
  hero: 'Il modello di base Prestiter: un privato presta a un altro, protetto dalla nostra piattaforma.',
  badge: 'P2P',
  path: '/prets/p2p',
  minMontant: 100, maxMontant: 3000000,
  minDuree: 3, maxDuree: 10,
  cibles: ['Per tutti'],
  description: 'Il prestito tra privati è il modello fondatore di Prestiter. Un privato presta direttamente a un altro, con la piattaforma come intermediario sicuro. Contratto firmato elettronicamente, tasso negoziato tramite la piattaforma, bonifico sicuro.',
  avantages: [
    { icon: HeartHandshake, title: 'Prestito diretto', text: 'Niente banca, niente intermediario costoso. Un privato presta a un privato.' },
    { icon: Lock, title: 'Piattaforma sicura', text: 'Contratto elettronico, dati criptati, conformità ORIAS.' },
    { icon: FileText, title: 'Contratto elettronico', text: 'Firmato digitalmente da entrambe le parti, valore legale.' },
  ],
  exemple: { icon: HeartHandshake, title: 'Giulia, 29 anni, ha preferito il prestito tra privati', scenario: 'Rifiutata dalla sua banca per un prestito di 5 000€, si è rivolta alla nostra piattaforma. Prestito P2P di 5 000€ su 10 mesi, finanziato in 48h da un prestatore solidale.', mensualite: '520,65 €' },
  conditions: [
    { title: 'Importo', text: 'Da 100 € a 3 000 000 €' },
    { title: 'Durata', text: 'Da 3 a 10 mesi' },
    { title: 'TAEG', text: '4,5 % fisso' },
    { title: 'Intermediazione', text: 'Prestiter SPA agisce come intermediario in finanziamento partecipativo' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Carta bancaria', desc: 'Per i prelievi automatici' },
  ],
  faq: [
    { q: 'Chi è il prestatore?', r: 'Un privato come te, che desidera investire i propri soldi in modo solidale e remunerato.' },
    { q: 'Come viene firmato il contratto?', r: 'Elettronicamente, tramite la nostra piattaforma sicura. Nessuna carta.' },
    { q: 'Cosa succede in caso di mancato pagamento?', r: 'Il nostro team garantisce il recupero amichevole e trova una soluzione.' },
  ],
}

export default function P2P() { return <PretTypeLayout data={data} /> }
