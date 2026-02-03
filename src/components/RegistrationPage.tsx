import React, { useState } from 'react';
import { 
  Dumbbell, 
  CheckCircle, 
  ArrowLeft,
  Star,
  Users,
  Clock,
  Target
} from 'lucide-react';
import MultiStepForm from './MultiStepForm';

interface RegistrationPageProps {
  onBack: () => void;
}

const RegistrationPage: React.FC<RegistrationPageProps> = ({ onBack }) => {
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-3xl p-2 border border-green-500/30 mb-8">
            <div className="bg-black rounded-2xl p-12">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              
              <h1 className="text-3xl lg:text-4xl font-bold text-green-400 mb-6">
                Willkommen in der Inner Circle Pioniergruppe!
              </h1>
              
              <div className="space-y-4 text-lg text-gray-300 mb-8">
                <p>
                  Vielen Dank für Ihre ausführliche Anmeldung! Wir haben alle Ihre Informationen erhalten 
                  und werden sie sorgfältig auswerten.
                </p>
                <p>
                  Als einer der ersten 100 Teilnehmer erhalten Sie:
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <Star className="w-8 h-8 text-yellow-500 mb-3" />
                  <h3 className="font-bold text-white mb-2">VIP-Zugang</h3>
                  <p className="text-gray-400 text-sm">Exklusiver Early Access vor allen anderen</p>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <Target className="w-8 h-8 text-yellow-500 mb-3" />
                  <h3 className="font-bold text-white mb-2">Persönlicher Plan</h3>
                  <p className="text-gray-400 text-sm">Individuell auf deine Ziele abgestimmt</p>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <Users className="w-8 h-8 text-yellow-500 mb-3" />
                  <h3 className="font-bold text-white mb-2">Exklusive Community</h3>
                  <p className="text-gray-400 text-sm">Direkter Austausch mit Coach Isi</p>
                </div>
                
                <div className="bg-gray-900 rounded-xl p-6 border border-gray-700">
                  <Clock className="w-8 h-8 text-yellow-500 mb-3" />
                  <h3 className="font-bold text-white mb-2">Bonus-Material</h3>
                  <p className="text-gray-400 text-sm">Zusätzliche Ressourcen und Tools</p>
                </div>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-yellow-500 mb-3">Was passiert als Nächstes?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">1</div>
                    <p className="text-gray-300">Du erhältst eine Bestätigungs-E-Mail mit allen wichtigen Informationen</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">2</div>
                    <p className="text-gray-300">Unser Team wertet deine Angaben aus und erstellt deinen persönlichen Plan</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">3</div>
                    <p className="text-gray-300">Du wirst persönlich kontaktiert, sobald das Programm startet</p>
                  </div>
                </div>
              </div>

              <button
                onClick={onBack}
                className="flex items-center mx-auto px-6 py-3 text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zurück zur Hauptseite
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-xl font-bold">COACH ISI</div>
                <div className="text-sm text-yellow-500">Inner Circle Pioniergruppe</div>
              </div>
            </div>
            
            <button
              onClick={onBack}
              className="flex items-center px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-6 py-3 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-sm font-medium mb-6">
              🎯 Exklusiver Zugang für die ersten 100 Teilnehmer
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-6">
              Werden Sie Teil der
              <br />
              <span className="text-yellow-500">Inner Circle Pioniergruppe</span>
            </h1>
            
            <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto mb-8">
              Füllen Sie das folgende Formular aus, damit wir Sie optimal auf Ihrem Weg zu einem 
              stärkeren Körper und Geist begleiten können. Je mehr wir über Sie wissen, 
              desto besser können wir Ihnen helfen.
            </p>

            <div className="grid md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-12">
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-sm text-gray-400">Dauert nur</div>
                <div className="font-bold text-white">5 Minuten</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-sm text-gray-400">Individueller</div>
                <div className="font-bold text-white">Trainingsplan</div>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="w-6 h-6 text-yellow-500" />
                </div>
                <div className="text-sm text-gray-400">Exklusive</div>
                <div className="font-bold text-white">Community</div>
              </div>
            </div>
          </div>

          {/* Multi-Step Form */}
          <MultiStepForm onSuccess={() => setIsSubmitted(true)} />
        </div>
      </main>
    </div>
  );
};

export default RegistrationPage;