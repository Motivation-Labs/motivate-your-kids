-- Fix RLS policies: replace owner-only policies with membership-based policies
-- Previous policies checked families.user_id = auth.uid() (only owners could access data)
-- New policies use user_family_ids() which checks family_members.user_id (all members)

-- Add user_id to join_requests for linking to auth users
ALTER TABLE join_requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Drop all broken owner-only policies
DROP POLICY IF EXISTS "Users manage own families" ON families;
DROP POLICY IF EXISTS "Users manage members in own families" ON family_members;
DROP POLICY IF EXISTS "Users manage invites in own families" ON family_invites;
DROP POLICY IF EXISTS "Users manage join_requests in own families" ON join_requests;
DROP POLICY IF EXISTS "Users manage kids in own families" ON kids;
DROP POLICY IF EXISTS "Users manage categories in own families" ON categories;
DROP POLICY IF EXISTS "Users manage actions in own families" ON actions;
DROP POLICY IF EXISTS "Users manage badges in own families" ON badges;
DROP POLICY IF EXISTS "Users manage rewards in own families" ON rewards;
DROP POLICY IF EXISTS "Users manage transactions for own kids" ON transactions;
DROP POLICY IF EXISTS "Users manage kid_badges for own kids" ON kid_badges;
DROP POLICY IF EXISTS "Users manage profile_change_requests for own members" ON profile_change_requests;

-- FAMILIES
CREATE POLICY "Members can view their families"
  ON families FOR SELECT USING (id IN (SELECT user_family_ids()));
CREATE POLICY "Authenticated users can create families"
  ON families FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Owners can update their family"
  ON families FOR UPDATE USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND is_owner = true)
  );

-- FAMILY MEMBERS
CREATE POLICY "Members can view family members"
  ON family_members FOR SELECT USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Can insert own membership"
  ON family_members FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Members can update own record"
  ON family_members FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Owner can delete members"
  ON family_members FOR DELETE USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid() AND is_owner = true)
  );

-- FAMILY INVITES
CREATE POLICY "Family members can view invites"
  ON family_invites FOR SELECT USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can create invites"
  ON family_invites FOR INSERT WITH CHECK (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can update invites"
  ON family_invites FOR UPDATE USING (family_id IN (SELECT user_family_ids()));

-- JOIN REQUESTS
CREATE POLICY "Anyone can create join requests"
  ON join_requests FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Family members can view join requests"
  ON join_requests FOR SELECT USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can update join requests"
  ON join_requests FOR UPDATE USING (family_id IN (SELECT user_family_ids()));

-- KIDS, CATEGORIES, ACTIONS, BADGES, REWARDS
CREATE POLICY "Family members can manage kids"
  ON kids FOR ALL USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can manage categories"
  ON categories FOR ALL USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can manage actions"
  ON actions FOR ALL USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can manage badges"
  ON badges FOR ALL USING (family_id IN (SELECT user_family_ids()));
CREATE POLICY "Family members can manage rewards"
  ON rewards FOR ALL USING (family_id IN (SELECT user_family_ids()));

-- TRANSACTIONS and KID_BADGES (kid-scoped)
CREATE POLICY "Family members can manage transactions"
  ON transactions FOR ALL USING (
    kid_id IN (SELECT id FROM kids WHERE family_id IN (SELECT user_family_ids()))
  );
CREATE POLICY "Family members can manage kid badges"
  ON kid_badges FOR ALL USING (
    kid_id IN (SELECT id FROM kids WHERE family_id IN (SELECT user_family_ids()))
  );

-- PROFILE CHANGE REQUESTS
CREATE POLICY "Family members can manage profile change requests"
  ON profile_change_requests FOR ALL USING (
    member_id IN (SELECT id FROM family_members WHERE family_id IN (SELECT user_family_ids()))
  );

-- RPC: submit join request by family code (validates code, prevents duplicates)
CREATE OR REPLACE FUNCTION submit_join_request(
  p_family_code TEXT,
  p_request_id TEXT,
  p_requester_name TEXT,
  p_requester_avatar TEXT,
  p_requested_role TEXT,
  p_birthday DATE DEFAULT NULL,
  p_user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_family RECORD;
  v_existing RECORD;
BEGIN
  SELECT id, name INTO v_family FROM families
  WHERE UPPER(display_code) = UPPER(p_family_code);

  IF v_family IS NULL THEN
    RETURN json_build_object('error', 'not_found');
  END IF;

  IF p_user_id IS NOT NULL THEN
    SELECT * INTO v_existing FROM family_members WHERE user_id = p_user_id LIMIT 1;
    IF v_existing IS NOT NULL THEN
      RETURN json_build_object('error', 'already_member');
    END IF;

    SELECT * INTO v_existing FROM join_requests
    WHERE family_id = v_family.id AND user_id = p_user_id AND status = 'pending';
    IF v_existing IS NOT NULL THEN
      RETURN json_build_object('error', 'already_requested');
    END IF;
  END IF;

  INSERT INTO join_requests (id, family_id, requester_name, requester_avatar, requested_role, birthday, status, user_id, created_at)
  VALUES (p_request_id, v_family.id, p_requester_name, p_requester_avatar, p_requested_role, p_birthday, 'pending', p_user_id, now());

  RETURN json_build_object('familyId', v_family.id, 'familyName', v_family.name);
END;
$$;

GRANT EXECUTE ON FUNCTION submit_join_request TO authenticated;
