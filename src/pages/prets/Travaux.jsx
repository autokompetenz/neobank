import { Home as HomeIcon, Hammer, ClipboardList, Armchair } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito lavori Prestiter',
  eyebrow: 'Prestito lavori',
  hero: 'Piccoli lavori, arredamento interno, ristrutturazione — finanzia senza un pesante mutuo immobiliare.',
  badge: 'Travaux',
  path: '/prets/travaux',
  minMontant: 200, maxMontant: 3000000,
  minDuree: 4, maxDuree: 10,
  cibles: ['Proprietari', 'Inquilini', 'Famiglie'],
  description: 'Pittura, idraulica, elettricità, mobili, acquisto di materiali, ristrutturazione completa — il nostro prestito lavori da 200€ a 3 000 000€ ti permette di finanziare tutti i tuoi lavori senza ricorrere a un mutuo immobiliare pesante. Un giustificativo di preventivo può essere richiesto.',
  avantages: [
    { icon: HomeIcon, title: 'Per tutti i piccoli lavori', text: 'Pittura, idraulica, elettricità, piccoli mobili, materiali.' },
    { icon: Hammer, title: 'Senza mutuo pesante', text: 'Nessun bisogno di ipoteca né di pratica bancaria complessa.' },
    { icon: ClipboardList, title: 'Preventivo accettato', text: 'Un semplice preventivo o fattura basta come giustificativo.' },
  ],
  exemple: { icon: Armchair, title: 'Maria e Paolo, giovani genitori', scenario: 'Ristrutturazione della camera del bebè prima dell\'arrivo. Prestito lavori di 400€ su 6 mesi con presentazione di un preventivo.', mensualite: '69,17 €' },
  conditions: [
    { title: 'Status', text: 'Proprietario o inquilino' },
    { title: 'Importo', text: 'Da 200 € a 3 000 000 €' },
    { title: 'Durata', text: 'Da 4 a 10 mesi' },
    { title: 'Giustificativo', text: 'Preventivo o fattura può essere richiesto' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Preventivo o fattura', desc: 'Giustificativo dei lavori (se richiesto)' },
  ],
  faq: [
    { q: 'Bisogna obbligatoriamente fornire un preventivo?', r: 'Un preventivo può essere richiesto per importi elevati, ma non è sistematico.' },
    { q: 'Proprietario e inquilino sono accettati?', r: 'Sì, entrambi. Il prestito non è legato all\'immobile.' },
    { q: 'Posso usare il prestito per acquistare mobili?', r: 'Sì, l\'acquisto di mobili è incluso nei casi d\'uso accettati.' },
  ],
}

export default function Travaux() { return <PretTypeLayout data={data} /> }
