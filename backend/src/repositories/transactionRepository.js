const supabase = require('../config/supabase');
const AppError = require('../utils/AppError');

const transactionRepository = {
  async executeTransfer(senderAccountId, receiverAccountNum, amount, description, referenceId) {
    // Note: Since Supabase currently has limited support for true nested RPC transactions from the JS client without custom PSQL functions,
    // we use a database RPC function for atomicity if available, or simulate it gracefully (with a custom Postgres function ideally).
    // Let's call a theoretical RPC function "transfer_funds" which guarantees ACID properties:
    // This allows us to handle the SELECT ... FOR UPDATE atomic locking safely on the server side.
    
    try {
      const { data, error } = await supabase.rpc('transfer_funds', {
        sender_id: senderAccountId,
        receiver_acc_num: receiverAccountNum,
        transfer_amount: amount,
        transfer_desc: description,
        ref_id: referenceId
      });

      if (error) {
        throw error;
      }
      return data;
    } catch (err) {
      if (err.message.includes('Insufficient funds')) {
          throw new AppError('Insufficient funds for transfer', 400);
      }
      if (err.message.includes('Account frozen')) {
          throw new AppError('One of the accounts is frozen', 403);
      }
      if (err.message.includes('unique constraint') || err.code === '23505') {
          throw new AppError('Duplicate transaction reference', 409);
      }
      throw new AppError(`Transfer failed: ${err.message}`, 500);
    }
  },

  async executeDeposit(accountId, amount, description, referenceId) {
    try {
      const { data, error } = await supabase.rpc('deposit_funds', {
        acc_id: accountId,
        deposit_amount: amount,
        deposit_desc: description,
        ref_id: referenceId
      });

      if (error) throw error;
      return data;
    } catch (err) {
      if (err.message.includes('unique constraint') || err.code === '23505') {
        throw new AppError('Duplicate transaction reference', 409);
      }
      throw new AppError(`Deposit failed: ${err.message}`, 500);
    }
  },

  async executeWithdrawal(accountId, amount, description, referenceId) {
    try {
      const { data, error } = await supabase.rpc('withdraw_funds', {
        acc_id: accountId,
        withdraw_amount: amount,
        withdraw_desc: description,
        ref_id: referenceId
      });

      if (error) throw error;
      return data;
    } catch (err) {
      if (err.message.includes('Insufficient funds')) {
        throw new AppError('Insufficient funds for withdrawal', 400);
      }
      if (err.message.includes('unique constraint') || err.code === '23505') {
        throw new AppError('Duplicate transaction reference', 409);
      }
      throw new AppError(`Withdrawal failed: ${err.message}`, 500);
    }
  },

  async getAccountTransactions(accountId, limit = 20, offset = 0, filters = {}) {
    let query = supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .or(`sender_account_id.eq.${accountId},receiver_account_id.eq.${accountId}`);

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }
    if (filters.type) {
      query = query.eq('transaction_type', filters.type);
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError('Failed to retrieve transactions', 500);
    return { transactions: data, total: count };
  },

  async getTransactionById(transactionId) {
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        *,
        sender_account:sender_account_id (account_number, user_id),
        receiver_account:receiver_account_id (account_number, user_id)
      `)
      .eq('id', transactionId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new AppError('Failed to retrieve transaction details', 500);
    }
    return data;
  },

  async getAllTransactions(limit = 20, offset = 0) {
    const { data, error, count } = await supabase
      .from('transactions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new AppError('Failed to retrieve transactions system wide', 500);
    return { transactions: data, total: count };
  }
};

module.exports = transactionRepository;
