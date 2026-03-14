const supabase = require('../config/supabase');

const userRepository = {
  async createUser(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select('id, email, first_name, last_name, role')
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation
        throw new Error('Email or phone already exists');
      }
      throw error;
    }
    return data;
  },

  async getUserByIdentifier(identifier) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq."${identifier}",phone_number.eq."${identifier}"`)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      throw error;
    }
    return data; // returns null if not found
  },

  async getAllUsers(page, limit) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, created_at', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { data, total: count };
  },

  async updateUser(userId, updates) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getUserById(userId) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserByResetToken(token) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('reset_password_token', token)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async deleteUser(userId) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);
    
    if (error) throw error;
    return true;
  }
};

module.exports = userRepository;
