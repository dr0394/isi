import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Download, 
  Mail, 
  Calendar, 
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  UserPlus,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  AlertCircle,
  Phone,
  User,
  Home,
  FileText,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  Plus,
  BarChart3,
  Globe,
  Tag,
  Activity,
  Dumbbell,
  X
} from 'lucide-react';
import { pionierService, recipeService, PionierEntry, RecipeDownload, Recipe } from '../lib/supabase';

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // Pionier data
  const [pionierEntries, setPionierEntries] = useState<PionierEntry[]>([]);
  const [pionierStats, setPionierStats] = useState({ total: 0 });
  
  // Recipe data
  const [recipeDownloads, setRecipeDownloads] = useState<RecipeDownload[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [recipeStats, setRecipeStats] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    bySource: {}
  });
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEntries, setSelectedEntries] = useState<string[]>([]);
  const [editingEntry, setEditingEntry] = useState<any>(null);
  const [showAddRecipe, setShowAddRecipe] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    description: '',
    file_url: '',
    file_name: '',
    file_size: 0,
    is_active: true
  });

  // Load all data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [
        pionierData,
        pionierStatsData,
        recipeDownloadsData,
        recipesData,
        recipeStatsData
      ] = await Promise.all([
        pionierService.getAll(),
        pionierService.getStats(),
        recipeService.getAllDownloads(),
        recipeService.getAllRecipes(),
        recipeService.getDownloadStats()
      ]);
      
      setPionierEntries(pionierData);
      setPionierStats(pionierStatsData);
      setRecipeDownloads(recipeDownloadsData);
      setRecipes(recipesData);
      setRecipeStats(recipeStatsData);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Fehler beim Laden der Daten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter functions
  const filteredPionierEntries = pionierEntries.filter(entry => {
    const matchesSearch = entry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.phone.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const filteredRecipeDownloads = recipeDownloads.filter(download => {
    const matchesSearch = download.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         download.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // CRUD operations
  const handleDeletePionierEntry = async (entryId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) return;
    
    try {
      await pionierService.delete(entryId);
      await loadData();
    } catch (err) {
      console.error('Error deleting entry:', err);
      setError('Fehler beim Löschen des Eintrags.');
    }
  };

  const handleCreateInvitation = async (entryId: string) => {
    if (!confirm('Möchten Sie eine Einladung für diesen Bewerber erstellen?')) return;
    
    try {
      const invitationId = await pionierService.createInvitation(entryId);
      
      // Update status to invited
      await pionierService.updateStatus(entryId, 'invited', 'Admin', 'Einladung erstellt');
      
      await loadData();
      alert('Einladung erfolgreich erstellt!');
    } catch (err) {
      console.error('Error creating invitation:', err);
      setError('Fehler beim Erstellen der Einladung.');
    }
  };

  const handleStatusUpdate = async (entryId: string, newStatus: string) => {
    try {
      const result = await pionierService.updateStatus(entryId, newStatus, 'Admin');
      if (result === null) {
        setError('Eintrag wurde nicht gefunden oder bereits gelöscht. Bitte aktualisieren Sie die Seite.');
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Fehler beim Aktualisieren des Status.');
    } finally {
      await loadData();
    }
  };
  const handleDeleteRecipe = async (recipeId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie dieses Rezept löschen möchten?')) return;
    
    try {
      await recipeService.deleteRecipe(recipeId);
      await loadData();
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError('Fehler beim Löschen des Rezepts.');
    }
  };

  const handleAddRecipe = async () => {
    try {
      await recipeService.createRecipe(newRecipe);
      setShowAddRecipe(false);
      setNewRecipe({
        title: '',
        description: '',
        file_url: '',
        file_name: '',
        file_size: 0,
        is_active: true
      });
      await loadData();
    } catch (err) {
      console.error('Error adding recipe:', err);
      setError('Fehler beim Hinzufügen des Rezepts.');
    }
  };

  const exportPionierData = () => {
    const csvContent = [
      ['Name', 'Email', 'Telefon', 'Status', 'Quelle', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Angemeldet am'],
      ...filteredPionierEntries.map(entry => [
        entry.name,
        entry.email,
        entry.phone,
        entry.status || 'new',
        entry.source || 'direct',
        entry.utm_source || '',
        entry.utm_medium || '',
        entry.utm_campaign || '',
        new Date(entry.created_at).toLocaleDateString('de-DE')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pionier-leads-export.csv';
    a.click();
  };

  const exportRecipeData = () => {
    const csvContent = [
      ['Name', 'Email', 'Rezept', 'Quelle', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Heruntergeladen am'],
      ...filteredRecipeDownloads.map(download => [
        download.name,
        download.email,
        recipes.find(r => r.id === download.recipe_id)?.title || 'Unbekannt',
        download.source || 'recipe-page',
        download.utm_source || '',
        download.utm_medium || '',
        download.utm_campaign || '',
        new Date(download.created_at).toLocaleDateString('de-DE')
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recipe-leads-export.csv';
    a.click();
  };

  // Sidebar navigation items
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pionier-leads', label: 'Pionier Leads', icon: Users },
    { id: 'recipe-leads', label: 'Rezept Leads', icon: FileText },
    { id: 'recipes', label: 'Rezepte verwalten', icon: Download },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Einstellungen', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Lade Daten...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} flex flex-col relative`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <Dumbbell className="w-8 h-8 text-yellow-500 flex-shrink-0" />
            {!sidebarCollapsed && (
              <div>
                <div className="text-lg font-bold">COACH ISI</div>
                <div className="text-sm text-gray-400">Admin Dashboard</div>
              </div>
            )}
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
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="p-6 border-t border-gray-700">
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!sidebarCollapsed && <span>Abmelden</span>}
          </button>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute top-6 -right-3 w-6 h-6 bg-gray-900 border border-gray-700 rounded-full flex items-center justify-center text-gray-400 hover:text-white"
        >
          {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3 rotate-90" />}
        </button>
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
              <p className="text-sm text-gray-500">Coach Isi Admin Dashboard</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadData}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Daten aktualisieren"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              <div className="text-sm text-gray-500">
                Letztes Update: {new Date().toLocaleTimeString('de-DE')}
              </div>
            </div>
          </div>
        </header>

        {/* Error Message */}
        {error && (
          <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
            <p className="text-red-700">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              ×
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-auto">
          {/* Dashboard Overview */}
          {activeSection === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Pionier Leads</p>
                      <p className="text-2xl font-bold text-gray-900">{pionierStats.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <FileText className="w-8 h-8 text-green-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rezept Downloads</p>
                      <p className="text-2xl font-bold text-gray-900">{recipeStats.total}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <Download className="w-8 h-8 text-purple-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktive Rezepte</p>
                      <p className="text-2xl font-bold text-gray-900">{recipes.filter(r => r.is_active).length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-yellow-500" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Heute</p>
                      <p className="text-2xl font-bold text-gray-900">{recipeStats.today}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Neueste Pionier Leads</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {pionierEntries.slice(0, 5).map((entry) => (
                        <div key={entry.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                            <div className="text-xs text-gray-500">{entry.email}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(entry.created_at).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Neueste Rezept Downloads</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {recipeDownloads.slice(0, 5).map((download) => (
                        <div key={download.id} className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-green-600" />
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{download.name}</div>
                            <div className="text-xs text-gray-500">{download.email}</div>
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(download.created_at).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pionier Leads */}
          {activeSection === 'pionier-leads' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Name, Email oder Telefon suchen..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={exportPionierData}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Telefon
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quelle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Angemeldet am
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPionierEntries.map((entry) => (
                        <tr key={entry.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{entry.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">{entry.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Phone className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">{entry.phone}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              entry.status === 'approved' ? 'bg-green-100 text-green-800' :
                              entry.status === 'invited' ? 'bg-purple-100 text-purple-800' :
                              entry.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                              entry.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {entry.status || 'new'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{entry.source || 'direct'}</div>
                            {entry.utm_source && (
                              <div className="text-xs text-gray-500">UTM: {entry.utm_source}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(entry.created_at).toLocaleDateString('de-DE')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(entry.created_at).toLocaleTimeString('de-DE')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              {/* Status Update Dropdown */}
                              <select
                                value={entry.status || 'new'}
                                onChange={(e) => handleStatusUpdate(entry.id, e.target.value)}
                                className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              >
                                <option value="new">Neu</option>
                                <option value="reviewed">Geprüft</option>
                                <option value="approved">Genehmigt</option>
                                <option value="rejected">Abgelehnt</option>
                                <option value="invited">Eingeladen</option>
                              </select>
                              
                              {/* Create Invitation Button */}
                              {entry.status === 'approved' && (
                                <button
                                  onClick={() => handleCreateInvitation(entry.id)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="Einladung erstellen"
                                >
                                  <UserPlus className="w-4 h-4" />
                                </button>
                              )}
                              
                              <button
                                onClick={() => setEditingEntry(entry)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Bearbeiten"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeletePionierEntry(entry.id)}
                                className="text-red-600 hover:text-red-900"
                                title="Löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredPionierEntries.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Einträge gefunden</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? 'Versuchen Sie andere Suchkriterien.' 
                        : 'Noch keine Pioniergruppen-Anmeldungen vorhanden.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipe Leads */}
          {activeSection === 'recipe-leads' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Name oder Email suchen..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                        />
                      </div>
                    </div>
                    
                    <div className="flex space-x-3">
                      <button
                        onClick={exportRecipeData}
                        className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export CSV
                      </button>
                    </div>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rezept
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quelle
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Heruntergeladen am
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aktionen
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRecipeDownloads.map((download) => (
                        <tr key={download.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{download.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 text-gray-400 mr-2" />
                              <div className="text-sm text-gray-900">{download.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {recipes.find(r => r.id === download.recipe_id)?.title || 'Unbekannt'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{download.source || 'recipe-page'}</div>
                            {download.utm_source && (
                              <div className="text-xs text-gray-500">UTM: {download.utm_source}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(download.created_at).toLocaleDateString('de-DE')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(download.created_at).toLocaleTimeString('de-DE')}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                className="text-blue-600 hover:text-blue-900"
                                title="Details anzeigen"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredRecipeDownloads.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Downloads gefunden</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm 
                        ? 'Versuchen Sie andere Suchkriterien.' 
                        : 'Noch keine Rezept-Downloads vorhanden.'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recipe Management */}
          {activeSection === 'recipes' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900">Rezepte verwalten</h3>
                    <button
                      onClick={() => setShowAddRecipe(true)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Neues Rezept
                    </button>
                  </div>
                </div>

                {/* Recipe Grid */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recipes.map((recipe) => (
                      <div key={recipe.id} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">{recipe.title}</h4>
                            {recipe.description && (
                              <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              recipe.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {recipe.is_active ? 'Aktiv' : 'Inaktiv'}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-500 mb-4">
                          <div className="flex items-center">
                            <Download className="w-4 h-4 mr-2" />
                            <span>{recipe.download_count} Downloads</span>
                          </div>
                          <div className="flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            <span>{Math.round(recipe.file_size / 1024)} KB</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>{new Date(recipe.created_at).toLocaleDateString('de-DE')}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <a
                            href={recipe.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          >
                            Datei anzeigen
                          </a>
                          <div className="flex items-center space-x-2">
                            <button
                              className="text-blue-600 hover:text-blue-900"
                              title="Bearbeiten"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecipe(recipe.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Löschen"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {recipes.length === 0 && (
                    <div className="text-center py-12">
                      <Download className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Keine Rezepte vorhanden</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Fügen Sie Ihr erstes Rezept hinzu, um zu beginnen.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Analytics */}
          {activeSection === 'analytics' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Analytics Dashboard</h3>
                <p className="text-gray-600">Detaillierte Analytics werden hier angezeigt...</p>
              </div>
            </div>
          )}

          {/* Settings */}
          {activeSection === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Einstellungen</h3>
                <p className="text-gray-600">Systemeinstellungen werden hier angezeigt...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Recipe Modal */}
      {showAddRecipe && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Neues Rezept hinzufügen</h3>
                <button
                  onClick={() => setShowAddRecipe(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titel</label>
                  <input
                    type="text"
                    value={newRecipe.title}
                    onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Beschreibung</label>
                  <textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Datei URL</label>
                  <input
                    type="url"
                    value={newRecipe.file_url}
                    onChange={(e) => setNewRecipe({...newRecipe, file_url: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dateiname</label>
                  <input
                    type="text"
                    value={newRecipe.file_name}
                    onChange={(e) => setNewRecipe({...newRecipe, file_name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Dateigröße (Bytes)</label>
                  <input
                    type="number"
                    value={newRecipe.file_size}
                    onChange={(e) => setNewRecipe({...newRecipe, file_size: parseInt(e.target.value) || 0})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newRecipe.is_active}
                    onChange={(e) => setNewRecipe({...newRecipe, is_active: e.target.checked})}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label className="ml-2 text-sm text-gray-700">Aktiv</label>
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowAddRecipe(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleAddRecipe}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Hinzufügen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Eintrag bearbeiten</h3>
                <button
                  onClick={() => setEditingEntry(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={editingEntry.name}
                    onChange={(e) => setEditingEntry({...editingEntry, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={editingEntry.email}
                    onChange={(e) => setEditingEntry({...editingEntry, email: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Telefon</label>
                  <input
                    type="tel"
                    value={editingEntry.phone}
                    onChange={(e) => setEditingEntry({...editingEntry, phone: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {editingEntry.status !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={editingEntry.status || 'new'}
                      onChange={(e) => setEditingEntry({...editingEntry, status: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="new">Neu</option>
                      <option value="reviewed">Geprüft</option>
                      <option value="approved">Genehmigt</option>
                      <option value="rejected">Abgelehnt</option>
                      <option value="invited">Eingeladen</option>
                    </select>
                  </div>
                )}
                {editingEntry.notes !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notizen</label>
                    <textarea
                      value={editingEntry.notes || ''}
                      onChange={(e) => setEditingEntry({...editingEntry, notes: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Interne Notizen..."
                    />
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setEditingEntry(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Abbrechen
                </button>
                <button
                  onClick={async () => {
                    try {
                      await pionierService.update(editingEntry.id, {
                        name: editingEntry.name,
                        email: editingEntry.email,
                        phone: editingEntry.phone,
                        status: editingEntry.status,
                        notes: editingEntry.notes
                      });
                      setEditingEntry(null);
                      await loadData();
                    } catch (err) {
                      console.error('Error saving entry:', err);
                      setError('Fehler beim Speichern des Eintrags.');
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Speichern
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;