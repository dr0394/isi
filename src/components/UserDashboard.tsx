import React, { useState, useEffect } from 'react';
import { 
  User, 
  Calendar, 
  Target, 
  TrendingUp, 
  BookOpen, 
  MessageSquare,
  Settings,
  LogOut,
  Bell,
  Award,
  Activity,
  Heart,
  Zap,
  Clock,
  CheckCircle,
  Star,
  Download,
  Play,
  Lock,
  Unlock,
  ChevronRight,
  Dumbbell
} from 'lucide-react';
import { userService, User as UserType } from '../lib/supabase';
import { supabase } from '../lib/supabase';

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await userService.getCurrentUser();
      setUser(userData);
      
      if (userData) {
        await userService.updateLastLogin(userData.user_id);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Lade Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Zugang verweigert</h2>
          <p className="text-gray-600 mb-6">Sie haben keinen gültigen Zugang zum Dashboard.</p>
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

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    { id: 'training', label: 'Training', icon: Dumbbell },
    { id: 'nutrition', label: 'Ernährung', icon: Heart },
    { id: 'progress', label: 'Fortschritt', icon: TrendingUp },
    { id: 'community', label: 'Community', icon: MessageSquare },
    { id: 'resources', label: 'Ressourcen', icon: BookOpen },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Dumbbell className="w-8 h-8 text-yellow-500" />
            <div>
              <div className="text-lg font-bold">COACH ISI</div>
              <div className="text-sm text-gray-400">Inner Circle</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-black" />
            </div>
            <div>
              <div className="font-medium">{user.pionier_entries?.name}</div>
              <div className="text-sm text-gray-400">Pionier Mitglied</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6">
          <div className="space-y-2 px-3">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? 'bg-yellow-500 text-black'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Abmelden</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {navigationItems.find(item => item.id === activeSection)?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-gray-500">
                Willkommen zurück, {user.pionier_entries?.name?.split(' ')[0]}!
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500">
                Letzter Login: {user.last_login ? new Date(user.last_login).toLocaleDateString('de-DE') : 'Erstmalig'}
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Welcome Card */}
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl p-6 text-black">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">
                      Willkommen in der Inner Circle Pioniergruppe!
                    </h2>
                    <p className="text-black/80">
                      Du bist einer der ersten 100 Teilnehmer. Lass uns gemeinsam deine Transformation starten!
                    </p>
                  </div>
                  <Award className="w-16 h-16 text-black/20" />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktuelle Ziele</p>
                      <p className="text-2xl font-bold text-gray-900">3</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Trainings diese Woche</p>
                      <p className="text-2xl font-bold text-gray-900">4</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Streak</p>
                      <p className="text-2xl font-bold text-gray-900">12 Tage</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Fortschritt</p>
                      <p className="text-2xl font-bold text-gray-900">78%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Heute geplant</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Dumbbell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Oberkörper Training</div>
                          <div className="text-xs text-gray-500">45 Minuten • 16:00 Uhr</div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800">
                          <Play className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                          <Heart className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-gray-900">Ernährungsplan</div>
                          <div className="text-xs text-gray-500">Mahlzeiten für heute</div>
                        </div>
                        <button className="text-green-600 hover:text-green-800">
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Neueste Updates</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Neues Workout verfügbar</div>
                          <div className="text-xs text-gray-500">vor 2 Stunden</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Community Challenge gestartet</div>
                          <div className="text-xs text-gray-500">vor 1 Tag</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Ernährungsplan aktualisiert</div>
                          <div className="text-xs text-gray-500">vor 3 Tagen</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other sections would be implemented here */}
          {activeSection !== 'dashboard' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {React.createElement(navigationItems.find(item => item.id === activeSection)?.icon || Activity, {
                  className: "w-8 h-8 text-gray-400"
                })}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {navigationItems.find(item => item.id === activeSection)?.label}
              </h3>
              <p className="text-gray-600">
                Dieser Bereich wird bald verfügbar sein. Wir arbeiten daran, dir die beste Erfahrung zu bieten!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;