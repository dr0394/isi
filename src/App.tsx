import React, { useState } from 'react';
import { supabase } from './lib/supabase';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import InvitationPage from './components/InvitationPage';
import RegistrationPage from './components/RegistrationPage';
import RecipeLandingPage from './components/RecipeLandingPage';
import QuickSignupModal from './components/QuickSignupModal';
import { pionierService, adminAuth } from './lib/supabase';
import {
  Dumbbell,
  Star,
  Users,
  Trophy,
  CheckCircle,
  ArrowRight,
  Quote,
  Instagram,
  Mail,
  Clock,
  Brain,
  Smartphone,
  Target,
  Zap,
  Heart,
  Shield,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Menu,
  X,
  Youtube
} from 'lucide-react';

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isRecipeMode, setIsRecipeMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    email: ''
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [showQuickSignup, setShowQuickSignup] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [invitationToken, setInvitationToken] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.firstName && formData.email) {
      try {
        await pionierService.create({
          name: formData.firstName,
          email: formData.email,
          phone: '',
          status: 'new'
        });

        setIsSubmitted(true);
        console.log('Pionier signup successful');
      } catch (error) {
        console.error('Error saving to pionier entries:', error);
        setIsSubmitted(true);
      }
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const testimonials = [
    {
      name: "Sarah M.",
      text: "Es war einfach nur geil! 😍 So viel Mehrwert in kürzester Zeit... mindblowing!! Ich mache gerade eine Ausbildung zur Personal Trainerin und du hast einfach eine copy nach der anderen rausgehauen! Danke Danke Danke 🙏 für alles was du für die Community tust! 💕",
      image: "https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Marcus K.",
      text: "Es war gestern/heute 😴 einfach der Hammer. 🚀💪 Du hast so eine smarte und sympathische Art Dinge einfach zu erklären und auch Dinge auf die es wirklich ankommt ohne drumherum zu labbern. I love it und ich freue mich auf das was kommt!! 🔥 ich bin dir und mir so dankbar für diese Möglichkeiten. Liebe geht raus 🙏",
      image: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Lisa T.",
      text: "Unglaublich inspirierend! Coach Isi hat mir geholfen, meine mentalen Blockaden zu überwinden und endlich konstant zu trainieren. Das 20-Minuten-System funktioniert perfekt für meinen Alltag. Danke für die Transformation! 💪✨",
      image: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Tom R.",
      text: "Nach Jahren des Auf und Ab habe ich endlich ein System gefunden, das funktioniert. Die NLP-Techniken haben mein Mindset komplett verändert. Ich bin nicht nur fitter, sondern auch mental viel stärker geworden. Absolute Empfehlung! 🎯",
      image: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=400"
    },
    {
      name: "Anna W.",
      text: "Isi Coaching hat mein Leben verändert! Endlich habe ich verstanden, wie wichtig die mentale Komponente beim Training ist. Coach Isi erklärt alles so verständlich und motivierend. Bin so dankbar! 🙏💕",
      image: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=400"
    }
  ];

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const faqData = [
    {
      question: "Ist das für Anfänger geeignet?",
      answer: "Ja, es startet bei Null. Du brauchst keine Vorerfahrung – das System ist so aufgebaut, dass jeder einsteigen kann."
    },
    {
      question: "Brauche ich ein Gym?",
      answer: "Nein – alles funktioniert zuhause. Du brauchst nur deinen Körper und eventuell ein paar Basics."
    },
    {
      question: "Wann startet das Programm?",
      answer: "Der offizielle Start ist in Kürze. Warteliste = VIP-Zugang vorher. Du erfährst als Erste/r, wenn es losgeht."
    }
  ];

  // Countdown timer effect
  React.useEffect(() => {
    const targetDate = new Date('2025-08-15T00:00:00').getTime();
    
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };
    
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('invitation');
    if (token) {
      setInvitationToken(token);
      return;
    }

    if (window.location.pathname === '/dashboard') {
      checkUserAuth();
      return;
    }

    if (urlParams.get('recipes') === 'true') {
      setIsRecipeMode(true);
      return;
    }
    
    // Check for admin mode
    if (urlParams.get('admin') === 'true') {
      setIsAdminMode(true);
      // Check if already authenticated
      if (adminAuth.isAuthenticated()) {
        setIsAdminLoggedIn(true);
      }
    }
  }, []);

  const checkUserAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const handleUserLogout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    window.location.href = '/';
  };

  // Show invitation page if token is present
  if (invitationToken) {
    return <InvitationPage token={invitationToken} />;
  }

  // Show user dashboard if user is authenticated and on dashboard route
  if (window.location.pathname === '/dashboard') {
    if (currentUser) {
      return <UserDashboard />;
    } else {
      // Redirect to login or show login form
      window.location.href = '/';
      return null;
    }
  }

  // Recipe mode rendering
  if (isRecipeMode) {
    return <RecipeLandingPage />;
  }

  // Admin mode rendering
  if (isAdminMode) {
    if (!isAdminLoggedIn) {
      return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
    }
    return <AdminDashboard onLogout={() => {
      setIsAdminLoggedIn(false);
      setIsAdminMode(false);
      adminAuth.setAuthenticated(false);
      window.history.replaceState({}, document.title, window.location.pathname);
    }} />;
  }

  // Registration form mode
  if (showRegistrationForm) {
    return <RegistrationPage onBack={() => setShowRegistrationForm(false)} />;
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 w-full bg-black/95 backdrop-blur-sm z-50 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#C6A667' }} />
              <span className="text-lg sm:text-xl font-bold">COACH ISI</span>
            </div>
            
            {/* Mobile Menu Button */}
            <button className="lg:hidden p-2 text-gray-300 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            
            {/* Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <a 
                href="#home" 
                className="text-gray-300 hover:transition-colors font-medium"
                onMouseEnter={(e) => e.target.style.color = '#C6A667'}
                onMouseLeave={(e) => e.target.style.color = ''}
              >
                Home
              </a>
              <a 
                href="#challenges" 
                className="text-gray-300 hover:transition-colors font-medium"
                onMouseEnter={(e) => e.target.style.color = '#C6A667'}
                onMouseLeave={(e) => e.target.style.color = ''}
              
              >
                Testimonials
              </a>
              <a 
                href="#host" 
                className="text-gray-300 hover:transition-colors font-medium"
                onMouseEnter={(e) => e.target.style.color = '#C6A667'}
                onMouseLeave={(e) => e.target.style.color = ''}
              >
                Der Host
              </a>
              <a 
                href="#faq" 
                className="text-gray-300 hover:transition-colors font-medium"
                onMouseEnter={(e) => e.target.style.color = '#C6A667'}
                onMouseLeave={(e) => e.target.style.color = ''}
              >
                FAQ
              </a>
            </nav>
            
            <div className="hidden xl:flex items-left space-x-4">
              <div className="text-xs xl:text-sm text-gray-400">
                Jetzt für die Kostenfreie Pioniergruppe  <span className="font-bold" style={{ color: '#CFC087' }}>bewerben</span>
              </div>
              <button 
                onClick={() => setShowQuickSignup(true)}
                className="px-6 py-2 text-black font-bold rounded-lg transition-all transform hover:scale-105"
                style={{ background: 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)' }}
              >
                Jetzt bewerben
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-800">
              <div className="px-2 pt-2 pb-3 space-y-1">
                <a
                  href="#home"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  Home
                </a>
                <a
                  href="#challenges"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  Testimonials
                </a>
                <a
                  href="#host"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  Der Host
                </a>
                <a
                  href="#faq"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-md transition-colors"
                >
                  FAQ
                </a>
                <button
                  onClick={() => {
                    setShowQuickSignup(true);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 mt-2 font-bold rounded-lg transition-all"
                  style={{ backgroundColor: '#C6A667', color: 'black' }}
                >
                  Jetzt bewerben
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* 1. Hero Section */}
      <section id="home" className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center min-h-[80vh] sm:min-h-[85vh] flex flex-col justify-center space-y-8 sm:space-y-12">  
           

            {/* Logo/Brand */}
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Dumbbell className="w-12 h-12" style={{ color: '#C6A667' }} />
                <div className="text-2xl font-bold tracking-wider" style={{ color: '#C6A667' }}>
                  COACH ISI LOGO
                </div>
              </div>
              <div className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold tracking-wider" style={{ color: '#C6A667' }}>
               <span className="bg-gradient-to-r from-[#CBAA6E] via-[#F3E4A8] to-[#C6A667] bg-clip-text text-transparent">
                 INNER CIRCLE PIONIERGRUPPE
               </span>
              </div>
            </div>

            {/* Main Headlines */}
            <div className="space-y-8 max-w-5xl mx-auto">
              <h1 className="text-2xl sm:text-4xl lg:text-6xl font-bold leading-tight bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Systematisches abnehmen oder
                <br />
                Muskeln aufbauen
              </h1>
           

              
              <div className="space-y-4 text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 italic leading-relaxed px-4">
                <p>Was würdest du tun, wenn dein Körper keine Last mehr wäre, sondern dein größter Antrieb?</p>
                <p>Was würdest du tun, wenn du <span className="font-bold" style={{ color: '#C6A667' }}>10x</span>  mehr Energie, Fokus und Lebensqualität hättest als je zuvor?</p>
                <p className=" sm:block">Genau darum wird es gehen. Wer systematisch an seiner Gesundheit, Kraft und mentalen Stärke arbeitet,</p>
                <p className=" sm:block">hebt sich von der Masse ab. wie du deinen Körper transformierst – nicht mit Motivation, </p>
                <p className=" sm:block">sondern mit System. Wie du dein Energielevel verdoppelst, deine Fitness verdreifachst, und dein Selbstvertrauen verzehnfachst.</p>
                {/* Video Section within Hero */} 
      <section className="py-10 sm:py px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">  
          </div> 
          
          <div className="max-w-4xl mx-auto">
            <div className="aspect-video w-full rounded-xl sm:rounded-3xl overflow-hidden shadow-2xl">
              <iframe 
                width="560" 
                height="315" 
                src="https://www.youtube.com/embed/1npl_hU43NQ?si=gP8vMekwle7GwY_3" 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
                className="w-full h-full"
              />
            </div>
            
            {/* Button directly under video */}
            <div className="flex justify-center pt-4 sm:pt-6">
              <button 
                onClick={() => setShowQuickSignup(true)}
                className="inline-flex items-center px-6 py-3 rounded-full text-lg font-medium transition-all cursor-pointer text-black hover:scale-105"
                style={{ background: 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)' }}
              >
                <span className="hidden sm:inline">Jetzt bewerben für die Inner Circle Pioniergruppe ▶</span>
                <span className="sm:hidden">Jetzt bewerben ▶</span>
              </button>
            </div>
          </div>
        </div>
      </section>
              </div>
            </div> 

            

          </div>
        </div>
      </section> 

      

      {/* Banner Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-black leading-relaxed px-4">
              Trage dich in die Warteliste ein, um direkt benachrichtigt zu werden, wenn die
              <br className="hidden sm:block" />
              Inner Circle Pioniergruppe beginnt.
            </p>
            
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-8">
              <button 
                onClick={() => setShowQuickSignup(true)}
                className="inline-flex items-center px-8 py-4 rounded-full text-xl font-bold transition-all cursor-pointer hover:scale-105"
                style={{ 
                  background: 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)',
                  color: 'black'
                }}
              >
                <span className="hidden sm:inline">Jetzt bewerben für die Inner Circle Pioniergruppe ▶</span>
                <span className="sm:hidden">Jetzt bewerben ▶</span>
              </button>
              
              <div className="flex items-center space-x-3 sm:space-x-6">
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black  rounded-full flex items-center justify-center text-lg sm:text-xl font-bold" style={{ color: '#E6D8A3' }}>
                    {timeLeft.days.toString().padStart(2, '0')}
                  </div>
                  <div className="text-black text-xs sm:text-sm font-semibold mt-1 sm:mt-2">TAGE</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-lg sm:text-xl font-bold" style={{ color: '#C6A667' }}>
                    {timeLeft.hours.toString().padStart(2, '0')}
                  </div>
                  <div className="text-black text-xs sm:text-sm font-semibold mt-1 sm:mt-2">STUNDEN</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-lg sm:text-xl font-bold" style={{ color: '#C6A667' }}>
                    {timeLeft.minutes.toString().padStart(2, '0')}
                  </div>
                  <div className="text-black text-xs sm:text-sm font-semibold mt-1 sm:mt-2">MINUTEN</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center text-lg sm:text-xl font-bold" style={{ color: '#C6A667' }}>
                    {timeLeft.seconds.toString().padStart(2, '0')}
                  </div>
                  <div className="text-black text-xs sm:text-sm font-semibold mt-1 sm:mt-2">SEKUNDEN</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Challenges Section */}
      <section id="challenges" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Woran scheitert es immer wieder, 

              <br className="hidden sm:block" />
              obwohl du weißt, was du willst?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 lg:gap-16">
            {/* Challenge 1 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">1</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}>Ich weiß, was ich tun sollte, aber ich tue es nicht.</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  
Du kennst die Basics. Gesunde Ernährung. Bewegung. Schlaf. Aber zwischen Wissen und Umsetzung liegt eine Lücke, die du bisher nicht überbrücken konntest.
                </p>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">2</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}> ⁠Ich starte motiviert und höre nach ein paar Tagen wieder auf.

</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Du bist kein Anfänger. Du hast schon zig Versuche gestartet. Aber nichts bleibt dauerhaft. Dir fehlt das System, das dich auch dann trägt, wenn der Alltag hart wird.
                </p>
              </div>
            </div>

            {/* Challenge 3 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">3</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}>⁠Ich will Ergebnisse, aber nicht nochmal aufgeben.
</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Du hast keine Lust mehr, wieder voll reinzugehen… nur um dich zwei Wochen später enttäuscht im Spiegel anzuschauen. Du willst, dass es dieses Mal wirklich funktioniert.

                </p>
              </div>
            </div>

            {/* Challenge 4 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">4</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}>⁠Ich sehe andere fitter werden und frage mich, warum ich es nicht schaffe.
</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Du vergleichst dich ständig. Online, im Gym, im Freundeskreis. Und immer wieder diese Frage: „Was machen die anders?" Die Antwort: Sie haben ein System. Du bald auch.

                </p>
              </div>
            </div>

            {/* Challenge 5 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">5</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}> ⁠Ich will nicht perfekt sein, ich will echt etwas verändern.
</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Keine Diät mehr, die dich kaputtmacht. Kein Trainingsplan, der unrealistisch ist. Du willst dich bewegen, essen, regenerieren… so, dass es zu deinem Leben passt.
                </p>
              </div>
            </div>

            {/* Challenge 6 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">6</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}>Ich will mich nicht mehr schämen, wenn ich in den Spiegel schaue.
</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Kein Gefühl mehr von „Ich bin nicht gut genug". Du willst dich im Spiegel anschauen und nicht nur deinen Körper sehen, sondern deine Arbeit, deinen Stolz, deinen Weg.

                </p>
              </div>
            </div>

            {/* Challenge 7 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">7</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}>Ich habe Angst, dass es wieder nur eine Phase ist.
</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Du hast vielleicht schon mal abgenommen, bist mal fit gewesen. Aber es ist gekippt. Und jetzt willst du wissen: „Wie schaffe ich das, was bleibt?"

                </p>
              </div>
            </div>

            {/* Challenge 8 */}
            <div className="flex items-start space-x-4 sm:space-x-6">
              <div className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold text-gray-600 leading-none flex-shrink-0">8</div>
              <div className="space-y-4 pt-4">
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold" style={{ color: '#CFC087' }}>⁠Ich will frei sein, von Gewicht, von Ausreden, von innerem Chaos.
</h3>
                <p className="text-gray-300 text-sm sm:text-base md:text-lg leading-relaxed">
                  Gesundheit ist für dich kein Ideal mehr. Es ist ein Bedürfnis geworden. Du willst klar denken, kraftvoll handeln, ruhig schlafen… in einem Körper, der dich nicht ausbremst.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 px-4 sm:px-6 lg:px-8 text-black" style={{ background: 'linear-gradient(to bottom right, #F5F2E8, #F0EDD6)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent">
              Das wirst du im Inner Circle Pioniergruppen Training lernen:
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-700 leading-relaxed max-w-5xl mx-auto px-4">
              Durch das Online livetraining baust du die perfekte Grundlage,


              <br className="hidden sm:block" />
              um deine körperliche und mentale Zukunft nach deinen eigenen Regeln zu gestalten.
Ob du Fett verlieren, Muskeln aufbauen oder einfach wieder in deine Kraft kommen willst!
            </p>
            <div className="w-32 h-1 mx-auto mt-8" style={{ backgroundColor: '#CFC087' }}></div>
          </div>
          
          <div className="space-y-8 max-w-5xl mx-auto">
            {/* Benefit 1 */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#CFC087' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                 Du wirst lernen, wie du ein starkes Vertrauen in deinen Körper entwickelst, damit du dich sicher, energievoll und leistungsfähig fühlst… in jeder Lebenslage.

              </p>
            </div>

            {/* Benefit 2 */}
<div className="flex items-start space-x-4">
  <div 
    className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" 
    style={{ backgroundColor: '#CFC087' }}
  >
    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
      <path 
        fillRule="evenodd" 
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
        clipRule="evenodd" 
      />
    </svg>
  </div>
  <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
    Wir zeigen dir klare Strategien, mit denen du nachhaltig abnehmen oder Muskeln aufbauen kannst,
    ohne ständiges Kalorienzählen, Verzicht oder Frust.
  </p>
</div>


            {/* Benefit 3 */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#CFC087' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                Du entwickelst Routinen, die zu dir passen, damit dein Training & deine Ernährung nicht nur starten, sondern langfristig funktionieren.

              </p>
            </div>

            {/* Benefit 4 */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#CFC087' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                Du wirst Fähigkeiten aufbauen, um innere Einwände wie „keine Zeit", „bringt eh nix" oder „ich schaff das eh nicht"
zu erkennen, umzuprogrammieren und zu überwinden.

              </p>
            </div>

            {/* Benefit 5 */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#CFC087' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                Diese Skills stärken dein Selbstvertrauen, deine Disziplin und deine Ausstrahlung… nicht nur im Gym, sondern im Alltag, im Job, in Beziehungen.

              </p>
            </div>

            {/* Benefit 6 */}
            <div className="flex items-start space-x-4">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#CFC087' }}>
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-base sm:text-lg lg:text-xl text-gray-700 leading-relaxed">
                Du lernst, mit Rückschlägen umzugehen und weiterzumachen, auch wenn die Waage mal stillsteht oder das Spiegelbild sich langsamer verändert, als du willst.

              </p>
            </div>
          </div>

          {/* Bottom highlight box */}
          <div className="mt-16 bg-gray-800 rounded-2xl p-6 sm:p-8 lg:p-12 text-center">
            <p className="text-lg sm:text-xl lg:text-2xl font-medium leading-relaxed" style={{ color: '#CFC087' }}>
              Du bekommst einen klaren, wiederholbaren Blueprint,
mit dem du deinen Körper Schritt für Schritt formst… Ob du Fett verbrennen, Muskulatur aufbauen oder einfach definierter werden willst. Am Ende wird dein Körper das sichtbarste Ergebnis deiner neuen Identität sein… nicht, weil du dich für ihn gequält hast, sondern weil du gelernt hast, ihn zu führen!

            </p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-8 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Was bisherige Teilnehmer über 
              <br className="hidden sm:block" />
              <span style={{ color: '#CFC087' }}>Isi's Pioniergruppe</span> sagen:
            </h2>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            {/* Main testimonial display */}
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-12 border border-gray-700">
              <div className="flex flex-col lg:flex-row items-center gap-8">
                {/* Profile image */}
                <div className="flex-shrink-0">
                  <img 
                    src={testimonials[currentTestimonial].image}
                    alt={testimonials[currentTestimonial].name}
                    className="w-24 h-24 lg:w-32 lg:h-32 rounded-full object-cover border-4"
                    style={{ borderColor: '#CFC087' }}
                  />
                </div>
                
                {/* Testimonial content */}
                <div className="flex-1 text-center lg:text-left">
                  <Quote className="w-8 h-8 mb-4 mx-auto lg:mx-0" style={{ color: '#CFC087' }} />
                  <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed mb-6">
                    {testimonials[currentTestimonial].text}
                  </p>
                  <div className="font-bold text-lg sm:text-xl" style={{ color: '#CFC087' }}>
                    {testimonials[currentTestimonial].name}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <button
              onClick={prevTestimonial}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-black transition-colors z-10"
              style={{ backgroundColor: '#CFC087' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#CFC087'}
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            
            <button
              onClick={nextTestimonial}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-black transition-colors z-10"
              style={{ backgroundColor: '#CFC087' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#CFC087'}
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Dots indicator */}
            <div className="flex justify-center mt-8 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className="w-3 h-3 rounded-full transition-all hover:scale-125"
                  style={{ 
                    background: index === currentTestimonial 
                      ? 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)' 
                      : '#4B5563'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Thumbnail slider */}
          <div className="mt-8 sm:mt-12 max-w-6xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {testimonials.map((testimonial, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className="relative group overflow-hidden rounded-xl transition-all hover:scale-105"
                  style={{ 
                    transform: index === currentTestimonial ? 'scale(1.05)' : 'scale(1)',
                    opacity: index === currentTestimonial ? '1' : '0.7',
                    outline: index === currentTestimonial ? '4px solid #CFC087' : 'none'
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = '1'}
                  onMouseLeave={(e) => {
                    if (index !== currentTestimonial) {
                      e.target.style.opacity = '0.7';
                    }
                  }}
                >
                  <img 
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-full aspect-square object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-1 sm:bottom-2 left-1 sm:left-2 right-1 sm:right-2">
                    <div className="text-white font-semibold text-sm truncate">
                      {testimonial.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing/Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Dumbbell className="w-8 h-8" style={{ color: '#CFC087' }} />
                <div className="text-xl font-bold tracking-wider" style={{ color: '#CFC087' }}>
                  COACH ISI LOGO
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold tracking-wider" style={{ color: '#CFC087' }}>
                INNER CIRCLE PIONIERGRUPPE
              </div>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Bewirb dich und trage dich in die Warteliste ein, um direkt benachrichtigt zu werden, wenn die nächste Inner Circle Pioniergruppe startet.
            </p>
            
            {!isSubmitted ? (
              <button
                onClick={() => setShowQuickSignup(true)}
                className="px-12 py-4 text-black font-bold text-xl rounded-lg transition-all transform hover:scale-105"
                style={{ backgroundColor: '#CFC087' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#CFC087'}
              >
                Jetzt zur Anmeldung
              </button>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-4">Willkommen auf der Warteliste!</h3>
                <p className="text-gray-300">
                  Du erhältst eine E-Mail, sobald das Programm verfügbar ist. 
                  Als einer der ersten 100 bekommst du exklusiven Zugang + Bonus!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Host Section */}
      <section id="host" className="py-20 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F4F2E7' }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left side - Content */}
            <div className="space-y-8">
              <div className="space-y-6">
                <div className="text-base sm:text-lg font-semibold tracking-wider text-black">
                  PRESENTED BY
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent">
                  Der Host
                </h2>
                
                <div className="space-y-4 sm:space-y-6 text-black text-base sm:text-lg leading-relaxed">
                  <p>
                    Ismael Arco Gonzalez ist Sohn, Bruder und Suchender, der seinen eigenen Weg gegangen ist – durch Höhen und Tiefen, Selbstzweifel, Schmerz und Transformation.
                    Sein Ziel ist klar: Menschen zurück zu sich selbst zu führen – körperlich, mental und emotional.
                  </p>
                  
                  <p>
                    Was als persönlicher Kampf begann, ist heute seine Mission.
                    Isi begleitet Menschen, die sich verloren haben, zurück in ihre Kraft.
                    Nicht mit leeren Versprechen, sondern mit echtem Coaching, klarer Struktur und einer Botschaft, die sitzt:
                    Stärke beginnt im Inneren.
                  </p>
                  
                 
                  
                  <div className="space-y-4 text-black text-base sm:text-lg leading-relaxed">
                    <p>
                      In seiner neuen „Inner Circle Pioniergruppe" gibt Isi exklusive Einblicke in sein bewegtes Leben – mit allen Rückschlägen, Wendepunkten und Learnings.
                      Er spricht über Selbstachtung, Disziplin, Fitness, Heilung und mentale Klarheit.
                      Und teilt seine Methoden, mit denen er schon im 1:1 Coaching dutzenden Menschen geholfen hat,
                      sich selbst wiederzufinden – körperlich wie mental.
                    </p>
                    
                    <p>
                      Gemeinsam mit Menschen, die ihren Körper nicht länger als Problem sehen wollen,
                      sondern als Fundament für ein starkes Leben,
                      zeigt er, wie man sich von Selbstzweifeln löst, wieder aufsteht
                      und Schritt für Schritt ein neues Selbstbild formt.
                    </p>
                    
                    <p>
                      Dieses Format ist für alle,
                      die nicht auf Motivation warten – sondern Verantwortung übernehmen.
                      Für Menschen, die ihr Leben selbst in die Hand nehmen wollen –
                      egal, wo sie gerade stehen.
                    </p>
                    
                    <p className="font-medium text-gray-800">
                      Seine Familie, Freunde und Wegbegleiter sagen:
                      „Isi – vom Selbstzweifel zur Selbstachtung."
                    </p>
                    
                    <p className="text-black-800 font-semibold">
                      Komm mit auf diese Reise.
                      Und werde Teil der Inner Circle Pioniergruppe.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right side - Image */}
            <div className="relative">
              <div className="aspect-[4/5] bg-black/10 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden relative">
                  <img 
                    src="https://i.imgur.com/RLLFH55.jpeg"
                    alt="Ismael Arco Gonzalez - Coach Isi"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  
                  {/* Name overlay */}
                  <div className="absolute bottom-4 sm:bottom-8 left-4 sm:left-8 right-4 sm:right-8 text-center">
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">
                      Ismael Arco Gonzalez
                    </div>
                    <div className="text-base sm:text-lg font-medium" style={{ color: '#CFC087' }}>
                      Coach Isi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

 
      {/* Pricing/Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <Dumbbell className="w-8 h-8" style={{ color: '#CFC087' }} />
                <div className="text-xl font-bold tracking-wider" style={{ color: '#CFC087' }}>
                  COACH ISI LOGO
                </div>
              </div>
              <div className="text-3xl lg:text-4xl font-bold tracking-wider" style={{ color: '#CFC087' }}>
                INNER CIRCLE PIONIERGRUPPE
              </div>
            </div>
            
            <p className="text-xl lg:text-2xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Bewirb dich und trage dich in die Warteliste ein, um direkt benachrichtigt zu werden, wenn die nächste Inner Circle Pioniergruppe startet.
            </p>
            
            {!isSubmitted ? (
              <button
                onClick={() => setShowQuickSignup(true)}
                className="px-12 py-4 text-black font-bold text-xl rounded-lg transition-all transform hover:scale-105"
                style={{ backgroundColor: '#CFC087' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#B8A76B'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#CFC087'}
              >
                Jetzt zur Anmeldung
              </button>
            ) : (
              <div className="bg-green-500/10 border border-green-500/20 rounded-2xl p-8 max-w-md mx-auto">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-green-400 mb-4">Willkommen auf der Warteliste!</h3>
                <p className="text-gray-300">
                  Du erhältst eine E-Mail, sobald das Programm verfügbar ist. 
                  Als einer der ersten 100 bekommst du exklusiven Zugang + Bonus!
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Social Media Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" style={{ background: 'linear-gradient(to right, #CBAA6E, #F3E4A8, #C6A667)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <div className="space-y-8">
            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-gray-900 via-black to-gray-900 bg-clip-text text-transparent">
              Folge Coach Isi auf Social Media
            </h3>
            <p className="text-base sm:text-lg text-black/80">
              Bleib auf dem Laufenden und erhalte täglich Motivation und Tipps
            </p>
            
            <div className="flex justify-center items-center space-x-6 sm:space-x-8">
              <a 
                href="#" 
                className="group flex flex-col items-center space-y-2 hover:scale-110 transition-transform"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center transition-colors"
                     onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                     onMouseLeave={(e) => e.target.style.backgroundColor = 'black'}>
                  <Instagram className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#CFC087' }} />
                </div>
                <span className="text-black font-semibold text-sm sm:text-base">Instagram</span>
              </a>
              
              <a 
                href="#" 
                className="group flex flex-col items-center space-y-2 hover:scale-110 transition-transform"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center transition-colors"
                     onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                     onMouseLeave={(e) => e.target.style.backgroundColor = 'black'}>
                  <svg className="w-6 h-6 sm:w-8 sm:h-8" fill="#CFC087" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </div>
                <span className="text-black font-semibold text-sm sm:text-base">TikTok</span>
              </a>
              
              <a 
                href="#" 
                className="group flex flex-col items-center space-y-2 hover:scale-110 transition-transform"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-black rounded-full flex items-center justify-center transition-colors"
                     onMouseEnter={(e) => e.target.style.backgroundColor = '#374151'}
                     onMouseLeave={(e) => e.target.style.backgroundColor = 'black'}>
                  <Youtube className="w-6 h-6 sm:w-8 sm:h-8" style={{ color: '#CFC087' }} />
                </div>
                <span className="text-black font-semibold text-sm sm:text-base">YouTube</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQ */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              Vertrauen & <span style={{ color: '#CFC087' }}>FAQ</span>
            </h2>
          </div>
          
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <div key={index} className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-8 py-4 sm:py-6 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                >
                  <span className="text-base sm:text-lg font-semibold pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="w-5 h-5" style={{ color: '#CFC087' }} />
                  ) : (
                    <ChevronDown className="w-5 h-5" style={{ color: '#CFC087' }} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-4 sm:px-8 pb-4 sm:pb-6">
                    <p className="text-gray-300 text-sm sm:text-base">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-8 h-8" style={{ color: '#CFC087' }} />
                <span className="text-lg sm:text-xl font-bold">COACH ISI</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base">
                Dein Partner für nachhaltige Körpertransformation 
                und mentale Stärke.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-base sm:text-lg">Kontakt</h4>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  <span>team@coachisi.de</span>
                </div>
                <div className="flex items-center">
                  <Instagram className="w-4 h-4 mr-2" />
                  <span>@coach.isi.official</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                  <span>@coach.isi</span>
                </div>
                <div className="flex items-center">
                  <Youtube className="w-4 h-4 mr-2" />
                  <span>Coach Isi</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-base sm:text-lg">Programm</h4>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <div>20-Min Workouts</div>
                <div>NLP-Mindset Training</div>
                <div>Ernährungscoaching</div>
                <div>Community Support</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-base sm:text-lg">Rechtliches</h4>
              <div className="space-y-2 text-gray-400 text-sm sm:text-base">
                <div>Impressum</div>
                <div>Datenschutz</div>
                <div>AGB</div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2024 Coach Isi. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>

      {/* Quick Signup Modal */}
      <QuickSignupModal 
        isOpen={showQuickSignup} 
        onClose={() => setShowQuickSignup(false)} 
      />
    </div>
  );
}

export default App;