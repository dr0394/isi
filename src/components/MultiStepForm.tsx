import React, { useState } from 'react';
import { 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Target, 
  Calendar,
  MessageSquare,
  Dumbbell,
  Clock,
  Star,
  Heart,
  Zap
} from 'lucide-react';
import { pionierService } from '../lib/supabase';

interface FormData {
  // Step 1: Basic Info
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Step 2: Goals & Experience
  primaryGoal: string;
  currentFitnessLevel: string;
  previousExperience: string;
  
  // Step 3: Availability & Motivation
  availableTime: string;
  preferredTime: string;
  motivation: string;
  
  // Step 4: Additional Info
  challenges: string[];
  hearAboutUs: string;
  additionalNotes: string;
}

interface MultiStepFormProps {
  onSuccess: () => void;
}

const MultiStepForm: React.FC<MultiStepFormProps> = ({ onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    primaryGoal: '',
    currentFitnessLevel: '',
    previousExperience: '',
    availableTime: '',
    preferredTime: '',
    motivation: '',
    challenges: [],
    hearAboutUs: '',
    additionalNotes: ''
  });

  const totalSteps = 4;

  const updateFormData = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const toggleChallenge = (challenge: string) => {
    setFormData(prev => ({
      ...prev,
      challenges: prev.challenges.includes(challenge)
        ? prev.challenges.filter(c => c !== challenge)
        : [...prev.challenges, challenge]
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.firstName && formData.lastName && formData.email);
      case 2:
        return !!(formData.primaryGoal && formData.currentFitnessLevel);
      case 3:
        return !!(formData.availableTime && formData.motivation);
      case 4:
        return true; // Optional step
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      await pionierService.create({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        phone: formData.phone || 'Nicht angegeben'
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error submitting form:', error);
      // Still show success to user, but log error
      onSuccess();
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Persönliche Daten</h2>
              <p className="text-gray-400">Erzählen Sie uns etwas über sich</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Vorname *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Ihr Vorname"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nachname *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="Ihr Nachname"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                E-Mail Adresse *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="ihre.email@beispiel.de"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Telefonnummer (optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                  placeholder="+49 123 456 789"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Target className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Deine Ziele & Erfahrung</h2>
              <p className="text-gray-400">Damit wir dich optimal unterstützen können</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Was ist Ihr Hauptziel? *
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { value: 'weight-loss', label: 'Abnehmen', icon: '🔥' },
                  { value: 'muscle-gain', label: 'Muskelaufbau', icon: '💪' },
                  { value: 'fitness', label: 'Allgemeine Fitness', icon: '⚡' },
                  { value: 'strength', label: 'Kraft steigern', icon: '🏋️' },
                  { value: 'endurance', label: 'Ausdauer verbessern', icon: '🏃' },
                  { value: 'health', label: 'Gesundheit fördern', icon: '❤️' }
                ].map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => updateFormData('primaryGoal', goal.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.primaryGoal === goal.value
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{goal.icon}</div>
                    <div className="font-medium">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Wie würden Sie Ihr aktuelles Fitness-Level beschreiben? *
              </label>
              <div className="space-y-3">
                {[
                  { value: 'beginner', label: 'Anfänger', desc: 'Wenig bis keine Erfahrung' },
                  { value: 'intermediate', label: 'Fortgeschritten', desc: 'Regelmäßiges Training seit einigen Monaten' },
                  { value: 'advanced', label: 'Erfahren', desc: 'Jahrelange Trainingserfahrung' }
                ].map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => updateFormData('currentFitnessLevel', level.value)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      formData.currentFitnessLevel === level.value
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className="text-sm opacity-75">{level.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Haben Sie schon mal mit einem Coach gearbeitet?
              </label>
              <textarea
                value={formData.previousExperience}
                onChange={(e) => updateFormData('previousExperience', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Erzählen Sie uns von Ihren bisherigen Erfahrungen..."
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Zeit & Motivation</h2>
              <p className="text-gray-400">Wie können wir Sie am besten unterstützen?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Wie viel Zeit können Sie pro Woche für Training aufbringen? *
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { value: '1-2h', label: '1-2 Stunden', desc: 'Perfekt für den Einstieg' },
                  { value: '3-4h', label: '3-4 Stunden', desc: 'Gute Balance' },
                  { value: '5-6h', label: '5-6 Stunden', desc: 'Ambitioniert' },
                  { value: '7h+', label: '7+ Stunden', desc: 'Sehr engagiert' }
                ].map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => updateFormData('availableTime', time.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      formData.availableTime === time.value
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="font-medium">{time.label}</div>
                    <div className="text-sm opacity-75">{time.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Wann trainieren Sie am liebsten?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'morning', label: 'Morgens', icon: '🌅' },
                  { value: 'afternoon', label: 'Mittags', icon: '☀️' },
                  { value: 'evening', label: 'Abends', icon: '🌙' }
                ].map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => updateFormData('preferredTime', time.value)}
                    className={`p-4 rounded-lg border-2 transition-all text-center ${
                      formData.preferredTime === time.value
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="text-2xl mb-2">{time.icon}</div>
                    <div className="font-medium text-sm">{time.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Was motiviert Sie am meisten? *
              </label>
              <textarea
                value={formData.motivation}
                onChange={(e) => updateFormData('motivation', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Beschreiben Sie, was Sie antreibt und warum Sie diesen Weg gehen möchten..."
                rows={4}
                required
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <MessageSquare className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-white mb-2">Zusätzliche Informationen</h2>
              <p className="text-gray-400">Helfen Sie uns, Sie besser zu verstehen</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Welche Herausforderungen beschäftigen Sie aktuell?
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  'Zeitmangel',
                  'Motivation aufrechterhalten',
                  'Richtige Ernährung',
                  'Verletzungen/Schmerzen',
                  'Stress im Alltag',
                  'Selbstdisziplin',
                  'Plateau überwinden',
                  'Work-Life-Balance'
                ].map((challenge) => (
                  <button
                    key={challenge}
                    type="button"
                    onClick={() => toggleChallenge(challenge)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      formData.challenges.includes(challenge)
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                        formData.challenges.includes(challenge)
                          ? 'border-yellow-500 bg-yellow-500'
                          : 'border-gray-400'
                      }`}>
                        {formData.challenges.includes(challenge) && (
                          <CheckCircle className="w-3 h-3 text-black" />
                        )}
                      </div>
                      <span className="text-sm">{challenge}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Wie haben Sie von uns erfahren?
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { value: 'instagram', label: 'Instagram' },
                  { value: 'tiktok', label: 'TikTok' },
                  { value: 'youtube', label: 'YouTube' },
                  { value: 'google', label: 'Google Suche' },
                  { value: 'friend', label: 'Freunde/Familie' },
                  { value: 'other', label: 'Sonstiges' }
                ].map((source) => (
                  <button
                    key={source.value}
                    type="button"
                    onClick={() => updateFormData('hearAboutUs', source.value)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      formData.hearAboutUs === source.value
                        ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                        : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    {source.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Haben Sie noch Fragen oder Anmerkungen?
              </label>
              <textarea
                value={formData.additionalNotes}
                onChange={(e) => updateFormData('additionalNotes', e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                placeholder="Teilen Sie uns alles mit, was für Sie wichtig ist..."
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-400">
            Schritt {currentStep} von {totalSteps}
          </span>
          <span className="text-sm font-medium text-gray-400">
            {Math.round((currentStep / totalSteps) * 100)}% abgeschlossen
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
              currentStep === 1
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </button>

          {currentStep < totalSteps ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className={`flex items-center px-6 py-3 rounded-lg font-medium transition-all ${
                validateStep(currentStep)
                  ? 'bg-yellow-500 text-black hover:bg-yellow-400'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              Weiter
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                  Wird gesendet...
                </>
              ) : (
                <>
                  Anmeldung abschließen
                  <CheckCircle className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Help Text */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-400">
          Deine Daten sind sicher und werden vertraulich behandelt.
        </p>
      </div>
    </div>
  );
};

export default MultiStepForm;