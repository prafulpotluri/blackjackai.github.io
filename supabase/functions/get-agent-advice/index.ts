import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdviceRequest {
  playerHand: {
    cards: Array<{ rank: string; suit: string }>;
    value: number;
    isSoft: boolean;
  };
  dealerUpCard: number;
  trueCount: number;
  recommendedAction: string;
  winProbability: number;
  balance: number;
  currentBet: number;
  canSplit: boolean;
  canDouble: boolean;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const request: AdviceRequest = await req.json();

    const systemPrompt = `You are an expert blackjack strategy advisor angel robot. Your job is to explain blackjack decisions in a friendly, educational way that helps players learn card counting and optimal strategy.

Key points to always include:
1. Why the recommended action is optimal based on basic strategy
2. How the true count affects this decision
3. What card counting tells us about the remaining deck
4. The mathematical reasoning behind the probability
5. Educational tips to help the player recognize similar situations

Keep your explanations clear, concise, and encouraging. Use analogies when helpful. Your goal is to teach, not just tell.`;

    const userPrompt = `Player's hand: ${request.playerHand.cards.map(c => c.rank).join(', ')} (Value: ${request.playerHand.value}${request.playerHand.isSoft ? ' soft' : ''})
Dealer's up card: ${request.dealerUpCard}
True count: ${request.trueCount > 0 ? '+' : ''}${request.trueCount}
Recommended action: ${request.recommendedAction.toUpperCase()}
Win probability: ${(request.winProbability * 100).toFixed(1)}%
Can split: ${request.canSplit ? 'Yes' : 'No'}
Can double: ${request.canDouble ? 'Yes' : 'No'}

Explain why ${request.recommendedAction} is the best move here. Include:
1. The strategic reasoning from basic strategy
2. How the count of ${request.trueCount > 0 ? '+' : ''}${request.trueCount} affects this decision
3. Why the win probability is ${(request.winProbability * 100).toFixed(1)}%
4. A helpful tip for recognizing similar situations

Keep the explanation to 3-4 sentences maximum. Be encouraging and educational!`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 300
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const explanation = data.choices?.[0]?.message?.content || 
      'I recommend this move based on optimal blackjack strategy and the current count!';

    return new Response(
      JSON.stringify({ explanation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-agent-advice:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        explanation: 'Unable to get AI explanation at this time. Please try again!'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
