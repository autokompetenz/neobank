import { Target, Zap, Smartphone, Plane } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito personale Prestiter',
  eyebrow: 'Prestito personale',
  hero: 'Il prestito personale più semplice del mercato. Nessuna giustificazione d\'uso, risposta entro 24h.',
  badge: 'Personnel',
  path: '/prets/personnel',
  minMontant: 100, maxMontant: 3000000,
  minDuree: 3, maxDuree: 10,
  cibles: ['Per tutti', 'CDI', 'CDD', 'Pensionati', 'Beneficiari'],
  description: 'Il prestito personale Prestiter è la nostra offerta principale. Da 100€ a 3 000 000€, senza alcun giustificativo d\'uso. Prendi in prestito per quello che vuoi: viaggio, elettrodomestici, feste, spese impreviste, tempo libero, o anche progetti di grande portata. Nessuna domanda, nessuna scartoffia.',
  avantages: [
    { icon: Target, title: 'Nessuna giustificazione', text: 'Non serve dire perché prendi in prestito. Libera utilizzazione dei fondi.' },
    { icon: Zap, title: 'Risposta entro 24h', text: 'Elaborazione rapida della tua pratica, senza attese inutili.' },
    { icon: Smartphone, title: '100% online', text: 'Modulo semplice, firma elettronica, bonifico diretto.' },
  ],
  exemple: { icon: Plane, title: 'Sofia, 28 anni, ha finanziato il suo viaggio', scenario: 'Sofia voleva visitare la sua famiglia in Marocco senza aspettare mesi di risparmi. Prestito personale di 1 500€ su 8 mesi.', mensualite: '191,75 €' },
  conditions: [
    { title: 'Età minima', text: '18 anni minimo' },
    { title: 'Importo', text: 'Da 100 € a 3 000 000 €' },
    { title: 'Durata', text: 'Da 3 a 10 mesi' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Carta bancaria', text: 'Per i prelievi automatici' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Carta bancaria', desc: 'Per i prelievi automatici' },
  ],
  faq: [
    { q: 'Posso usare i soldi come voglio?', r: 'Sì, nessuna restrizione. Viaggio, spese, bollette, tempo libero — libero tu.' },
    { q: 'Ci sono spese di istruttoria?', r: 'No, nessuna spesa di istruttoria né costi nascosti. Il TAEG del 4,5% è tutto compreso.' },
    { q: 'Posso rimborsare anticipatamente?', r: 'Sì, senza alcuna spesa di rimborso anticipato.' },
  ],
}

export default function Personnel() { return <PretTypeLayout data={data} /> }
