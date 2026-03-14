const supabase = require('../config/supabase');

const accountRepository = {
  async createAccount(accountData) {
    const { data, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAccountByNumber(accountNumber) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*, users(first_name, last_name)')
      .eq('account_number', accountNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async updateAccountPin(accountId, pinHash) {
    const { data, error } = await supabase
      .from('accounts')
      .update({ pin_hash: pinHash })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getAccountById(accountId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async getUserAccounts(userId) {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return data;
  },

  async getAllAccounts(limit, offset) {
    const { data, error, count } = await supabase
      .from('accounts')
      .select('*, users(first_name, last_name, email, phone_number)', { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { accounts: data, total: count };
  },

  async updateAccountStatus(accountId, status) {
    const { data, error } = await supabase
      .from('accounts')
      .update({ status })
      .eq('id', accountId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteAccount(accountId) {
    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (error) throw error;
    return true;
  }
};

module.exports = accountRepository;
