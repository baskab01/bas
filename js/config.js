window.BAS_CONFIG = {
  SUPABASE_URL: "https://nknshstqgxvohpsxbbnm.supabase.co",

  SUPABASE_PUBLISHABLE_KEY:
    "sb_publishable_j_-Cwzdrdw3_SyMXpMrAtw_W0b_avAO"
};

window.sb = window.supabase.createClient(
  window.BAS_CONFIG.SUPABASE_URL,
  window.BAS_CONFIG.SUPABASE_PUBLISHABLE_KEY
);
