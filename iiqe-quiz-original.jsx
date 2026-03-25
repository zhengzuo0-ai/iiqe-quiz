import { useState, useEffect, useCallback, useRef } from "react";

// ===================== DATA =====================
const PAPERS = {
  paper1: {
    name: "卷一：保险原理及实务",
    nameEn: "Paper 1: Principles & Practice of Insurance",
    time: "120分钟",
    questions: 75,
    passRate: "70%（53/75题）",
    examDate: "4月8日 15:45",
    chapters: [
      { id: "1-1", name: "风险与保险概论", nameEn: "Risk & Insurance", weight: 15, topics: "风险的定义（纯粹风险与投机风险、基本风险与特定风险），风险管理技术（回避、减少、自留、转移），保险的功能与利益，保险的运作方式，香港保险业历史发展" },
      { id: "1-2", name: "法律原则", nameEn: "Legal Principles", weight: 15, topics: "合约法基础（要约、承诺、对价、行为能力、合法性），代理法（代理人类型、代理人的权限包括明示/默示/表见授权、代理人的义务），侵权法基础，最高诚信原则（uberrimae fidei），披露与失实陈述，保证与条件" },
      { id: "1-3", name: "保险原则", nameEn: "Insurance Principles", weight: 20, topics: "可保利益（定义、不同保险类别中何时需要），弥偿原则（赔付方式：现金赔付、修理、更换、恢复原状），代位求偿权（定义、运作方式、保险人的权利），分摊（双重保险、按比例分摊），近因原则（causa proxima），转让与提名" },
      { id: "1-4", name: "保险运作", nameEn: "Insurance Functions", weight: 15, topics: "核保（风险评估、投保书、道德风险、实质风险），保费厘定与计算，理赔处理与赔付，再保险（临时再保险、合约再保险、比例再保险、非比例再保险），香港保险市场结构（劳合社、保险公司、经纪、代理）" },
      { id: "1-5", name: "保险产品", nameEn: "Insurance Products", weight: 15, topics: "人寿保险（终身寿险、储蓄寿险、定期寿险），一般保险产品（财产险、责任险、汽车险、海上险、意外及健康险），长期保险产品概述，投资相连保险概述，团体保险，年金" },
      { id: "1-6", name: "监管框架", nameEn: "Regulatory Framework", weight: 10, topics: "《保险业条例》（第41章），保险业监管局（保监局）的角色与权力，2015年《保险公司条例》，中介人发牌要求，自律监管组织，IIQE资格考试要求，保单持有人保障基金" },
      { id: "1-7", name: "道德与合规", nameEn: "Ethics & Compliance", weight: 10, topics: "《持牌保险中介人操守守则》，反洗钱（AML）要求，反恐融资，《个人资料（私隐）条例》（六项保障资料原则），《防止贿赂条例》（POBO），保险欺诈防范，专业道德与责任，投诉处理，廉政公署（ICAC）角色" },
    ],
  },
  paper3: {
    name: "卷三：长期保险",
    nameEn: "Paper 3: Long Term Insurance",
    time: "75分钟",
    questions: 50,
    passRate: "70%（35/50题）",
    examDate: "4月8日 14:00",
    chapters: [
      { id: "3-1", name: "长期保险产品", nameEn: "LT Insurance Products", weight: 25, topics: "人寿保险类型（定期寿险、终身寿险、储蓄保险、万能寿险），年金产品（即期年金、延期年金），危疾保险，伤残收入保障保险，长期护理保险，医疗保险（住院、门诊），团体人寿保险，退休计划" },
      { id: "3-2", name: "保单条款与条件", nameEn: "Policy Provisions", weight: 20, topics: "保单结构（声明、条款、批注、附加条款），不可争议条款，宽限期，保单复效，保单贷款，退保价值与非没收价值选项，受益人指定与变更，保费缴付方式，保单红利（现金红利、增额红利）" },
      { id: "3-3", name: "核保与保费", nameEn: "Underwriting & Premium", weight: 20, topics: "人寿保险核保流程，风险分类（标准体、次标准体、拒保），核保因素（年龄、性别、健康、职业、生活习惯），保费计算基础（死亡率、利率、费用），精算概念，生命表的使用，保费结构（纯保费与附加保费）" },
      { id: "3-4", name: "理赔与赔付", nameEn: "Claims & Settlement", weight: 15, topics: "人寿保险理赔程序，死亡理赔所需文件，理赔调查，争议解决，保单权益转让，保单信托安排，遗产税与保单的关系" },
      { id: "3-5", name: "行业法规与合规", nameEn: "Regulation & Compliance", weight: 20, topics: "长期保险业务监管要求，《保险业条例》中关于长期保险的条文，冷静期制度（21天），重要资料声明书（IFI），财务需要分析（FNA），销售说明书要求，投诉处理机制，保单持有人保障，反洗钱在长期保险中的应用" },
    ],
  },
};

const generatePrompt = (paper, chapter) => {
  return `你是一位香港保险中介人资格考试（IIQE）${paper === 'paper1' ? '卷一：保险原理及实务' : '卷三：长期保险'}的出题专家。

请根据以下章节生成一道高质量的中文选择题：

章节：${chapter.name}（${chapter.nameEn}）
考点范围：${chapter.topics}

要求：
1. 题目和选项全部用中文（繁体或简体均可）
2. 提供4个选项 A、B、C、D
3. 题目要贴近真实考试风格，注重理解而非死记硬背
4. 适当使用情景题考察应用能力
5. 错误选项要有迷惑性，但对理解概念的人来说能分辨
6. 解释要详细，要帮助考生真正理解，而不是简单说"因为A是对的"

请只返回以下JSON格式，不要markdown，不要反引号：
{"question":"题目文本","options":{"A":"选项A","B":"选项B","C":"选项C","D":"选项D"},"correct":"正确答案字母","explanation":"详细中文解释：为什么正确答案是对的，每个错误选项为什么错，以及这个知识点的记忆技巧和考试要点","key_concept":"核心考点（简短）"}`;
};

const STORAGE_KEY = "iiqe_qq_stats_v2";

// ===================== APP =====================
function App() {
  const [view, setView] = useState("home");
  const [activePaper, setActivePaper] = useState("paper1");
  const [activeChapter, setActiveChapter] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(null);
  const [stats, setStats] = useState(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : {}; } catch { return {}; }
  });

  const [examQs, setExamQs] = useState([]);
  const [examAns, setExamAns] = useState({});
  const [examIdx, setExamIdx] = useState(0);
  const [examDone, setExamDone] = useState(false);
  const [timer, setTimer] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stats)); } catch {} }, [stats]);

  useEffect(() => {
    if (view === "exam" && !examDone && !loading) {
      timerRef.current = setInterval(() => setTimer(t => t + 1), 1000);
      return () => clearInterval(timerRef.current);
    }
  }, [view, examDone, loading]);

  const getStat = (chId) => stats[chId] || { correct: 0, total: 0 };
  const getAcc = (chId) => { const s = getStat(chId); return s.total > 0 ? Math.round((s.correct / s.total) * 100) : null; };

  const recordAnswer = (chId, isCorrect) => {
    setStats(prev => {
      const s = prev[chId] || { correct: 0, total: 0 };
      return { ...prev, [chId]: { correct: s.correct + (isCorrect ? 1 : 0), total: s.total + 1 } };
    });
  };

  const getPaperStats = (paperId) => {
    const chapters = PAPERS[paperId].chapters;
    let c = 0, t = 0;
    chapters.forEach(ch => { const s = getStat(ch.id); c += s.correct; t += s.total; });
    return { correct: c, total: t, acc: t > 0 ? Math.round((c / t) * 100) : null };
  };

  const fetchQ = useCallback(async (chapter) => {
    setLoading(true); setErr(null); setSelected(null); setRevealed(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: generatePrompt(activePaper, chapter) }] }),
      });
      const data = await res.json();
      const text = data.content?.map(i => i.text || "").join("") || "";
      setQuestion(JSON.parse(text.replace(/```json|```/g, "").trim()));
    } catch { setErr("题目生成失败，请重试"); }
    setLoading(false);
  }, [activePaper]);

  const handleAnswer = (key) => {
    if (revealed) return;
    setSelected(key); setRevealed(true);
    recordAnswer(activeChapter.id, key === question.correct);
  };

  const startExam = async (paperId) => {
    setActivePaper(paperId); setView("exam"); setExamQs([]); setExamAns({}); setExamIdx(0); setExamDone(false); setTimer(0); setLoading(true);
    const paper = PAPERS[paperId];
    const qCount = paperId === "paper1" ? 15 : 10;
    const chapterPool = [];
    paper.chapters.forEach(ch => { const count = Math.max(1, Math.round((ch.weight / 100) * qCount)); for (let i = 0; i < count; i++) chapterPool.push(ch); });
    const shuffled = chapterPool.sort(() => Math.random() - 0.5).slice(0, qCount);
    const questions = [];
    for (const ch of shuffled) {
      try {
        const res = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 1200, messages: [{ role: "user", content: generatePrompt(paperId, ch) }] }),
        });
        const data = await res.json();
        const text = data.content?.map(i => i.text || "").join("") || "";
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        parsed._ch = ch; questions.push(parsed);
      } catch {}
    }
    setExamQs(questions); setLoading(false);
  };

  const submitExam = () => {
    setExamDone(true); clearInterval(timerRef.current);
    examQs.forEach((q, i) => { if (examAns[i]) recordAnswer(q._ch.id, examAns[i] === q.correct); });
  };

  const fmt = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  const C = { bg: '#faf9f7', card: '#ffffff', accent: '#d4a574', accentDark: '#b8845a', text: '#2d2926', textSec: '#8a817a', textLight: '#b5aca5', green: '#6b9e6b', red: '#c75c5c', border: '#ebe8e4', tagBg: '#f5f0eb', highlight: '#fef8f2' };

  if (view === "home") {
    const s1 = getPaperStats("paper1"); const s3 = getPaperStats("paper3");
    const daysLeft = Math.max(0, Math.ceil((new Date("2026-04-08") - new Date()) / 86400000));
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px', fontFamily: "'Georgia', 'Noto Serif SC', serif", background: C.bg, minHeight: '100vh' }}>
        <div style={{ textAlign: 'center', padding: '32px 0 24px' }}>
          <div style={{ fontSize: 14, letterSpacing: '0.2em', color: C.textLight, textTransform: 'uppercase', marginBottom: 8 }}>IIQE 备考</div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 400, color: C.text, letterSpacing: '0.05em' }}>泉泉专用学习网站</h1>
          <div style={{ marginTop: 12, display: 'inline-block', padding: '6px 20px', border: `1px solid ${C.accent}`, borderRadius: 20, fontSize: 13, color: C.accent }}>距离考试还有 <b>{daysLeft}</b> 天</div>
        </div>
        {(s1.total > 0 || s3.total > 0) && (
          <div style={{ background: C.card, borderRadius: 12, padding: '20px 24px', marginBottom: 24, border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: 12, color: C.textLight, letterSpacing: '0.1em', marginBottom: 14 }}>学习概况</div>
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 26, fontWeight: 300, color: C.text }}>{s1.total + s3.total}</div><div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>总做题</div></div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 26, fontWeight: 300, color: C.text }}>{(s1.total+s3.total) > 0 ? Math.round(((s1.correct+s3.correct)/(s1.total+s3.total))*100)+'%' : '—'}</div><div style={{ fontSize: 11, color: C.textLight, marginTop: 4 }}>总正确率</div></div>
            </div>
          </div>
        )}
        {["paper1", "paper3"].map(pid => {
          const p = PAPERS[pid]; const ps = getPaperStats(pid);
          return (
            <div key={pid} style={{ background: C.card, borderRadius: 12, padding: '24px', marginBottom: 16, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.2s' }}
              onClick={() => { setActivePaper(pid); setView("chapters"); }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div><div style={{ fontSize: 17, color: C.text, marginBottom: 4 }}>{p.name}</div><div style={{ fontSize: 12, color: C.textLight }}>{p.examDate} · {p.questions}题 · {p.time}</div></div>
                <div style={{ fontSize: 13, color: C.accent }}>→</div>
              </div>
              {ps.total > 0 && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: C.textLight, marginBottom: 6 }}><span>{ps.total}题已做</span><span style={{ color: ps.acc >= 70 ? C.green : C.red }}>{ps.acc}%</span></div>
                  <div style={{ height: 3, background: C.border, borderRadius: 2 }}><div style={{ height: '100%', width: `${ps.acc}%`, background: ps.acc >= 70 ? C.green : C.red, borderRadius: 2, transition: 'width 0.3s' }} /></div>
                </div>
              )}
            </div>
          );
        })}
        <div style={{ marginTop: 24, fontSize: 12, color: C.textLight, letterSpacing: '0.1em', marginBottom: 12 }}>模拟考试</div>
        <div style={{ display: 'flex', gap: 12 }}>
          {["paper1", "paper3"].map(pid => (
            <button key={pid} onClick={() => startExam(pid)} style={{ flex: 1, padding: '16px', background: C.text, color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', transition: 'opacity 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'} onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
              {pid === 'paper1' ? '卷一模拟' : '卷三模拟'}<div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{pid === 'paper1' ? '15题' : '10题'}</div>
            </button>
          ))}
        </div>
        {(s1.total > 0 || s3.total > 0) && (
          <button onClick={() => setStats({})} style={{ display: 'block', margin: '32px auto 0', background: 'none', border: 'none', color: C.textLight, fontSize: 12, cursor: 'pointer', textDecoration: 'underline' }}>重置所有数据</button>
        )}
      </div>
    );
  }

  if (view === "chapters") {
    const paper = PAPERS[activePaper];
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px', fontFamily: "'Georgia', 'Noto Serif SC', serif", background: C.bg, minHeight: '100vh' }}>
        <button onClick={() => setView("home")} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0', marginBottom: 16 }}>← 返回首页</button>
        <h2 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 400, color: C.text }}>{paper.name}</h2>
        <p style={{ margin: '0 0 24px', fontSize: 12, color: C.textLight }}>{paper.examDate} · 及格线 {paper.passRate}</p>
        {paper.chapters.map(ch => {
          const acc = getAcc(ch.id); const s = getStat(ch.id);
          return (
            <div key={ch.id} onClick={() => { setActiveChapter(ch); setView("practice"); fetchQ(ch); }}
              style={{ background: C.card, borderRadius: 10, padding: '18px 20px', marginBottom: 10, border: `1px solid ${C.border}`, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = C.accent} onMouseLeave={e => e.currentTarget.style.borderColor = C.border}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontSize: 15, color: C.text }}>{ch.name}</div><div style={{ fontSize: 11, color: C.textLight, marginTop: 3 }}>{ch.nameEn} · 占比{ch.weight}%</div></div>
                <div style={{ textAlign: 'right' }}>
                  {s.total > 0 ? (<><div style={{ fontSize: 18, fontWeight: 300, color: acc >= 70 ? C.green : acc >= 50 ? C.accentDark : C.red }}>{acc}%</div><div style={{ fontSize: 10, color: C.textLight }}>{s.total}题</div></>) : (<div style={{ fontSize: 12, color: C.textLight }}>未开始</div>)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (view === "practice") {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px', fontFamily: "'Georgia', 'Noto Serif SC', serif", background: C.bg, minHeight: '100vh' }}>
        <button onClick={() => setView("chapters")} style={{ background: 'none', border: 'none', color: C.accent, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', padding: '4px 0', marginBottom: 12 }}>← 返回章节</button>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 400, color: C.text }}>{activeChapter?.name}</h3>
          <div style={{ fontSize: 12, color: C.textLight }}>{(() => { const s = getStat(activeChapter?.id); const a = getAcc(activeChapter?.id); return s.total > 0 ? `已做${s.total}题 · 正确率${a}%` : '开始练习'; })()}</div>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: C.textSec, fontSize: 14, marginTop: 16 }}>AI 正在出题...</p>
          </div>
        ) : err ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <p style={{ color: C.red, fontSize: 14 }}>{err}</p>
            <button onClick={() => fetchQ(activeChapter)} style={{ marginTop: 12, padding: '8px 20px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.card, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>重试</button>
          </div>
        ) : question ? (
          <>
            <div style={{ background: C.card, borderRadius: 12, padding: '22px 24px', marginBottom: 14, border: `1px solid ${C.border}` }}>
              {question.key_concept && <div style={{ fontSize: 11, color: C.accent, marginBottom: 12, padding: '3px 10px', background: C.tagBg, borderRadius: 6, display: 'inline-block' }}>{question.key_concept}</div>}
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: C.text }}>{question.question}</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
              {Object.entries(question.options).map(([k, v]) => {
                const isSel = selected === k; const isCorr = k === question.correct;
                let bg = C.card, bdr = C.border;
                if (revealed) { if (isCorr) { bg = '#f2f8f2'; bdr = C.green; } else if (isSel) { bg = '#fdf2f2'; bdr = C.red; } }
                else if (isSel) { bg = C.highlight; bdr = C.accent; }
                return (
                  <button key={k} onClick={() => handleAnswer(k)} disabled={revealed}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: bg, border: `1.5px solid ${bdr}`, borderRadius: 10, cursor: revealed ? 'default' : 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, minWidth: 26, borderRadius: '50%', fontSize: 12, fontWeight: 600,
                      background: revealed ? (isCorr ? C.green : isSel ? C.red : C.tagBg) : isSel ? C.accent : C.tagBg,
                      color: (revealed && (isCorr || isSel)) || (!revealed && isSel) ? '#fff' : C.textSec }}>{k}</span>
                    <span style={{ fontSize: 14, lineHeight: 1.6, color: C.text, paddingTop: 2 }}>{v}</span>
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div style={{ background: C.card, borderRadius: 12, padding: '22px 24px', border: `1px solid ${C.border}`, marginBottom: 14 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: selected === question.correct ? C.green : C.red, marginBottom: 14 }}>{selected === question.correct ? '✓ 回答正确！' : '✗ 回答错误'}</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.8, color: C.text, whiteSpace: 'pre-wrap' }}>{question.explanation}</p>
                <button onClick={() => fetchQ(activeChapter)} style={{ width: '100%', marginTop: 20, padding: '14px', background: C.text, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit' }}>下一题 →</button>
              </div>
            )}
          </>
        ) : null}
      </div>
    );
  }

  if (view === "exam") {
    if (loading) return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px', fontFamily: "'Georgia', 'Noto Serif SC', serif", background: C.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: `2px solid ${C.border}`, borderTopColor: C.accent, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ color: C.textSec, fontSize: 14, marginTop: 16 }}>正在生成{PAPERS[activePaper].name}模拟试卷...</p>
      </div>
    );
    if (examDone) {
      let correct = 0; examQs.forEach((q, i) => { if (examAns[i] === q.correct) correct++; });
      const pct = examQs.length > 0 ? Math.round((correct / examQs.length) * 100) : 0; const passed = pct >= 70;
      return (
        <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px', fontFamily: "'Georgia', 'Noto Serif SC', serif", background: C.bg, minHeight: '100vh' }}>
          <div style={{ background: C.card, borderRadius: 14, padding: '36px 24px', textAlign: 'center', border: `1px solid ${C.border}`, marginBottom: 24 }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>{passed ? '🎉' : '💪'}</div>
            <h2 style={{ margin: '0 0 8px', fontSize: 22, fontWeight: 400, color: C.text }}>{passed ? '恭喜通过！' : '继续加油！'}</h2>
            <div style={{ fontSize: 44, fontWeight: 300, color: passed ? C.green : C.red, margin: '16px 0 8px' }}>{pct}%</div>
            <div style={{ fontSize: 13, color: C.textLight }}>{correct}/{examQs.length} 正确 · 用时 {fmt(timer)}</div>
            <div style={{ marginTop: 16, fontSize: 12, color: C.textLight, borderTop: `1px dashed ${C.border}`, paddingTop: 12 }}>及格线 70%</div>
          </div>
          <div style={{ fontSize: 12, color: C.textLight, letterSpacing: '0.1em', marginBottom: 12 }}>题目回顾</div>
          {examQs.map((q, i) => {
            const ans = examAns[i]; const ok = ans === q.correct;
            return (
              <div key={i} style={{ background: C.card, borderRadius: 10, padding: '16px 18px', marginBottom: 10, border: `1px solid ${C.border}`, borderLeftWidth: 3, borderLeftColor: ok ? C.green : C.red }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: C.textLight }}>Q{i+1} · {q._ch.name}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: ok ? C.green : C.red }}>{ok ? '✓' : '✗'}</span>
                </div>
                <p style={{ margin: '0 0 8px', fontSize: 13, lineHeight: 1.6, color: C.text }}>{q.question}</p>
                {!ok && <div style={{ fontSize: 12, color: C.green, background: '#f2f8f2', padding: '6px 10px', borderRadius: 6, marginBottom: 4 }}>正确: {q.correct}. {q.options[q.correct]}</div>}
                {ans && !ok && <div style={{ fontSize: 12, color: C.red, background: '#fdf2f2', padding: '6px 10px', borderRadius: 6, marginBottom: 4 }}>你选: {ans}. {q.options[ans]}</div>}
                <div style={{ fontSize: 12, lineHeight: 1.7, color: C.textSec, marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.border}` }}>{q.explanation}</div>
              </div>
            );
          })}
          <button onClick={() => setView("home")} style={{ width: '100%', padding: '14px', background: C.text, color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', marginTop: 8 }}>返回首页</button>
        </div>
      );
    }
    const cq = examQs[examIdx]; if (!cq) return null;
    return (
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 60px', fontFamily: "'Georgia', 'Noto Serif SC', serif", background: C.bg, minHeight: '100vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 13, color: C.textSec }}>⏱ {fmt(timer)}</span>
          <span style={{ fontSize: 13, color: C.accent }}>{examIdx + 1} / {examQs.length}</span>
        </div>
        <div style={{ height: 3, background: C.border, borderRadius: 2, marginBottom: 20, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((examIdx + 1) / examQs.length) * 100}%`, background: C.accent, borderRadius: 2, transition: 'width 0.3s' }} />
        </div>
        <div style={{ background: C.card, borderRadius: 12, padding: '20px 22px', marginBottom: 14, border: `1px solid ${C.border}` }}>
          <div style={{ fontSize: 11, color: C.accent, marginBottom: 10, padding: '3px 10px', background: C.tagBg, borderRadius: 6, display: 'inline-block' }}>{cq._ch.name}</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: C.text }}>{cq.question}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
          {Object.entries(cq.options).map(([k, v]) => {
            const isSel = examAns[examIdx] === k;
            return (
              <button key={k} onClick={() => setExamAns(p => ({ ...p, [examIdx]: k }))}
                style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', background: isSel ? C.highlight : C.card, border: `1.5px solid ${isSel ? C.accent : C.border}`, borderRadius: 10, cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, minWidth: 26, borderRadius: '50%', fontSize: 12, fontWeight: 600, background: isSel ? C.accent : C.tagBg, color: isSel ? '#fff' : C.textSec }}>{k}</span>
                <span style={{ fontSize: 14, lineHeight: 1.6, color: C.text, paddingTop: 2 }}>{v}</span>
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {examIdx > 0 && <button onClick={() => setExamIdx(i => i - 1)} style={{ padding: '12px 18px', border: `1px solid ${C.border}`, borderRadius: 8, background: C.card, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: C.textSec }}>← 上一题</button>}
          <div style={{ flex: 1 }} />
          {examIdx < examQs.length - 1 ? (
            <button onClick={() => setExamIdx(i => i + 1)} style={{ padding: '12px 18px', background: C.text, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>下一题 →</button>
          ) : (
            <button onClick={submitExam} style={{ padding: '12px 18px', background: C.green, color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>提交试卷</button>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
          {examQs.map((_, i) => (<button key={i} onClick={() => setExamIdx(i)} style={{ width: 10, height: 10, borderRadius: '50%', border: 'none', cursor: 'pointer', background: examAns[i] ? (i === examIdx ? C.accent : C.accentDark) : (i === examIdx ? C.textSec : C.border), opacity: i === examIdx ? 1 : 0.7 }} />))}
        </div>
      </div>
    );
  }
  return null;
}

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = `@keyframes spin{to{transform:rotate(360deg)}}@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;600;700&display=swap');*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}body{margin:0;background:#faf9f7}`;
  document.head.appendChild(s);
}

export default App;
