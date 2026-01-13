-- Add owner tier with unlimited everything
INSERT INTO tier_limits (tier, analyses_monthly, decisions_daily, documents_monthly, frameworks_monthly, habits_limit, journal_daily, max_file_bytes, max_words, post_mortems_monthly, storage_bytes)
VALUES ('owner', -1, -1, -1, -1, -1, -1, -1, -1, -1, -1)
ON CONFLICT (tier) DO NOTHING;