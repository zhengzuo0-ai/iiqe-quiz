export const PAPERS = {
  paper1: {
    name: '卷一：保险原理及实务',
    nameEn: 'Paper 1: Principles & Practice of Insurance',
    time: '120分钟',
    questions: 75,
    passRate: '70%（53/75题）',
    examDate: '4月8日 15:45',
    chapters: [
      { id: '1-1', name: '风险与保险概论', nameEn: 'Risk & Insurance', weight: 15, topics: '风险的定义（纯粹风险与投机风险、基本风险与特定风险），风险管理技术（回避、减少、自留、转移），保险的功能与利益，保险的运作方式，香港保险业历史发展' },
      { id: '1-2', name: '法律原则', nameEn: 'Legal Principles', weight: 15, topics: '合约法基础（要约、承诺、对价、行为能力、合法性），代理法（代理人类型、代理人的权限包括明示/默示/表见授权、代理人的义务），侵权法基础，最高诚信原则（uberrimae fidei），披露与失实陈述，保证与条件' },
      { id: '1-3', name: '保险原则', nameEn: 'Insurance Principles', weight: 20, topics: '可保利益（定义、不同保险类别中何时需要），弥偿原则（赔付方式：现金赔付、修理、更换、恢复原状），代位求偿权（定义、运作方式、保险人的权利），分摊（双重保险、按比例分摊），近因原则（causa proxima），转让与提名' },
      { id: '1-4', name: '保险运作', nameEn: 'Insurance Functions', weight: 15, topics: '核保（风险评估、投保书、道德风险、实质风险），保费厘定与计算，理赔处理与赔付，再保险（临时再保险、合约再保险、比例再保险、非比例再保险），香港保险市场结构（劳合社、保险公司、经纪、代理）' },
      { id: '1-5', name: '保险产品', nameEn: 'Insurance Products', weight: 15, topics: '人寿保险（终身寿险、储蓄寿险、定期寿险），一般保险产品（财产险、责任险、汽车险、海上险、意外及健康险），长期保险产品概述，投资相连保险概述，团体保险，年金' },
      { id: '1-6', name: '监管框架', nameEn: 'Regulatory Framework', weight: 10, topics: '《保险业条例》（第41章），保险业监管局（保监局）的角色与权力，2015年《保险公司条例》，中介人发牌要求，自律监管组织，IIQE资格考试要求，保单持有人保障基金' },
      { id: '1-7', name: '道德与合规', nameEn: 'Ethics & Compliance', weight: 10, topics: '《持牌保险中介人操守守则》，反洗钱（AML）要求，反恐融资，《个人资料（私隐）条例》（六项保障资料原则），《防止贿赂条例》（POBO），保险欺诈防范，专业道德与责任，投诉处理，廉政公署（ICAC）角色' },
    ],
  },
  paper3: {
    name: '卷三：长期保险',
    nameEn: 'Paper 3: Long Term Insurance',
    time: '75分钟',
    questions: 50,
    passRate: '70%（35/50题）',
    examDate: '4月8日 14:00',
    chapters: [
      { id: '3-1', name: '长期保险产品', nameEn: 'LT Insurance Products', weight: 25, topics: '人寿保险类型（定期寿险、终身寿险、储蓄保险、万能寿险），年金产品（即期年金、延期年金），危疾保险，伤残收入保障保险，长期护理保险，医疗保险（住院、门诊），团体人寿保险，退休计划' },
      { id: '3-2', name: '保单条款与条件', nameEn: 'Policy Provisions', weight: 20, topics: '保单结构（声明、条款、批注、附加条款），不可争议条款，宽限期，保单复效，保单贷款，退保价值与非没收价值选项，受益人指定与变更，保费缴付方式，保单红利（现金红利、增额红利）' },
      { id: '3-3', name: '核保与保费', nameEn: 'Underwriting & Premium', weight: 20, topics: '人寿保险核保流程，风险分类（标准体、次标准体、拒保），核保因素（年龄、性别、健康、职业、生活习惯），保费计算基础（死亡率、利率、费用），精算概念，生命表的使用，保费结构（纯保费与附加保费）' },
      { id: '3-4', name: '理赔与赔付', nameEn: 'Claims & Settlement', weight: 15, topics: '人寿保险理赔程序，死亡理赔所需文件，理赔调查，争议解决，保单权益转让，保单信托安排，遗产税与保单的关系' },
      { id: '3-5', name: '行业法规与合规', nameEn: 'Regulation & Compliance', weight: 20, topics: '长期保险业务监管要求，《保险业条例》中关于长期保险的条文，冷静期制度（21天），重要资料声明书（IFI），财务需要分析（FNA），销售说明书要求，投诉处理机制，保单持有人保障，反洗钱在长期保险中的应用' },
    ],
  },
}

export const generatePrompt = (paper, chapter) => {
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
{"question":"题目文本","options":{"A":"选项A","B":"选项B","C":"选项C","D":"选项D"},"correct":"正确答案字母","explanation":"详细中文解释：为什么正确答案是对的，每个错误选项为什么错，以及这个知识点的记忆技巧和考试要点","key_concept":"核心考点（简短）"}`
}
