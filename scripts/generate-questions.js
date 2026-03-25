#!/usr/bin/env node

/**
 * IIQE Question Bank Generator
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-questions.js
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-questions.js --paper paper3
 *   ANTHROPIC_API_KEY=sk-... node scripts/generate-questions.js --chapter 1-1 --count 10
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, '..', 'public', 'data')

const API_KEY = process.env.ANTHROPIC_API_KEY
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required')
  process.exit(1)
}

const PAPERS = {
  paper1: {
    name: '卷一：保险原理及实务',
    chapters: [
      { id: '1-1', name: '风险与保险概论', nameEn: 'Risk & Insurance', weight: 15, topics: '风险的定义（纯粹风险与投机风险、基本风险与特定风险），风险管理技术（回避、减少、自留、转移），保险的功能与利益，保险的运作方式，香港保险业历史发展' },
      { id: '1-2', name: '法律原则', nameEn: 'Legal Principles', weight: 15, topics: '合约法基础（要约、承诺、对价、行为能力、合法性），代理法（代理人类型、代理人的权限包括明示/默示/表见授权、代理人的义务），侵权法基础，最高诚信原则，披露与失实陈述，保证与条件' },
      { id: '1-3', name: '保险原则', nameEn: 'Insurance Principles', weight: 20, topics: '可保利益，弥偿原则（赔付方式：现金赔付、修理、更换、恢复原状），代位求偿权，分摊（双重保险、按比例分摊），近因原则，转让与提名' },
      { id: '1-4', name: '保险运作', nameEn: 'Insurance Functions', weight: 15, topics: '核保（风险评估、投保书、道德风险、实质风险），保费厘定与计算，理赔处理与赔付，再保险（临时、合约、比例、非比例），香港保险市场结构' },
      { id: '1-5', name: '保险产品', nameEn: 'Insurance Products', weight: 15, topics: '人寿保险（终身/储蓄/定期），一般保险产品（财产/责任/汽车/海上/意外及健康），投资相连保险，团体保险，年金' },
      { id: '1-6', name: '监管框架', nameEn: 'Regulatory Framework', weight: 10, topics: '保险业条例Cap.41，保监局角色与权力，中介人发牌要求，IIQE要求，保单持有人保障基金' },
      { id: '1-7', name: '道德与合规', nameEn: 'Ethics & Compliance', weight: 10, topics: '操守守则，AML/CTF，私隐条例六大原则，防贿条例POBO，保险欺诈，ICAC' },
    ],
  },
  paper3: {
    name: '卷三：长期保险',
    chapters: [
      { id: '3-1', name: '长期保险产品', nameEn: 'LT Insurance Products', weight: 25, topics: '定期/终身/储蓄/万能寿险，即期/延期年金，危疾险，伤残收入，长期护理，医疗险，团体人寿，退休计划' },
      { id: '3-2', name: '保单条款与条件', nameEn: 'Policy Provisions', weight: 20, topics: '不可争议条款，宽限期，保单复效，保单贷款，退保价值，受益人指定，保费缴付方式，保单红利' },
      { id: '3-3', name: '核保与保费', nameEn: 'Underwriting & Premium', weight: 20, topics: '风险分类（标准体/次标准体/拒保），核保因素，保费计算（死亡率/利率/费用），生命表' },
      { id: '3-4', name: '理赔与赔付', nameEn: 'Claims & Settlement', weight: 15, topics: '死亡理赔程序，所需文件，理赔调查，保单权益转让，保单信托' },
      { id: '3-5', name: '行业法规与合规', nameEn: 'Regulation & Compliance', weight: 20, topics: '冷静期21天，重要资料声明书IFI，财务需要分析FNA，销售说明书，投诉处理，AML' },
    ],
  },
}

const DIFFICULTIES = ['easy', 'medium', 'medium', 'medium', 'hard']

async function generateQuestion(paper, chapter, difficulty, existingQuestions) {
  const existingSummary = existingQuestions.length > 0
    ? `\n\n已生成的题目摘要（请避免重复）：\n${existingQuestions.slice(-10).map(q => `- ${q.question.substring(0, 40)}...`).join('\n')}`
    : ''

  const difficultyGuide = {
    easy: '简单题：考察基本概念定义和记忆',
    medium: '中等题：考察理解和应用，可以使用情景题',
    hard: '困难题：考察综合分析和复杂情景判断',
  }

  const prompt = `你是一位香港保险中介人资格考试（IIQE）${paper.name}的出题专家。

请生成一道${difficultyGuide[difficulty]}的中文选择题：

章节：${chapter.name}（${chapter.nameEn}）
考点范围：${chapter.topics}
难度：${difficulty}

要求：
1. 题目和选项全部用中文
2. 提供4个选项 A、B、C、D
3. 贴近真实考试风格
4. 错误选项要有迷惑性
5. 解释要详细，帮助考生理解${existingSummary}

请只返回以下JSON格式，不要markdown，不要反引号：
{"question":"题目","options":{"A":"选项A","B":"选项B","C":"选项C","D":"选项D"},"correct":"答案字母","explanation":"详细解释","key_concept":"核心考点","difficulty":"${difficulty}"}`

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.content?.map(i => i.text || '').join('') || ''
  const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())

  // Validate
  if (!parsed.question || !parsed.options || !parsed.correct || !parsed.explanation) {
    throw new Error('Invalid question format')
  }
  if (!['A', 'B', 'C', 'D'].includes(parsed.correct)) {
    throw new Error(`Invalid correct answer: ${parsed.correct}`)
  }

  return parsed
}

async function generateForChapter(paper, chapter, count, existing) {
  const questions = [...existing]
  const toGenerate = count - existing.length

  if (toGenerate <= 0) {
    console.log(`  ✓ ${chapter.name}: already has ${existing.length} questions`)
    return questions
  }

  console.log(`  Generating ${toGenerate} questions for ${chapter.name}...`)

  for (let i = 0; i < toGenerate; i++) {
    const difficulty = DIFFICULTIES[i % DIFFICULTIES.length]
    try {
      const q = await generateQuestion(paper, chapter, difficulty, questions)
      q.chapterId = chapter.id
      q.chapterName = chapter.name
      questions.push(q)
      process.stdout.write(`    ${i + 1}/${toGenerate} `)
      process.stdout.write(difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴')
      process.stdout.write('\n')
      // Rate limit
      await new Promise(r => setTimeout(r, 1000))
    } catch (err) {
      console.error(`    ✗ Failed: ${err.message}`)
    }
  }

  return questions
}

async function main() {
  const args = process.argv.slice(2)
  const paperFilter = args.includes('--paper') ? args[args.indexOf('--paper') + 1] : null
  const chapterFilter = args.includes('--chapter') ? args[args.indexOf('--chapter') + 1] : null
  const countPerChapter = args.includes('--count') ? parseInt(args[args.indexOf('--count') + 1]) : 60

  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })

  const papersToProcess = paperFilter ? [paperFilter] : ['paper1', 'paper3']

  for (const paperId of papersToProcess) {
    const paper = PAPERS[paperId]
    if (!paper) {
      console.error(`Unknown paper: ${paperId}`)
      continue
    }

    console.log(`\n📝 ${paper.name}`)
    const outputPath = path.join(DATA_DIR, `${paperId}-questions.json`)

    let existing = { questions: [], generatedAt: null, version: 1 }
    if (fs.existsSync(outputPath)) {
      try {
        existing = JSON.parse(fs.readFileSync(outputPath, 'utf-8'))
      } catch {}
    }

    const allQuestions = []
    const chapters = chapterFilter
      ? paper.chapters.filter(ch => ch.id === chapterFilter)
      : paper.chapters

    for (const chapter of chapters) {
      const chapterExisting = existing.questions.filter(q => q.chapterId === chapter.id)
      const qs = await generateForChapter(paper, chapter, countPerChapter, chapterExisting)
      allQuestions.push(...qs)
    }

    // Merge with questions from other chapters not being regenerated
    if (chapterFilter) {
      const otherQs = existing.questions.filter(q => q.chapterId !== chapterFilter)
      allQuestions.push(...otherQs)
    }

    const output = {
      paperId,
      paperName: paper.name,
      questions: allQuestions,
      generatedAt: new Date().toISOString(),
      version: (existing.version || 0) + 1,
      totalCount: allQuestions.length,
    }

    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8')
    console.log(`\n✅ Saved ${allQuestions.length} questions to ${outputPath}`)
  }

  console.log('\nDone! 🎉')
}

main().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})
