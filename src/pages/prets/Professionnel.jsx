import { Briefcase, ClipboardList, Rocket, Laptop } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito professionale Prestiter',
  eyebrow: 'Prestito professionale',
  hero: 'Freelance, autoimprenditore, artigiano? Hai bisogno di liquidità rapida per la tua attività.',
  badge: 'Professionnel',
  path: '/prets/professionnel',
  minMontant: 200, maxMontant: 3000000,
  minDuree: 3, maxDuree: 10,
  cibles: ['Freelance', 'Autoimprenditori', 'Artigiani', 'Commercianti'],
  description: 'Sei un indipendente e le banche ti ignorano? Il nostro prestito professionale da 200€ a 3 000 000€ è fatto per te. Redditi variabili accettati, nessun bilancio contabile richiesto. Acquista materiale, finanzia un viaggio o avvia la tua attività.',
  avantages: [
    { icon: Briefcase, title: 'Redditi variabili accettati', text: 'Nessuna stabilità richiesta. Comprendiamo il ritmo degli indipendenti.' },
    { icon: ClipboardList, title: 'Nessun bilancio richiesto', text: 'Un estratto Kbis o una fattura recente basta. Nessun commercialista.' },
    { icon: Rocket, title: 'Per potenziare la tua attività', text: 'Materiale, software, scorte, viaggio professionale, avvio attività.' },
  ],
  exemple: { icon: Laptop, title: 'Camille, freelance nel design', scenario: 'Il suo computer si è spento in piena missione. Prestito professionale di 3 000€ su 8 mesi per una sostituzione urgente.', mensualite: '383,50 €' },
  conditions: [
    { title: 'Status', text: 'Freelance, autoimprenditore, artigiano, commerciante, libero professionista' },
    { title: 'Importo', text: 'Da 200 € a 3 000 000 €' },
    { title: 'Durata', text: 'Da 3 a 10 mesi' },
    { title: 'Giustificativo', text: 'Estratto Kbis, numero SIRET o fattura recente' },
    { title: 'Conto bancario', text: 'Possedere un IBAN professionale o personale' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'Estratto Kbis o SIRET', desc: 'Giustificativo di attività professionale' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Fattura o preventivo', desc: 'Se utilizzo professionale specifico' },
  ],
  faq: [
    { q: 'Posso prendere in prestito se la mia attività è recente?', r: 'Sì, anche un\'attività recente può essere accettata.' },
    { q: 'I liberi professionisti sono accettati?', r: 'Sì, tutte le professioni liberali sono accettate.' },
    { q: 'Posso usare i fondi per la mia attività?', r: 'Sì, il prestito è pensato per esigenze professionali.' },
  ],
}

export default function Professionnel() { return <PretTypeLayout data={data} /> }
