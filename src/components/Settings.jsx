import { useState, useEffect, useRef } from 'react'
import { PAPERS } from '../data/chapters'
import { load, save } from '../lib/storage'
import { isCloudEnabled, generateSyncCode, restoreFromSyncCode, forcePush } from '../lib/supabase'

const SETTINGS_KEY = 'settings'

function getSettings() {
  return load(SETTINGS_KEY, { questionsPerRound: 20, encouragementEnabled: true })
}

function saveSettings(s) {
  save(SETTINGS_KEY, s)
}

export function useSettings() {
  const [settings, setSettings] = useState(getSettings)
  const update = (partial) => {
    const next = { ...settings, ...partial }
    setSettings(next)
    saveSettings(next)
  }
  return { settings, update }
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in px-6">
      <div className="glass-card-solid rounded-2xl p-6 max-w-sm w-full text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <p className="text-sm text-charcoal leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl text-sm font-semibold glass-card-solid text-charcoal-light hover:shadow-sm transition-all"
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 rounded-xl text-sm font-semibold text-white bg-coral-500 hover:bg-coral-600 transition-colors"
          >
            确认重置
          </button>
        </div>
      </div>
    </div>
  )
}

function BackupSection({ showToast }) {
  const fileInputRef = useRef(null)

  const handleExport = () => {
    const data = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('iiqe_')) {
        data[key] = localStorage.getItem(key)
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `iiqe-backup-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('备份文件已下载')
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        let count = 0
        for (const [key, value] of Object.entries(data)) {
          if (key.startsWith('iiqe_')) {
            localStorage.setItem(key, value)
            count++
          }
        }
        showToast(`已恢复 ${count} 项数据，正在刷新...`)
        setTimeout(() => window.location.reload(), 1000)
      } catch {
        showToast('文件格式错误')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="glass-card-solid rounded-2xl p-5 space-y-4">
      <div className="text-xs text-pink-400 tracking-wider font-semibold uppercase">💾 数据备份</div>
      <div className="text-xs text-charcoal-light/50">导出做题进度备份文件，换手机或清缓存后可恢复</div>
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-cream-50 text-charcoal-light hover:bg-cream-100 transition-all"
        >
          📤 导出备份
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 py-3 rounded-xl text-sm font-semibold bg-cream-50 text-charcoal-light hover:bg-cream-100 transition-all"
        >
          📥 导入恢复
        </button>
        <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </div>
    </div>
  )
}

export default function Settings({ stats, errorBook, onBack }) {
  const { settings, update } = useSettings()
  const [confirm, setConfirm] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2000)
  }

  const allChapters = [
    ...PAPERS.paper1.chapters.map(ch => ({ ...ch, paper: 'paper1', paperName: '卷一' })),
    ...PAPERS.paper3.chapters.map(ch => ({ ...ch, paper: 'paper3', paperName: '卷三' })),
  ]

  const [selectedChapter, setSelectedChapter] = useState(allChapters[0]?.id || '')

  const resetActions = [
    {
      label: '重置卷一数据',
      message: '确定要重置卷一（保险原理及实务）的所有做题数据吗？此操作不可恢复。',
      action: () => { stats.resetPaper('paper1'); showToast('卷一数据已重置') },
    },
    {
      label: '重置卷三数据',
      message: '确定要重置卷三（长期保险）的所有做题数据吗？此操作不可恢复。',
      action: () => { stats.resetPaper('paper3'); showToast('卷三数据已重置') },
    },
    {
      label: '重置错题本',
      message: '确定要清空所有错题记录吗？此操作不可恢复。',
      action: () => { errorBook.resetErrors(); showToast('错题本已重置') },
    },
    {
      label: '重置全部数据',
      message: '确定要重置所有数据（做题记录、错题本、成就）吗？此操作不可恢复。',
      action: () => { stats.resetAll(); errorBook.resetErrors(); showToast('全部数据已重置') },
      danger: true,
    },
  ]

  return (
    <div className="animate-fade-in space-y-4 pb-8">
      {confirm && (
        <ConfirmDialog
          message={confirm.message}
          onConfirm={() => { confirm.action(); setConfirm(null) }}
          onCancel={() => setConfirm(null)}
        />
      )}

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-mint-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg animate-fade-in">
          ✓ {toast}
        </div>
      )}

      <button onClick={onBack} className="text-pink-400 text-sm mb-3 hover:text-pink-500 transition-colors font-medium">
        ← 返回首页
      </button>

      <h2 className="font-display text-2xl font-semibold text-charcoal">设置</h2>

      {/* Learning Settings */}
      <div className="glass-card-solid rounded-2xl p-5 space-y-4">
        <div className="text-xs text-pink-400 tracking-wider font-semibold uppercase">🎯 学习设置</div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-charcoal">每轮题数</div>
            <div className="text-xs text-charcoal-light/50 mt-0.5">每次练习的题目数量</div>
          </div>
          <div className="flex gap-1.5">
            {[10, 20, 30].map(n => (
              <button
                key={n}
                onClick={() => update({ questionsPerRound: n })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  settings.questionsPerRound === n
                    ? 'gradient-pink-purple text-white shadow-sm'
                    : 'bg-cream-100 text-charcoal-light/60 hover:bg-cream-200'
                }`}
              >
                {n}题
              </button>
            ))}
          </div>
        </div>

        <div className="h-px bg-cream-100" />

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-charcoal">角色鼓励</div>
            <div className="text-xs text-charcoal-light/50 mt-0.5">显示家人们的加油动画</div>
          </div>
          <button
            onClick={() => update({ encouragementEnabled: !settings.encouragementEnabled })}
            className={`w-12 h-7 rounded-full transition-all relative ${
              settings.encouragementEnabled ? 'gradient-pink-purple' : 'bg-cream-200'
            }`}
          >
            <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${
              settings.encouragementEnabled ? 'left-6' : 'left-1'
            }`} />
          </button>
        </div>
      </div>

      {/* Data Management */}
      <div className="glass-card-solid rounded-2xl p-5 space-y-4">
        <div className="text-xs text-pink-400 tracking-wider font-semibold uppercase">📊 数据管理</div>

        {resetActions.map((item, i) => (
          <button
            key={i}
            onClick={() => setConfirm(item)}
            className={`w-full text-left py-3 px-4 rounded-xl text-sm font-medium transition-all ${
              item.danger
                ? 'bg-coral-50 text-coral-600 hover:bg-coral-100'
                : 'bg-cream-50 text-charcoal-light hover:bg-cream-100'
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="h-px bg-cream-100" />

        {/* Reset single chapter */}
        <div>
          <div className="text-sm font-medium text-charcoal mb-2">重置单章数据</div>
          <div className="flex gap-2">
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value)}
              className="flex-1 py-2.5 px-3 rounded-xl text-sm bg-cream-50 text-charcoal border border-cream-200 outline-none focus:border-pink-300 transition-colors"
            >
              {allChapters.map(ch => (
                <option key={ch.id} value={ch.id}>
                  {ch.paperName} - {ch.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                const ch = allChapters.find(c => c.id === selectedChapter)
                if (ch) {
                  setConfirm({
                    message: `确定要重置「${ch.paperName} - ${ch.name}」的做题数据吗？`,
                    action: () => { stats.resetChapter(selectedChapter); showToast(`${ch.name} 数据已重置`) },
                  })
                }
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-medium bg-cream-50 text-charcoal-light hover:bg-cream-100 transition-all"
            >
              重置
            </button>
          </div>
        </div>
      </div>

      {/* Backup */}
      <BackupSection showToast={showToast} />

      {/* About */}
      <div className="glass-card-solid rounded-2xl p-5 space-y-3">
        <div className="text-xs text-pink-400 tracking-wider font-semibold uppercase">ℹ️ 关于</div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-charcoal-light/60">版本</span>
            <span className="text-charcoal font-medium">v2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-light/60">考试日期</span>
            <span className="text-charcoal font-medium">2026年4月8日</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-light/60">卷三</span>
            <span className="text-charcoal font-medium">14:00-15:15</span>
          </div>
          <div className="flex justify-between">
            <span className="text-charcoal-light/60">卷一</span>
            <span className="text-charcoal font-medium">15:45-17:45</span>
          </div>
        </div>
      </div>
    </div>
  )
}
