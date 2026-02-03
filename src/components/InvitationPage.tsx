import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  Dumbbell,
  Clock,
  Star,
  Target
} from 'lucide-react';
import { pionierService, invitationService, UserInvitation } from '../lib/supabase';
import { supabase } from '../lib/supabase';

interface InvitationPageProps {
  token: string;
}

const InvitationPage: React.FC<InvitationPageProps> = ({ token }) => {
  const [invitation, setInvitation] = useState<UserInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  useEffect(() => {
    loadInvitation();
  }, [token]);

  const loadInvitation = async () => {
    try {
      const invitationData = await pionierService.getInvitationByToken(token);
      if (invitationData) {
        setInvitation(invitationData);
        setFormData(prev => ({
          ...prev,
          email: invitationData.pionier_entries?.email || ''
        }));
      } else {
        setError('Einladung nicht gefunden oder abgelaufen.');
      }
    } catch (err) {
      console.error('Error loading invitation:', err);
      setError('Fehler beim Laden der Einladung.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.confirmPassword) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein.');
      return;
    }

    setIsRegistering(true);
    setError('');

    try {
      // Create Supabase auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Use invitation token to create user record
        await invitationService.useInvitation(token, authData.user.id);
        setIsRegistered(true);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Fehler bei der Registrierung. Bitte versuchen Sie es erneut.');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Lade Einladung...</p>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-red-400 mb-4">Einladung ungültig</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
          >
            Zur Hauptseite
          </button>
        </div>
      </div>
    );
  }

  if (isRegistered) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-3xl p-2 border border-green-500/30 mb-8">
            <div className="bg-black rounded-2xl p-12">
              <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
              
              <h1 className="text-3xl lg:text-4xl font-bold text-green-400 mb-6">
                Registrierung erfolgreich!
              </h1>
              
              <div className="space-y-4 text-lg text-gray-300 mb-8">
                <p>
                  Willkommen in der Inner Circle Pioniergruppe, {invitation?.pionier_entries?.name}!
                </p>
                <p>
                  Wir haben eine Bestätigungs-E-Mail an {formData.email} gesendet. 
                  Bitte bestätigen Sie Ihre E-Mail-Adresse, um Ihr Dashboard freizuschalten.
                </p>
              </div>

              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
                <h3 className="text-xl font-bold text-yellow-500 mb-3">Was passiert als Nächstes?</h3>
                <div className="space-y-3 text-left">
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">1</div>
                    <p className="text-gray-300">Bestätigen Sie Ihre E-Mail-Adresse über den Link in der E-Mail</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">2</div>
                    <p className="text-gray-300">Loggen Sie sich in Ihr persönliches Dashboard ein</p>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">3</div>
                    <p className="text-gray-300">Starten Sie Ihre Transformation mit Coach Isi</p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.location.href = '/dashboard'}
                className="px-8 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
              >
                Zum Dashboard
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
          <div className="flex justify-center items-center py-6">
            <div className="flex items-center space-x-3">
              <Dumbbell className="w-8 h-8 text-yellow-500" />
              <div>
                <div className="text-xl font-bold">COACH ISI</div>
                <div className="text-sm text-yellow-500">Inner Circle Pioniergruppe</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-4">
              Herzlichen Glückwunsch!
            </h1>
            
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 mb-6">
              <p className="text-green-400 font-medium">
                Ihre Bewerbung wurde genehmigt!
              </p>
            </div>
            
            <p className="text-gray-300 mb-2">
              Hallo <span className="font-bold text-yellow-500">{invitation?.pionier_entries?.name}</span>,
            </p>
            <p className="text-gray-400">
              Sie wurden ausgewählt, um Teil der exklusiven Inner Circle Pioniergruppe zu werden. 
              Erstellen Sie jetzt Ihr persönliches Dashboard-Konto.
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
            <form onSubmit={handleRegistration} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  E-Mail Adresse
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Ihre E-Mail Adresse"
                    required
                    disabled
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Diese E-Mail-Adresse ist mit Ihrer Bewerbung verknüpft
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Passwort erstellen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Mindestens 6 Zeichen"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                    placeholder="Passwort wiederholen"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isRegistering}
                className="w-full py-3 px-4 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isRegistering ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                    Konto wird erstellt...
                  </div>
                ) : (
                  'Dashboard-Zugang erstellen'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400">
                Mit der Registrierung stimmen Sie unseren Nutzungsbedingungen zu.
                Ihre Daten werden sicher und vertraulich behandelt.
              </p>
            </div>
          </div>

          {/* Benefits Preview */}
          <div className="mt-8 bg-gray-900/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-bold text-white mb-4 text-center">
              Was Sie in Ihrem Dashboard erwartet:
            </h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Target className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300 text-sm">Personalisierte Trainingspläne</span>
              </div>
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300 text-sm">Direkter Kontakt zu Coach Isi</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-yellow-500" />
                <span className="text-gray-300 text-sm">Fortschrittstracking & Analytics</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvitationPage;