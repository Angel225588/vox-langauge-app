-- Relax the total_stairs constraint from 8-12 to 4-12
-- This allows flexible stair counts based on user timeline + proficiency
ALTER TABLE user_staircases DROP CONSTRAINT IF EXISTS check_total_stairs;
ALTER TABLE user_staircases ADD CONSTRAINT check_total_stairs CHECK (total_stairs BETWEEN 4 AND 12);
