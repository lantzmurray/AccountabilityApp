import Constants from 'expo-constants';
import { format, subDays } from 'date-fns';
import { categoryRepo, logRepo, journalRepo, settingsRepo } from './db';

export type AISuggestion = {
  area: string;
  insight: string;
  suggested_actions: string[];
};

async function getApiKey(): Promise<string | undefined> {
  const k = await settingsRepo.get('OPENAI_API_KEY');
  if (k && k.trim().length > 0) return k;
  const key = (Constants.expoConfig as any)?.extra?.OPENAI_API_KEY || (Constants.manifest2 as any)?.extra?.OPENAI_API_KEY;
  return key;
}

export async function generateSuggestions(): Promise<AISuggestion[]> {
  const apiKey = await getApiKey();
  const since = format(subDays(new Date(), 14), 'yyyy-MM-dd');
  const [categories, recentLogs, recentJournal] = await Promise.all([
    categoryRepo.all(),
    logRepo.forRange(since, format(new Date(), 'yyyy-MM-dd')),
    journalRepo.recent(50)
  ]);

  const payload = {
    categories: categories.map(c => ({ id: c.id, name: c.name, weight: c.weight })),
    logs: recentLogs,
    journal: recentJournal,
  };

  if (!apiKey) {
    return heuristicSuggestions(payload.categories, payload.logs);
  }

  const prompt = `You are a supportive AI behavioral coach.\n\nInput JSON:\n${JSON.stringify(payload)}\n\nRules:\n- Be brief & encouraging.\n- Reference recent data trends.\n- Avoid medical language.\n- If low data, suggest basics and logging habits.\n\nOutput JSON array with fields: area, insight, suggested_actions (3 items).`;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a supportive AI behavioral coach.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '[]';
    const parsed = JSON.parse(safeJson(text));
    if (Array.isArray(parsed)) return parsed;
    return heuristicSuggestions(payload.categories, payload.logs);
  } catch (e) {
    return heuristicSuggestions(payload.categories, payload.logs);
  }
}

function safeJson(text: string): string {
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start >= 0 && end >= start) return text.slice(start, end + 1);
  return '[]';
}

function heuristicSuggestions(categories: { id: number; name: string; weight: number }[], logs: any[]): AISuggestion[] {
  const byCat: Record<number, { recent: number[] }> = {};
  for (const c of categories) byCat[c.id] = { recent: [] };
  for (const l of logs) byCat[l.category_id]?.recent.push(l.rating);
  const suggestions: AISuggestion[] = [];
  for (const c of categories) {
    const recent = byCat[c.id].recent.slice(0, 7);
    if (recent.length === 0) {
      suggestions.push({
        area: c.name,
        insight: 'Not much data yet — a fresh start is a win in itself.',
        suggested_actions: [
          'Do a 1-minute micro‑action for this area today.',
          'Log a quick rating tonight (1–10).',
          'Choose a simple cue (e.g., after dinner) to remember.'
        ]
      });
      continue;
    }
    const avg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const trend = recent[0] - recent[recent.length - 1];
    const improving = trend < 0;
    suggestions.push({
      area: c.name,
      insight: improving ? `Nice momentum — last week averages around ${avg.toFixed(1)} and trending up.` : `Steady but with room — last week averages around ${avg.toFixed(1)}.`,
      suggested_actions: improving ? [
        'Lock a daily 5‑minute action to keep the streak.',
        'Plan tomorrow’s quick win before bed.',
        'Share one small win with your partner this week.'
      ] : [
        'Pick one tiny action and do it at the same time daily.',
        'Set a 8pm reminder to log and reflect.',
        'Ask your partner for one suggestion you can try.'
      ]
    });
  }
  return suggestions.slice(0, 3);
}