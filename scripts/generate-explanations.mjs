#!/usr/bin/env node
/**
 * Batch-generate explanations for real-exam questions missing them.
 * Uses Claude API (claude-haiku-4-5-20251001 for speed/cost, high quality for exam explanations).
 *
 * Usage: node scripts/generate-explanations.mjs [--paper paper1|paper3] [--limit N] [--concurrency N]
 */

import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const CONCURRENCY = parseInt(process.argv.find((_, i, a) => a[i-1] === '--concurrency') || '10');
const PAPER_FILTER = process.argv.find((_, i, a) => a[i-1] === '--paper') || null;
const LIMIT = parseInt(process.argv.find((_, i, a) => a[i-1] === '--limit') || '0');
const MODEL = 'claude-haiku-4-5-20251001';

function buildPrompt(q) {
  return `你是IIQE（香港保險中介人資格考試）的解題專家。請為以下選擇題撰寫詳細的中文解析。

題目：${q.question}
A. ${q.options.A}
B. ${q.options.B}
C. ${q.options.C}
D. ${q.options.D}
正確答案：${q.correct}
章節：${q.chapterName || ''}
${q.reference ? '參考：研習手冊' + q.reference + '節' : ''}

請按以下格式撰寫解析（直接輸出，不要加任何markdown標記）：

第一段：用1-2句話解釋為什麼正確答案是對的，核心知識點是什麼。

然後逐一分析每個選項（用✅標記正確選項，❌標記錯誤選項）：
✅/❌ A. [選項內容] → [為什麼對/錯]
✅/❌ B. [選項內容] → [為什麼對/錯]
✅/❌ C. [選項內容] → [為什麼對/錯]
✅/❌ D. [選項內容] → [為什麼對/錯]

最後一行加考試技巧或記憶提示：
💡 考試技巧：[一句話幫助記憶的技巧]
${q.reference ? '📚 參考研習手冊' + q.reference + '節' : ''}

注意：
- 全部用繁體中文
- 解析要準確、專業，適合備考學生
- 錯誤選項的解釋要說明為什麼它是錯的，而不只是說"這是錯的"
- 保持簡潔但完整`;
}

async function generateExplanation(q) {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 600,
    messages: [{ role: 'user', content: buildPrompt(q) }]
  });
  return response.content[0].text.trim();
}

async function processWithConcurrency(items, fn, concurrency) {
  const results = [];
  let index = 0;
  let completed = 0;
  const total = items.length;

  async function worker() {
    while (index < items.length) {
      const i = index++;
      try {
        results[i] = await fn(items[i], i);
        completed++;
        if (completed % 20 === 0 || completed === total) {
          process.stdout.write(`\r  Progress: ${completed}/${total} (${Math.round(completed/total*100)}%)`);
        }
      } catch (err) {
        console.error(`\n  Error on item ${i}: ${err.message}`);
        // Retry once
        try {
          await new Promise(r => setTimeout(r, 2000));
          results[i] = await fn(items[i], i);
          completed++;
        } catch (err2) {
          console.error(`\n  Retry failed for item ${i}: ${err2.message}`);
          results[i] = null;
          completed++;
        }
      }
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, items.length) }, () => worker());
  await Promise.all(workers);
  console.log('');
  return results;
}

async function processPaper(paperFile) {
  const filePath = path.join('public/data', paperFile);
  console.log(`\nProcessing ${filePath}...`);

  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const questions = data.questions;

  // Find questions needing explanations
  let needsExplanation = questions.filter(q => !q.explanation || !q.explanation.trim());
  console.log(`  Total questions: ${questions.length}`);
  console.log(`  Missing explanations: ${needsExplanation.length}`);

  if (LIMIT > 0) {
    needsExplanation = needsExplanation.slice(0, LIMIT);
    console.log(`  Processing (limited): ${needsExplanation.length}`);
  }

  if (needsExplanation.length === 0) {
    console.log('  Nothing to do!');
    return;
  }

  console.log(`  Generating with concurrency=${CONCURRENCY}...`);

  const explanations = await processWithConcurrency(
    needsExplanation,
    async (q) => generateExplanation(q),
    CONCURRENCY
  );

  // Apply explanations back to the data
  let applied = 0;
  let failed = 0;
  needsExplanation.forEach((q, i) => {
    if (explanations[i]) {
      q.explanation = explanations[i];
      // Also fill in key_concept if empty
      if (!q.key_concept || !q.key_concept.trim()) {
        const conceptMatch = explanations[i].match(/💡[^：:]*[：:]\s*(.+)/);
        if (conceptMatch) {
          q.key_concept = q.chapterName || '';
        }
      }
      applied++;
    } else {
      failed++;
    }
  });

  console.log(`  Applied: ${applied}, Failed: ${failed}`);

  // Write back
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  Saved to ${filePath}`);
}

async function main() {
  console.log('=== IIQE Explanation Generator ===');
  console.log(`Model: ${MODEL}, Concurrency: ${CONCURRENCY}`);

  const papers = [];
  if (!PAPER_FILTER || PAPER_FILTER === 'paper1') papers.push('paper1-questions.json');
  if (!PAPER_FILTER || PAPER_FILTER === 'paper3') papers.push('paper3-questions.json');

  for (const paper of papers) {
    await processPaper(paper);
  }

  console.log('\nDone!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
