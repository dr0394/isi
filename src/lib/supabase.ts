import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface PionierEntry {
  id: string;
  name: string;
  email: string;
  phone: string;
  status?: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// User Invitation Types
export interface UserInvitation {
  id: string;
  pionier_entry_id: string;
  invitation_token: string;
  status: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
  updated_at: string;
}

// User Types
export interface User {
  id: string;
  pionier_entry_id: string;
  invitation_id?: string;
  user_id: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// Recipe Downloads Types
export interface RecipeDownload {
  id: string;
  name: string;
  email: string;
  source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  landing_page_url?: string;
  referrer?: string;
  user_agent?: string;
  ip_address?: string;
  downloaded_at: string;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_name: string;
  file_size: number;
  download_count: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Database functions
export const pionierService = {
  // Get all pionier entries
  async getAll(): Promise<PionierEntry[]> {
    const { data, error } = await supabase
      .from('pionier_entries')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add new pionier entry
  async create(entry: Omit<PionierEntry, 'id' | 'created_at' | 'updated_at'>): Promise<PionierEntry> {
    // Add UTM parameters from URL if available
    const urlParams = new URLSearchParams(window.location.search);
    const entryWithUTM = {
      ...entry,
      source: 'website',
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined
    };
    
    const { data, error } = await supabase
      .from('pionier_entries')
      .insert([entryWithUTM])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update pionier entry
  async update(id: string, updates: Partial<PionierEntry>): Promise<PionierEntry> {
    const { data, error } = await supabase
      .from('pionier_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete pionier entry
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('pionier_entries')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Bulk delete
  async bulkDelete(ids: string[]): Promise<void> {
    const { error } = await supabase
      .from('pionier_entries')
      .delete()
      .in('id', ids);
    
    if (error) throw error;
  },

  // Get statistics
  async getStats() {
    const { data, error } = await supabase
      .from('pionier_entries')
      .select('id, status');
    
    if (error) throw error;
    
    const statusCounts = data.reduce((acc: Record<string, number>, entry) => {
      const status = entry.status || 'new';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const stats = {
      total: data.length,
      new: statusCounts.new || 0,
      reviewed: statusCounts.reviewed || 0,
      approved: statusCounts.approved || 0,
      rejected: statusCounts.rejected || 0,
      invited: statusCounts.invited || 0
    };
    
    return stats;
  },

  // Update application status
  async updateStatus(id: string, status: string, reviewedBy?: string, notes?: string): Promise<PionierEntry> {
    const updates: any = {
      status,
      reviewed_at: new Date().toISOString()
    };
    
    if (reviewedBy) updates.reviewed_by = reviewedBy;
    if (notes) updates.notes = notes;
    
    const { data, error } = await supabase
      .from('pionier_entries')
      .update(updates)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      return null;
    }
    
    return data[0];
  },

  // Create invitation for approved entry
  async createInvitation(entryId: string): Promise<string> {
    const { data, error } = await supabase.rpc('create_user_invitation', {
      entry_id: entryId
    });
    
    if (error) throw error;
    return data;
  },

  // Get invitation by token
  async getInvitationByToken(token: string): Promise<UserInvitation | null> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select(`
        *,
        pionier_entries (*)
      `)
      .eq('invitation_token', token)
      .eq('status', 'pending')
      .gt('expires_at', new Date().toISOString())
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  }
};

// User Invitation Service
export const invitationService = {
  // Get all invitations (admin)
  async getAll(): Promise<UserInvitation[]> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select(`
        *,
        pionier_entries (name, email)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Use invitation token to create user
  async useInvitation(token: string, authUserId: string): Promise<string> {
    const { data, error } = await supabase.rpc('use_invitation_token', {
      token,
      auth_user_id: authUserId
    });
    
    if (error) throw error;
    return data;
  },

  // Expire old invitations
  async expireOldInvitations(): Promise<void> {
    const { error } = await supabase.rpc('expire_old_invitations');
    if (error) throw error;
  }
};

// User Service
export const userService = {
  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        pionier_entries (*),
        user_invitations (*)
      `)
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  },

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  // Get all users (admin)
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        pionier_entries (name, email),
        user_invitations (invitation_token, created_at)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};

// Recipe Downloads Service
export const recipeService = {
  // Get all recipe downloads
  async getAllDownloads(): Promise<RecipeDownload[]> {
    const { data, error } = await supabase
      .from('recipe_downloads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Add new recipe download
  async createDownload(download: Omit<RecipeDownload, 'id' | 'created_at' | 'updated_at' | 'downloaded_at'>): Promise<RecipeDownload> {
    const { data, error } = await supabase
      .from('recipe_downloads')
      .insert([download])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get all active recipes
  async getActiveRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Get all recipes (admin)
  async getAllRecipes(): Promise<Recipe[]> {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  // Create new recipe (admin)
  async createRecipe(recipe: Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'download_count'>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update recipe (admin)
  async updateRecipe(id: string, updates: Partial<Recipe>): Promise<Recipe> {
    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete recipe (admin)
  async deleteRecipe(id: string): Promise<void> {
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Increment download count
  async incrementDownloadCount(recipeId: string): Promise<void> {
    const { error } = await supabase.rpc('increment_download_count', {
      recipe_id: recipeId
    });
    
    if (error) throw error;
  },

  // Get download statistics
  async getDownloadStats() {
    const { data, error } = await supabase
      .from('recipe_downloads')
      .select('id, created_at, source');
    
    if (error) throw error;
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const stats = {
      total: data.length,
      today: data.filter(d => new Date(d.created_at) >= today).length,
      thisWeek: data.filter(d => new Date(d.created_at) >= weekAgo).length,
      thisMonth: data.filter(d => new Date(d.created_at) >= monthAgo).length,
      bySource: data.reduce((acc: Record<string, number>, d) => {
        acc[d.source] = (acc[d.source] || 0) + 1;
        return acc;
      }, {})
    };
    
    return stats;
  }
};

// Admin authentication
export const adminAuth = {
  // Simple admin login (in production, use Supabase Auth)
  async login(email: string, password: string): Promise<boolean> {
    // For demo purposes - in production, use proper authentication
    return email === 'admin@coachisi.de' && password === 'Coachisi2025!';
  },

  // Check if user is authenticated admin
  isAuthenticated(): boolean {
    return localStorage.getItem('admin_authenticated') === 'true';
  },

  // Set authentication status
  setAuthenticated(status: boolean): void {
    if (status) {
      localStorage.setItem('admin_authenticated', 'true');
    } else {
      localStorage.removeItem('admin_authenticated');
    }
  }
};