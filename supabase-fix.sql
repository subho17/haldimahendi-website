-- ==========================================
-- STEP 1: Fix the mobile_number NOT NULL constraint
-- The auto-created table has mobile_number as NOT NULL,
-- but we need to allow nulls for the matching to work
-- ==========================================
ALTER TABLE profiles ALTER COLUMN mobile_number DROP NOT NULL;

-- Also fix other columns that might have NOT NULL constraints from the auto-creation
ALTER TABLE profiles ALTER COLUMN height DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN age DROP NOT NULL;

-- ==========================================
-- STEP 2: Insert test profiles with ALL required fields
-- ==========================================
INSERT INTO profiles (user_id, display_name, gender, age, height, religion, mother_tongue, marital_status, manglik, nakshatra, city, mobile_number, created_at) VALUES
('user-1', 'Rahul Sharma', 'Groom', 28, '5''9"', 'Hindu', 'Hindi', 'Never Married', 'no', 'Ashwini', 'Delhi', '9903797850', now()),
('user-2', 'Pooja Sharma', 'Bride', 25, '5''6"', 'Hindu', 'Bengali', 'Never Married', 'yes', 'Rohini', 'Kolkata', '9876543288', now()),
('user-3', 'Amit Singh', 'Groom', 32, '6''0"', 'Sikh', 'Punjabi', 'Never Married', 'no', 'Mulhall', 'Chandigarh', '9888877777', now()),
('user-4', 'Sneha Patel', 'Bride', 27, '5''5"', 'Hindu', 'Gujarati', 'Never Married', 'no', 'Ashwini', 'Ahmedabad', '9876543210', now());

-- ==========================================
-- STEP 3: Insert partner preferences for matching
-- ==========================================
INSERT INTO partner_preferences (user_id, partner_gender, age_min, age_max, religion, mother_tongue, marital_status, city, education) VALUES
('current-user-1', 'Bride', 21, 35, 'Any', 'Hindi', 'Any', 'Delhi', 'Any'),
('current-user-2', 'Groom', 23, 40, 'Any', 'Punjabi', 'Any', 'Chandigarh', 'Any');

-- ==========================================
-- STEP 4: Verify the data was inserted correctly
-- ==========================================
SELECT id, user_id, display_name, gender, age, height, religion, mother_tongue, marital_status, manglik, nakshatra, city, mobile_number FROM profiles LIMIT 5;
SELECT * FROM partner_preferences;