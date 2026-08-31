import { GraduationCap, BookOpen, Smartphone } from 'lucide-react'
import PretTypeLayout from './PretTypeLayout'

const data = {
  title: 'Prestito studentesco Prestiter',
  eyebrow: 'Prestito studentesco',
  hero: 'Studente, alternante, giovane lavoratore? Un prestito adatto alla tua situazione, senza redditi stabili.',
  badge: 'Étudiant',
  path: '/prets/etudiant',
  minMontant: 100, maxMontant: 50000,
  minDuree: 3, maxDuree: 8,
  cibles: ['Studenti', 'Alternanti', 'Giovani lavoratori 18-26 anni'],
  description: 'Le banche non prestano agli studenti — noi sì. Il nostro prestito studentesco da 100€ a 50 000€ è pensato per i giovani senza redditi fissi o con basse risorse. Mensilità leggere, condizioni flessibili e nessuna discriminazione legata alla tua situazione.',
  avantages: [
    { icon: GraduationCap, title: 'Condizioni agevolate', text: 'Niente redditi stabili? Nessun problema. Valutiamo la tua situazione globalmente.' },
    { icon: BookOpen, title: 'Per i tuoi studi e oltre', text: 'Materiale, computer, alloggio, trasporto, stage all\'estero.' },
    { icon: Smartphone, title: 'Senza garanzia parentale', text: 'Nessun bisogno di garante. Prendi in prestito a tuo nome.' },
  ],
  exemple: { icon: BookOpen, title: 'Lucas, 21 anni, studente universitario', scenario: 'Necessità di un computer portatile per i suoi corsi e i suoi esami. Prestito studentesco di 800€ su 6 mesi, accettato senza giustificativo di reddito.', mensualite: '136,40 €' },
  conditions: [
    { title: 'Età', text: 'Da 18 a 26 anni' },
    { title: 'Importo', text: 'Da 100 € a 50 000 €' },
    { title: 'Durata', text: 'Da 3 a 8 mesi' },
    { title: 'Iscrizione', text: 'Essere studente, alternante o in formazione' },
    { title: 'Conto bancario', text: 'Possedere un IBAN a tuo nome' },
    { title: 'Documento d\'identità', text: 'Carta d\'identità o passaporto in corso di validità' },
  ],
  documents: [
    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
    { doc: 'Tessera studentesca', desc: 'O certificato di iscrizione (facoltativo)' },
  ],
  faq: [
    { q: 'Posso prendere in prestito senza avere redditi?', r: 'Sì, non richiediamo redditi regolari per gli studenti.' },
    { q: 'Serve un garante o una fideiussione parentale?', r: 'No, nessun garante è richiesto. Prendi in prestito a tuo nome.' },
    { q: 'Posso usare il prestito per uno stage all\'estero?', r: 'Sì, è anzi uno degli usi consigliati.' },
  ],
}

export default function Etudiant() { return <PretTypeLayout data={data} /> }
