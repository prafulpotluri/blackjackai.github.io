-- Create table for game sessions
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  total_hands INTEGER DEFAULT 0,
  total_profit NUMERIC DEFAULT 0,
  session_data JSONB DEFAULT '{}'::jsonb
);

-- Create table for individual hands played
CREATE TABLE public.game_hands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  player_cards JSONB NOT NULL,
  dealer_up_card INTEGER NOT NULL,
  dealer_final_cards JSONB,
  player_value INTEGER NOT NULL,
  dealer_value INTEGER,
  is_soft BOOLEAN DEFAULT false,
  is_pair BOOLEAN DEFAULT false,
  pair_rank TEXT,
  true_count NUMERIC NOT NULL,
  running_count INTEGER NOT NULL,
  actions_taken JSONB NOT NULL DEFAULT '[]'::jsonb,
  recommended_action TEXT,
  final_result TEXT,
  bet_amount NUMERIC NOT NULL,
  profit_loss NUMERIC,
  was_blackjack BOOLEAN DEFAULT false
);

-- Create table for action outcomes analysis
CREATE TABLE public.action_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  player_value INTEGER NOT NULL,
  dealer_up_card INTEGER NOT NULL,
  is_soft BOOLEAN DEFAULT false,
  is_pair BOOLEAN DEFAULT false,
  true_count_range TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  times_played INTEGER DEFAULT 1,
  times_won INTEGER DEFAULT 0,
  times_lost INTEGER DEFAULT 0,
  times_push INTEGER DEFAULT 0,
  total_profit NUMERIC DEFAULT 0,
  win_rate NUMERIC GENERATED ALWAYS AS (
    CASE WHEN times_played > 0 THEN (times_won::NUMERIC / times_played::NUMERIC) ELSE 0 END
  ) STORED,
  UNIQUE(player_value, dealer_up_card, is_soft, is_pair, true_count_range, action_taken)
);

-- Create indexes for efficient querying
CREATE INDEX idx_game_hands_situation ON public.game_hands(player_value, dealer_up_card, is_soft, is_pair);
CREATE INDEX idx_game_hands_true_count ON public.game_hands(true_count);
CREATE INDEX idx_action_outcomes_lookup ON public.action_outcomes(player_value, dealer_up_card, is_soft, is_pair, true_count_range);

-- Enable RLS but allow public access for this learning game
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_hands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_outcomes ENABLE ROW LEVEL SECURITY;

-- Allow public access (no auth required for this game)
CREATE POLICY "Allow public access to game_sessions" ON public.game_sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to game_hands" ON public.game_hands FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public access to action_outcomes" ON public.action_outcomes FOR ALL USING (true) WITH CHECK (true);