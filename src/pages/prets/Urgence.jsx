import { Zap, Banknote, FileText, Car } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito d\'emergenza Prestiter',
  eyebrow: 'Prestito emergenza',
  hero: 'Un bisogno immediato? Il nostro prestito d\'emergenza è trattato in priorità — risposta in poche ore.',
  badge: 'Urgence',
  path: '/prets/urgence',
  minMontant: 100, maxMontant: 50000,
  minDuree: 1, maxDuree: 3,
  cibles: ['Per tutti', 'Bisogno immediato'],
  description: 'Bolletta non pagata, guasto d\'auto, spese mediche, affitto in ritardo, taglio di elettricità — quando l\'emergenza non può aspettare. Il nostro prestito d\'emergenza da 100€ a 50 000€ è trattato in priorità con un tempo di risposta di poche ore e un bonifico entro 24h se accettato.',
  avantages: [
    { icon: Zap, title: 'Elaborazione prioritaria', text: 'La tua pratica viene elaborata in poche ore, non in giorni.' },
    { icon: Banknote, title: 'Bonifico entro 24h', text: 'Fondi disponibili sul tuo conto il giorno successivo se accettato.' },
    { icon: FileText, title: 'Modulo express', text: 'Meno campi da compilare, meno documenti da fornire.' },
  ],
  exemple: { icon: Car, title: 'Thomas, 35 anni, guasto d\'auto', scenario: 'Niente auto per andare al lavoro. Riparazione urgente di 1 200€. Prestito emergenza di 1 200€ su 3 mesi, accettato in 4h.', mensualite: '407,60 €' },
  conditions: [
    { title: 'Età minima', text: '18 anni minimo' },
    { title: 'Importo', text: 'Da 100 € a 50 000 €' },
    { title: 'Durata', text: 'Da 1 a 3 mesi' },
    { title: 'Situazione d\'emergenza', text: 'Bisogno finanziario immediato e giustificato' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Giustificativo d\'emergenza', desc: 'Facoltativo ma accelera l\'elaborazione' },
  ],
  faq: [
    { q: 'Cosa intendete per "emergenza"?', r: 'Qualsiasi situazione che richieda fondi immediatamente: bolletta non pagata, guasto, spese mediche, affitto.' },
    { q: 'L\'elaborazione è davvero più rapida?', r: 'Sì, le pratiche contrassegnate "emergenza" vengono trattate in priorità assoluta dal nostro team.' },
    { q: 'Posso ottenere più di 50 000 € in emergenza?', r: 'Per un\'emergenza, il massimale è di 50 000€. Oltre, orientati verso il nostro prestito personale.' },
  ],
}

export default function Urgence() { return <PretTypeLayout data={data} /> }
