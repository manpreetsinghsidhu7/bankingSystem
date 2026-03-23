/**
 * Auto-Approve Scheduler
 * 
 * Scans PENDING accounts every 30 seconds.
 * Any account that has been PENDING for ≥ 2 minutes is automatically approved (set to ACTIVE).
 */
const supabase = require('../config/supabase');
const logger = require('./logger');

const AUTO_APPROVE_MINUTES = 2; // minutes after submission to auto-approve
const CHECK_INTERVAL_MS = 30 * 1000; // run check every 30 seconds

async function runAutoApproval() {
  try {
    const cutoffTime = new Date(Date.now() - AUTO_APPROVE_MINUTES * 60 * 1000).toISOString();

    // Find all PENDING accounts created before the cutoff time
    const { data: pendingAccounts, error: fetchError } = await supabase
      .from('accounts')
      .select('id, account_number, created_at')
      .eq('status', 'PENDING')
      .lt('created_at', cutoffTime);

    if (fetchError) {
      logger.error(`[AutoApprove] Failed to fetch pending accounts: ${fetchError.message}`);
      return;
    }

    if (!pendingAccounts || pendingAccounts.length === 0) return;

    logger.info(`[AutoApprove] Found ${pendingAccounts.length} account(s) eligible for auto-approval.`);

    // Approve each one
    for (const account of pendingAccounts) {
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ status: 'ACTIVE' })
        .eq('id', account.id)
        .eq('status', 'PENDING'); // safety: only update if still pending

      if (updateError) {
        logger.error(`[AutoApprove] Failed to approve account ${account.account_number}: ${updateError.message}`);
      } else {
        logger.info(`[AutoApprove] ✅ Auto-approved account ${account.account_number} (created ${account.created_at})`);
      }
    }
  } catch (err) {
    logger.error(`[AutoApprove] Unexpected error: ${err.message}`);
  }
}

function startAutoApproveScheduler() {
  logger.info(`[AutoApprove] Scheduler started — auto-approving PENDING accounts after ${AUTO_APPROVE_MINUTES} minute(s).`);
  // Run immediately on startup
  runAutoApproval();
  // Then repeat on interval
  return setInterval(runAutoApproval, CHECK_INTERVAL_MS);
}

module.exports = { startAutoApproveScheduler };
