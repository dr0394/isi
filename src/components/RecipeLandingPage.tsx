import React, { useState, useEffect } from 'react';
import { 
  Dumbbell, 
  Download, 
  CheckCircle, 
  User, 
  Mail, 
  Star,
  Clock,
  Users,
  Gift,
  ArrowRight,
  FileText,
  Zap,
  Heart,
  Target
} from 'lucide-react';
import { recipeService, Recipe } from '../lib/supabase';

const RecipeLandingPage: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const activeRecipes = await recipeService.getActiveRecipes();
      setRecipes(activeRecipes);
    } catch (err) {
      console.error('Error loading recipes:', err);
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

  const handleDownload = async (recipe: Recipe) => {
    if (!formData.name || !formData.email) {
      setError('Bitte füllen Sie alle Felder aus.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Track the download
      await recipeService.createDownload({
        recipe_id: recipe.id,
        name: formData.name,
        email: formData.email,
        source: 'recipe-page',
        utm_source: new URLSearchParams(window.location.search).get('utm_source') || undefined,
        utm_medium: new URLSearchParams(window.location.search).get('utm_medium') || undefined,
        utm_campaign: new URLSearchParams(window.location.search).get('utm_campaign') || undefined,
        landing_page_url: window.location.href,
        referrer: document.referrer || undefined,
        user_agent: navigator.userAgent,
        ip_address: undefined // Will be handled server-side if needed
      });

      // Increment download count
      await recipeService.incrementDownloadCount(recipe.id);

      // Trigger download
      const link = document.createElement('a');
      link.href = recipe.file_url;
      link.download = recipe.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsSubmitted(true);
    } catch (err) {
      console.error('Error downloading recipe:', err);
      setError('Fehler beim Download. Bitte versuchen Sie es erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#C6A667' }}></div>
          <p className="text-gray-400">Lade Rezepte...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-8 h-8" style={{ color: '#C6A667' }} />
              <span className="text-xl font-bold">COACH ISI</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-sm text-gray-400">
                Kostenlose <span className="font-bold" style={{ color: '#C6A667' }}>Fitness Rezepte</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Logo/Brand */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Dumbbell className="w-12 h-12" style={{ color: '#C6A667' }} />
                <div className="text-2xl font-bold tracking-wider" style={{ color: '#C6A667' }}>
                  COACH ISI
                </div>
              </div>
              <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-full text-yellow-500 text-sm font-medium">
                <Gift className="w-4 h-4 mr-2" />
                Kostenloser Download
              </div>
            </div>

            {/* Main Headlines */}
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-4xl lg:text-6xl font-bold text-white leading-tight">
                Fitness Rezepte für
                <br />
                <span style={{ color: '#C6A667' }}>Body & Mind Upgrade</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed">
                Entdecke leckere und gesunde Rezepte, die dich auf deinem Weg zu einem stärkeren Körper und Geist unterstützen. 
                Entwickelt von Coach Isi für maximale Ergebnisse.
              </p>
            </div>

            {/* Benefits */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto mt-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8" style={{ color: '#C6A667' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Energie Boost</h3>
                <p className="text-gray-400">Rezepte für mehr Energie und Fokus im Alltag</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8" style={{ color: '#C6A667' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ziel-orientiert</h3>
                <p className="text-gray-400">Perfekt abgestimmt auf deine Fitness-Ziele</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="w-8 h-8" style={{ color: '#C6A667' }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Gesund & Lecker</h3>
                <p className="text-gray-400">Nährstoffreich und trotzdem richtig lecker</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recipe Selection & Download Form */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-4xl mx-auto">
          {!isSubmitted ? (
            <div className="space-y-12">
              {/* Available Recipes */}
              {recipes.length > 0 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                      Verfügbare Rezept-Sammlungen
                    </h2>
                    <p className="text-gray-400 text-lg">
                      Wähle deine gewünschte Rezept-Sammlung und lade sie kostenlos herunter
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    {recipes.map((recipe) => (
                      <div
                        key={recipe.id}
                        className={`bg-gray-800 rounded-2xl p-6 border-2 transition-all cursor-pointer ${
                          selectedRecipe?.id === recipe.id
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-gray-700 hover:border-gray-600'
                        }`}
                        onClick={() => setSelectedRecipe(recipe)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-6 h-6" style={{ color: '#C6A667' }} />
                          </div>
                          
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-white mb-2">{recipe.title}</h3>
                            {recipe.description && (
                              <p className="text-gray-400 mb-4">{recipe.description}</p>
                            )}
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center">
                                  <Download className="w-4 h-4 mr-1" />
                                  {recipe.download_count} Downloads
                                </div>
                                <div className="flex items-center">
                                  <FileText className="w-4 h-4 mr-1" />
                                  {Math.round(recipe.file_size / 1024)} KB
                                </div>
                              </div>
                              
                              {selectedRecipe?.id === recipe.id && (
                                <div className="flex items-center text-yellow-500">
                                  <CheckCircle className="w-5 h-5 mr-1" />
                                  <span className="text-sm font-medium">Ausgewählt</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Download Form */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-700">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">
                    Jetzt kostenlos herunterladen
                  </h3>
                  <p className="text-gray-400">
                    Gib deine Daten ein und erhalte sofortigen Zugang zu den Rezepten
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Vollständiger Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="Dein vollständiger Name"
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
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 transition-colors"
                        placeholder="deineemail@beispiel.de"
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => selectedRecipe && handleDownload(selectedRecipe)}
                    disabled={isSubmitting || !selectedRecipe || !formData.name || !formData.email}
                    className="w-full py-4 px-6 font-bold rounded-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    style={{ backgroundColor: '#C6A667', color: 'black' }}
                    onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#B8A76B')}
                    onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.backgroundColor = '#C6A667')}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                        Wird heruntergeladen...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        {selectedRecipe ? `${selectedRecipe.title} herunterladen` : 'Rezept auswählen'}
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Deine Daten werden vertraulich behandelt und nur für den Download verwendet.
                </p>
              </div>
            </div>
          ) : (
            /* Success State */
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-500/10 to-green-400/10 rounded-3xl p-2 border border-green-500/30 mb-8">
                <div className="bg-black rounded-2xl p-12">
                  <CheckCircle className="w-20 h-20 text-green-400 mx-auto mb-6" />
                  
                  <h2 className="text-3xl lg:text-4xl font-bold text-green-400 mb-6">
                    Download erfolgreich!
                  </h2>
                  
                  <div className="space-y-4 text-lg text-gray-300 mb-8">
                    <p>
                      Vielen Dank! Dein Download sollte automatisch gestartet sein. 
                      Falls nicht, überprüfe bitte deinen Download-Ordner.
                    </p>
                    <p>
                      Du erhältst außerdem eine E-Mail mit dem Download-Link und weiteren 
                      exklusiven Tipps von Coach Isi.
                    </p>
                  </div>

                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-bold text-yellow-500 mb-3">Was kommt als Nächstes?</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">1</div>
                        <p className="text-gray-300">Probiere die Rezepte aus und teile deine Erfahrungen</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">2</div>
                        <p className="text-gray-300">Folge Coach Isi auf Social Media für weitere Tipps</p>
                      </div>
                      <div className="flex items-start">
                        <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-black text-sm font-bold mr-3 mt-0.5">3</div>
                        <p className="text-gray-300">Bewirb dich für die Inner Circle Pioniergruppe</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <button
                      onClick={() => window.location.href = '/'}
                      className="inline-flex items-center px-8 py-3 font-bold rounded-lg transition-all"
                      style={{ backgroundColor: '#C6A667', color: 'black' }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#C6A667'}
                    >
                      Zur Inner Circle Pioniergruppe
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                    
                    <div className="text-sm text-gray-400">
                      oder lade weitere Rezepte herunter
                    </div>
                    
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setFormData({ name: '', email: '' });
                        setSelectedRecipe(null);
                      }}
                      className="text-yellow-500 hover:text-yellow-400 transition-colors"
                    >
                      Weitere Rezepte herunterladen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-6">
            <h3 className="text-2xl lg:text-3xl font-bold text-black">
              Schließe dich tausenden zufriedenen Nutzern an
            </h3>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">10,000+</div>
                <div className="text-black/80">Downloads</div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">4.9/5</div>
                <div className="text-black/80 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-current mr-1" />
                  Bewertung
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-4xl font-bold text-black mb-2">500+</div>
                <div className="text-black/80">Erfolgsgeschichten</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <Dumbbell className="w-8 h-8" style={{ color: '#C6A667' }} />
              <span className="text-xl font-bold">COACH ISI</span>
            </div>
            <p className="text-gray-400">
              Dein Partner für nachhaltige Körpertransformation und mentale Stärke.
            </p>
            <div className="text-center text-gray-400">
              <p>&copy; 2024 Coach Isi. Alle Rechte vorbehalten.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RecipeLandingPage;