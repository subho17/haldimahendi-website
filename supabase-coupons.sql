-- Insert test coupons into Supabase
INSERT INTO coupons (id, code, discount_type, discount_value, applicable_plans, max_uses, used_count, per_user_limit, starts_at, expires_at, is_active, description, created_at)
VALUES
  ('coupon_001', 'FREESILVER', 'percent', 100, ARRAY['silver']::TEXT[], 100, 0, 1, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true, 'Free Silver membership upgrade', NOW()),
  ('coupon_002', 'FREEGOLD', 'percent', 100, ARRAY['gold']::TEXT[], 50, 0, 1, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true, 'Free Gold membership upgrade', NOW()),
  ('coupon_003', 'FREEPLATINUM', 'percent', 100, ARRAY['platinum']::TEXT[], 25, 0, 1, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true, 'Free Platinum membership upgrade', NOW()),
  ('coupon_004', 'SAVE50', 'percent', 50, ARRAY[]::TEXT[], 200, 0, 2, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true, '50% off any plan', NOW()),
  ('coupon_005', 'FLAT200', 'flat', 200, ARRAY[]::TEXT[], 150, 0, 1, '2025-01-01T00:00:00Z', '2026-12-31T23:59:59Z', true, '₹200 off any plan', NOW())
ON CONFLICT (code) DO NOTHING;
