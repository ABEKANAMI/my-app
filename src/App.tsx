/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Beer, 
  CheckCircle2, 
  Trash2, 
  Copy, 
  RefreshCw, 
  Share2, 
  Sparkles, 
  X, 
  Coins, 
  Info,
  Sliders,
  DollarSign,
  Plus,
  Moon,
  Sun,
  UserCheck,
  Percent
} from 'lucide-react';
import { Role, Member, RoundingRule, DrinkerSetting, SplitResult, ClassSummary } from './types';
import { DEFAULT_ROLES, DEFAULT_MEMBERS } from './data/defaultMembers';
import { calculateSplits, generateClassSummary, generateLineShareText } from './utils/calculator';

export default function App() {
  // --- States ---
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [members, setMembers] = useState<Member[]>(DEFAULT_MEMBERS);
  const [totalBill, setTotalBill] = useState<number>(45000); // Standard drinking party cost
  const [roundingRule, setRoundingRule] = useState<RoundingRule>('up100'); // Standard 100 yen round up
  const [drinkerSetting, setDrinkerSetting] = useState<DrinkerSetting>({
    mode: 'flat_surcharge',
    value: 500, // 500 yen extra for drinkers
  });

  // Modal / form states for adding a member
  const [showAddModal, setShowAddModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRoleId, setNewMemberRoleId] = useState('parttimer');
  const [newMemberIsDrinker, setNewMemberIsDrinker] = useState(true);

  // States for delete & reset confirmation custom modals (instead of window.confirm)
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Line copy visual cue state
  const [copied, setCopied] = useState(false);

  // Suggested values for quick entry
  const quickAmounts = [15000, 30000, 45000, 60000, 80000, 100000];

  // --- Calculations ---
  const calculated = useMemo(() => {
    return calculateSplits(totalBill, roles, members, roundingRule, drinkerSetting);
  }, [totalBill, roles, members, roundingRule, drinkerSetting]);

  const classSummaries = useMemo(() => {
    return generateClassSummary(roles, calculated.splits, members);
  }, [roles, calculated.splits, members]);

  // Attendance Statistics
  const totalMemberCount = members.length;
  const attendingCount = members.filter((m) => m.isAttending).length;
  const drinkingAttendeesCount = members.filter((m) => m.isAttending && m.isDrinker).length;
  const nonDrinkingAttendeesCount = attendingCount - drinkingAttendeesCount;

  // --- Action Handlers ---
  const handleToggleAttendance = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, isAttending: !m.isAttending } : m));
  };

  const handleToggleDrinker = (id: string) => {
    setMembers(prev => prev.map(m => m.id === id ? { ...m, isDrinker: !m.isDrinker } : m));
  };

  const handleRoleWeightChange = (roleId: string, weight: number) => {
    setRoles(prev => prev.map(r => r.id === roleId ? { ...r, weight: Math.max(0, weight) } : r));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;

    const newMember: Member = {
      id: 'm_' + Date.now(),
      name: newMemberName.trim(),
      roleId: newMemberRoleId,
      isDrinker: newMemberIsDrinker,
      isAttending: true,
    };

    setMembers(prev => [...prev, newMember]);
    setNewMemberName('');
    setNewMemberIsDrinker(true);
    setShowAddModal(false);
  };

  const handleDeleteMember = (member: Member) => {
    setMemberToDelete(member);
  };

  const confirmDeleteMember = () => {
    if (memberToDelete) {
      setMembers(prev => prev.filter(m => m.id !== memberToDelete.id));
      setMemberToDelete(null);
    }
  };

  const handleSelectAll = () => {
    setMembers(prev => prev.map(m => ({ ...m, isAttending: true })));
  };

  const handleDeselectAll = () => {
    setMembers(prev => prev.map(m => ({ ...m, isAttending: false })));
  };

  const handleResetToDefaults = () => {
    setShowResetConfirm(true);
  };

  const confirmResetToDefaults = () => {
    setRoles(DEFAULT_ROLES);
    setMembers(DEFAULT_MEMBERS);
    setTotalBill(45000);
    setRoundingRule('up100');
    setDrinkerSetting({ mode: 'flat_surcharge', value: 500 });
    setShowResetConfirm(false);
  };

  // Copy to LINE share text
  const shareText = useMemo(() => {
    return generateLineShareText(totalBill, calculated.totalCollected, calculated.surplus, classSummaries, calculated.splits);
  }, [totalBill, calculated, classSummaries]);

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  // Helper colors for the different classes
  const getRoleBadgeClasses = (roleId: string) => {
    switch (roleId) {
      case 'president':
        return 'bg-rose-50 border border-rose-100 text-rose-700';
      case 'manager':
        return 'bg-blue-50 border border-blue-100 text-blue-700';
      case 'employee':
        return 'bg-emerald-50 border border-emerald-100 text-emerald-700';
      case 'parttimer':
        return 'bg-amber-50 border border-amber-100 text-amber-700';
      default:
        return 'bg-slate-50 border border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans antialiased flex flex-col">
      {/* Header element styled with KESHAVARI Sleek Blue */}
      <header className="bg-indigo-700 text-white shadow-md border-b border-indigo-800 sticky top-0 z-40 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl border border-white/20">
              <Sparkles className="h-6 w-6 text-indigo-200 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight font-display flex items-center gap-2">
                KESHAVARI <span className="bg-indigo-600 text-indigo-100 py-0.5 px-2 rounded-md text-[11px] font-normal tracking-wider">傾斜割り勘電卓</span>
              </h1>
              <p className="text-xs text-indigo-200 mt-0.5">社長・部長・社員・バイトの比率＆お酒有無でスマートお会計</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Quick Bill Info Box */}
            <div className="bg-indigo-850/80 border border-indigo-500/30 px-4 py-2 rounded-xl flex items-center gap-3">
              <div className="text-left">
                <span className="block text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">お支払総額</span>
                <span className="text-2xl font-bold font-mono text-white leading-tight">
                  ¥ {totalBill.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleResetToDefaults}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/10 px-3 py-2 rounded-xl font-medium text-xs flex items-center gap-1.5 transition-all"
              title="データをリセット"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>リセット</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Roster Management (lg:col-span-5) */}
        <section className="lg:col-span-5 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Section Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-indigo-600" />
                <span>サークル名簿・参加者チェック</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                飲み会に来たメンバーを選択、飲酒状況をONにします
              </p>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-1.5 rounded-lg font-bold text-xs flex items-center gap-1 transition-all shadow-sm"
                title="新しい人を追加"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only text-[11px]">追加</span>
              </button>
            </div>
          </div>

          {/* Selection helpers and Quick Stats */}
          <div className="px-4 py-2.5 bg-indigo-50/50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>参加: {attendingCount} / {totalMemberCount}名</span>
              <span className="text-slate-300">|</span>
              <Beer className="h-3.5 w-3.5 text-amber-500" />
              <span>飲酒: {drinkingAttendeesCount}名</span>
            </span>

            <div className="flex gap-1">
              <button
                onClick={handleSelectAll}
                className="text-[11px] font-bold text-indigo-700 hover:bg-indigo-100/60 bg-white border border-indigo-200 px-2 py-1 rounded-md transition-all"
              >
                全員参加
              </button>
              <button
                onClick={handleDeselectAll}
                className="text-[11px] font-bold text-slate-600 hover:bg-slate-100 bg-white border border-slate-200 px-2 py-1 rounded-md transition-all"
              >
                全員欠席
              </button>
            </div>
          </div>

          {/* Member list scroll container */}
          <div className="flex-1 overflow-y-auto max-h-[460px] p-4 space-y-2">
            {members.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Users className="h-12 w-12 mx-auto stroke-1 mb-3 text-slate-300" />
                <p className="text-sm">名簿にメンバーが追加されていません。</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="mt-3 text-xs text-indigo-600 font-bold underline hover:text-indigo-800"
                >
                  最初のメンバーを設定する
                </button>
              </div>
            ) : (
              members.map((member) => {
                const isAttending = member.isAttending;
                const role = roles.find(r => r.id === member.roleId);

                return (
                  <div
                    key={member.id}
                    id={`member-${member.id}`}
                    className={`flex items-center justify-between p-3 border rounded-xl gap-3 transition-all ${
                      isAttending
                        ? 'border-indigo-100 bg-indigo-50/20 hover:bg-indigo-50/40'
                        : 'border-slate-100 bg-slate-50/40 opacity-55 hover:opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Attendance checkbox */}
                      <label className="flex items-center cursor-pointer p-1">
                        <input
                          type="checkbox"
                          checked={isAttending}
                          onChange={() => handleToggleAttendance(member.id)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          isAttending
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}>
                          {isAttending && <CheckCircle2 className="h-4 w-4" />}
                        </div>
                      </label>

                      {/* Avatar with dynamic initials */}
                      <div className={`w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-bold leading-none ${
                        isAttending ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-400'
                      }`}>
                        {member.name.substring(0, 2)}
                      </div>

                      <div className="min-w-0">
                        <p className={`font-bold text-sm ${isAttending ? 'text-slate-800' : 'text-slate-400'}`}>
                          {member.name}
                        </p>
                        <span className={`inline-block text-[10px] px-1.5 py-0.2 rounded-full font-semibold mt-1 ${getRoleBadgeClasses(member.roleId)}`}>
                          {role ? role.name : '一般'}
                        </span>
                      </div>
                    </div>

                    {/* Drinker control and remove action */}
                    <div className="flex items-center gap-2">
                      {/* Drinker state indicator */}
                      {isAttending && (
                        <button
                          onClick={() => handleToggleDrinker(member.id)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                            member.isDrinker
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 hover:bg-amber-500/20'
                              : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                          }`}
                          title={member.isDrinker ? "飲酒状況：お酒を飲む" : "飲酒状況：お酒を飲まない"}
                        >
                          <Beer className={`h-3.5 w-3.5 ${member.isDrinker ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                          <span className="sr-only sm:not-sr-only text-[11px]">
                            {member.isDrinker ? '飲む' : '飲まない'}
                          </span>
                        </button>
                      )}

                      {/* Delete icon */}
                      <button
                        onClick={() => handleDeleteMember(member)}
                        className="text-slate-350 hover:text-red-600 p-1 rounded-md hover:bg-slate-100 transition-colors"
                        title="メンバーを削除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* RIGHT COLUMN: Settings and Live Splits (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* BILL INPUT & ROUNDING CONFIG */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
              <Coins className="h-4 w-4 text-indigo-600" />
              <span>お会計＆端数単位の設定</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Total bill input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">お会計の総額 (税込み)</label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-slate-500 font-bold text-sm">¥</span>
                  </div>
                  <input
                    type="number"
                    value={totalBill}
                    onChange={(e) => setTotalBill(Math.max(0, parseInt(e.target.value) || 0))}
                    className="block w-full pl-8 pr-32 py-2 text-lg font-mono font-bold text-slate-800 border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 rounded-lg outline-none transition-all"
                    placeholder="例: 45000"
                    min="0"
                  />
                  <div className="absolute inset-y-0 right-0 py-1 px-2.5 flex items-center text-xs text-slate-500 font-semibold bg-slate-50 border-l border-slate-200 rounded-r-lg">
                    日本円相当
                  </div>
                </div>
                {/* Quick entries */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setTotalBill(amt)}
                      className={`text-[10px] font-semibold px-2 py-1 rounded transition-colors ${
                        totalBill === amt
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      ¥{(amt / 1000).toFixed(0)}k
                    </button>
                  ))}
                </div>
              </div>

              {/* Rounding unit */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">端数処理方法 (端数は幹事獲得)</label>
                <select
                  value={roundingRule}
                  onChange={(e) => setRoundingRule(e.target.value as RoundingRule)}
                  className="block w-full bg-white border-2 border-slate-200 py-2.5 px-4 rounded-lg text-sm text-slate-700 outline-none focus:border-indigo-500 transition-all font-medium"
                >
                  <option value="up100">100円未満切り上げ ★推奨 (お釣り余り◎)</option>
                  <option value="down100">100円未満切り捨て (不足分自己負担)</option>
                  <option value="round100">100円未満四捨五入</option>
                  <option value="up500">500円単位切り上げ (お釣り多め)</option>
                  <option value="up1000">1000円単位切り上げ (ざっくり精算)</option>
                  <option value="none">1円単位（端数端数なし）</option>
                </select>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
                  <Info className="h-3 w-3 shrink-0" />
                  <span>「100円未満切り上げ」は集計額が少し多くなり幹事のお釣り分になります。</span>
                </div>
              </div>
            </div>
          </section>

          {/* RATIO & CLASS WEIGHTS CONFIG */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
            <h2 className="font-bold text-slate-800 flex items-center gap-2 text-sm border-b border-slate-100 pb-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              <span>クラス別 傾斜比率 (Weight) の設定</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {roles.map((role) => {
                let strokeColor = 'border-slate-100';
                let focusColor = 'focus:border-indigo-500';
                let labelColor = 'text-slate-600';

                if (role.id === 'president') {
                  strokeColor = 'border-rose-100 bg-rose-50/20';
                  focusColor = 'focus:border-rose-500';
                  labelColor = 'text-rose-600';
                } else if (role.id === 'manager') {
                  strokeColor = 'border-blue-100 bg-blue-50/20';
                  focusColor = 'focus:border-blue-500';
                  labelColor = 'text-blue-600';
                } else if (role.id === 'employee') {
                  strokeColor = 'border-emerald-100 bg-emerald-50/20';
                  focusColor = 'focus:border-emerald-500';
                  labelColor = 'text-emerald-600';
                } else if (role.id === 'parttimer') {
                  strokeColor = 'border-amber-100 bg-amber-50/20';
                  focusColor = 'focus:border-amber-550';
                  labelColor = 'text-amber-600';
                }

                return (
                  <div key={role.id} className={`text-center p-2.5 border-2 rounded-xl ${strokeColor}`}>
                    <p className={`text-xs font-bold ${labelColor} mb-1`}>{role.name}</p>
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleRoleWeightChange(role.id, Math.max(0, role.weight - 1))}
                        className="w-6 h-6 rounded bg-slate-200/50 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={role.weight}
                        onChange={(e) => handleRoleWeightChange(role.id, Math.max(0, parseInt(e.target.value) || 0))}
                        className={`w-10 text-center py-1 font-mono hover:bg-white text-lg font-bold rounded border border-transparent ${focusColor} outline-none bg-transparent`}
                        min="0"
                      />
                      <button
                        type="button"
                        onClick={() => handleRoleWeightChange(role.id, role.weight + 1)}
                        className="w-6 h-6 rounded bg-slate-200/50 hover:bg-slate-200 text-slate-700 font-bold text-xs"
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DRINKER DIFFERENCE SURCHARGE CONFIG */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Beer className="h-4 w-4 text-amber-500" />
                  お酒を飲む人と飲まない人の差額
                </span>
                <span className="block text-[10px] text-slate-400">
                  飲む人は飲み放題上乗せ・または追加注文分として傾斜にプラスします
                </span>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={drinkerSetting.mode}
                  onChange={(e) => setDrinkerSetting(prev => ({
                    ...prev,
                    mode: e.target.value as DrinkerSetting['mode']
                  }))}
                  className="bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-lg text-xs outline-none focus:border-indigo-500 font-medium text-slate-600"
                >
                  <option value="flat_surcharge">お酒一律プラス（円）</option>
                  <option value="weight_multiplier">比率を掛け算（倍率）</option>
                  <option value="none">差をつけない</option>
                </select>

                {drinkerSetting.mode !== 'none' && (
                  <div className="flex items-center gap-1 bg-slate-100 py-1 px-2.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-mono font-bold text-indigo-600">
                      {drinkerSetting.mode === 'flat_surcharge' ? '+ ¥' : '×'}
                    </span>
                    <input
                      type="number"
                      value={drinkerSetting.value}
                      onChange={(e) => setDrinkerSetting(prev => ({
                        ...prev,
                        value: Math.max(0, parseFloat(e.target.value) || 0)
                      }))}
                      className="w-16 text-right font-mono font-bold bg-transparent outline-none text-xs text-indigo-700"
                      step={drinkerSetting.mode === 'flat_surcharge' ? '100' : '0.1'}
                      min="0"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SPLIT EXPERT DISPLAY / CALCULATION SUMMARY */}
          <section className="bg-indigo-900 rounded-2xl shadow-xl p-6 sm:p-7 text-white relative overflow-hidden flex flex-col justify-between">
            {/* Ambient neon aesthetic layer */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-indigo-650/30 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute -left-12 -top-12 w-32 h-32 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>

            {/* Results Title Block */}
            <div className="z-10 flex items-center justify-between gap-4 border-b border-indigo-750 pb-3 mb-4">
              <div>
                <h3 className="text-indigo-200 text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <span>計算結果一覧（クラス・役職別）</span>
                </h3>
                <p className="text-[10px] text-indigo-300 mt-0.5">
                  お酒飲む／飲まないに応じた1人あたりの集計
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] text-indigo-250 bg-indigo-800/80 px-2 py-0.5 rounded font-medium border border-indigo-700/55">
                  {roundingRule === 'up100' && '100円未満切り上げ'}
                  {roundingRule === 'down100' && '100円未満切り捨て'}
                  {roundingRule === 'round100' && '100円未満四捨五入'}
                  {roundingRule === 'up500' && '500円未満切り上げ'}
                  {roundingRule === 'up1000' && '1000円未満切り上げ'}
                  {roundingRule === 'none' && '1円単位・処理なし'}
                </span>
              </div>
            </div>

            {/* Class Breakdown Items */}
            <div className="z-10 space-y-3.5 my-1 flex-1">
              {attendingCount === 0 ? (
                <div className="text-center py-10 text-indigo-250">
                  <Info className="h-10 w-10 mx-auto opacity-40 mb-2" />
                  <p className="text-sm font-semibold">参加中のメンバーがいません</p>
                  <p className="text-xs opacity-75 mt-1">左側名簿の顔ぶれにチェックをいれてください</p>
                </div>
              ) : (
                classSummaries.map((summary) => {
                  const hasDry = summary.nonDrinkerCount > 0;
                  const hasWet = summary.drinkerCount > 0;

                  if (!hasDry && !hasWet) return null;

                  return (
                    <div
                      key={summary.roleId}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-white/5 last:border-0"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs text-indigo-300/90 font-bold flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-white/40"></span>
                          {summary.roleName}
                          <span className="text-[10px] font-normal text-indigo-400">
                            (比率: {summary.weight})
                          </span>
                        </span>
                        
                        <span className="text-xs mt-0.5 text-white/80 pl-3">
                          {[
                            hasWet ? `飲む人 ${summary.drinkerCount}名` : '',
                            hasDry ? `飲まない人 ${summary.nonDrinkerCount}名` : ''
                          ].filter(Boolean).join('、')}
                        </span>
                      </div>

                      {/* Side amounts */}
                      <div className="flex flex-wrap items-center gap-2 sm:text-right sm:justify-end shrink-0 font-mono">
                        {hasWet && (
                          <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-1 text-xs">
                            <span className="text-[9px] text-amber-300 block uppercase font-sans font-semibold tracking-wider text-left">お酒飲む</span>
                            <span className="text-sm font-bold text-white">¥ {summary.drinkerAmount.toLocaleString()}</span>
                          </div>
                        )}
                        
                        {hasDry && (
                          <div className="bg-indigo-950/45 border border-white/5 rounded-xl px-3 py-1 text-xs">
                            <span className="text-[9px] text-slate-300 block uppercase font-sans font-semibold tracking-wider text-left">お酒飲まない</span>
                            <span className="text-sm font-bold text-white/95">¥ {summary.nonDrinkerAmount.toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Collector total summary panel */}
            <div className="bg-indigo-950/60 rounded-2xl p-4 mt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-white/10 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-650/40 rounded-lg shrink-0">
                  <Coins className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-250 uppercase font-bold tracking-wider">幹事の取り分（お釣り/余り）</span>
                  <p className="text-2xl font-mono font-black text-amber-300">
                    ¥ {calculated.surplus.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                <span className="text-[9px] text-indigo-250 uppercase block font-bold">回収合計金額</span>
                <span className="text-lg font-mono font-bold block text-emerald-300">
                  ¥ {calculated.totalCollected.toLocaleString()}
                </span>
                <span className="text-[10px] text-slate-300 block">
                  (元会計: ¥{totalBill.toLocaleString()})
                </span>
              </div>
            </div>

            {/* Share action trigger */}
            {attendingCount > 0 && (
              <div className="mt-5 pt-4 border-t border-indigo-850/80 flex flex-col sm:flex-row gap-2 z-10">
                <button
                  onClick={handleCopyToClipboard}
                  className={`flex-1 ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-white text-indigo-900 hover:bg-slate-50'
                  } py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md`}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      <span>LINE精算用テキストをコピーしました！</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      <span>LINE共有テキストをコピー</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </section>

          {/* INDIVIDUAL EXPANDABLE SPLIT DETAILS LIST */}
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-xs border-b border-slate-100 pb-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>一人ひとりのお支払い明細 ({attendingCount}名分)</span>
            </h3>

            <div className="max-h-[220px] overflow-y-auto divide-y divide-slate-100 pr-1">
              {calculated.splits.length === 0 ? (
                <p className="text-center py-6 text-xs text-slate-400">お支払い対象メンバーはいません。</p>
              ) : (
                calculated.splits.map((split) => {
                  return (
                    <div key={split.memberId} className="flex justify-between items-center py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${split.isDrinker ? 'bg-amber-500' : 'bg-slate-400'}`}></span>
                        <p className="text-xs font-semibold text-slate-700 truncate">
                          {split.memberName} 
                          <span className="text-[10px] text-slate-400 font-normal ml-1.5">
                            ({split.roleName}・{split.isDrinker ? '飲酒' : 'ノンアル'})
                          </span>
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-bold font-mono text-slate-800">
                          ¥{split.roundedAmount.toLocaleString()}
                        </span>
                        <span className="text-[9px] text-slate-400 block font-mono">
                          (計算: ¥{split.baseAmount.toLocaleString()})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-slate-150 border-t border-slate-200 mt-12 py-6 text-center text-slate-400 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 KESHAVARI 傾斜割り勘電卓 - サークルから懇親会まで、便利に傾斜配分</p>
          <div className="flex gap-2">
            <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-500">¥100端数丸め◎</span>
            <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-500">LINE共有対応</span>
          </div>
        </div>
      </footer>

      {/* ADD MEMBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-indigo-600" />
              <span>新しくメンバーを追加</span>
            </h3>

            <form onSubmit={handleAddMember} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">お名前</label>
                <input
                  type="text"
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="block w-full border-2 border-slate-200 focus:border-indigo-500 outline-none rounded-lg py-2 px-3 text-sm text-slate-800 font-medium"
                  placeholder="例: 加藤くん、部長の奥さん"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-600">立場・クラス</label>
                <select
                  value={newMemberRoleId}
                  onChange={(e) => setNewMemberRoleId(e.target.value)}
                  className="block w-full border-2 border-slate-200 focus:border-indigo-500 outline-none rounded-lg py-2 px-3 text-sm text-slate-700 bg-white"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name} (比率: {role.weight})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50/45 p-3 rounded-xl border border-amber-50 flex items-center justify-between">
                <div className="flex gap-2 items-center">
                  <Beer className="h-4.5 w-4.5 text-amber-500" />
                  <div>
                    <label className="block text-xs font-bold text-slate-700">お酒を飲む人？</label>
                    <span className="text-[10px] text-slate-400 leading-none">お酒有り無しでの傾斜計算に影響します</span>
                  </div>
                </div>

                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newMemberIsDrinker}
                    onChange={() => setNewMemberIsDrinker(!newMemberIsDrinker)}
                    className="sr-only"
                  />
                  <div className={`w-11 h-6 rounded-full transition-colors flex items-center p-1 ${
                    newMemberIsDrinker ? 'bg-amber-500' : 'bg-slate-300'
                  }`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
                      newMemberIsDrinker ? 'translate-x-5' : 'translate-x-0'
                    }`}></div>
                  </div>
                </label>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 font-bold text-xs"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg py-2.5 font-bold text-xs shadow-md transition-all"
                >
                  追加する
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 transform transition-all duration-300">
            <div className="flex items-center gap-3 text-red-650 justify-center flex-col text-center mb-4">
              <div className="bg-red-50 p-3 rounded-full text-red-600 mb-1">
                <Trash2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">メンバーを削除しますか？</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                「<span className="font-bold text-slate-800">{memberToDelete.name}</span>」さんを名簿から削除しますか？この操作は戻せません。
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 font-bold text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmDeleteMember}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-bold text-xs shadow-sm transition-colors"
              >
                削除する
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-slate-100 transform transition-all duration-300">
            <div className="flex items-center gap-3 justify-center flex-col text-center mb-4">
              <div className="bg-amber-50 p-3 rounded-full text-amber-550 mb-1">
                <RefreshCw className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-base font-bold text-slate-800">初期状態に戻しますか？</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                全てのメンバーリストと比率設定、合計金額をデフォルトの初期状態に戻します。
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg py-2.5 font-bold text-xs transition-colors"
              >
                キャンセル
              </button>
              <button
                type="button"
                onClick={confirmResetToDefaults}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg py-2.5 font-bold text-xs shadow-sm transition-colors"
              >
                元に戻す
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
