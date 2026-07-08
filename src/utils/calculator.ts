/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, Member, RoundingRule, DrinkerSetting, SplitResult, ClassSummary } from '../types';

export function calculateSplits(
  totalBill: number,
  roles: Role[],
  members: Member[],
  roundingRule: RoundingRule,
  drinkerSetting: DrinkerSetting
): {
  splits: SplitResult[];
  totalCollected: number;
  surplus: number;
} {
  const attendees = members.filter((m) => m.isAttending);
  if (attendees.length === 0 || totalBill <= 0) {
    return { splits: [], totalCollected: 0, surplus: 0 };
  }

  const roleMap = new Map<string, Role>();
  roles.forEach((r) => roleMap.set(r.id, r));

  const drinkerCount = attendees.filter((a) => a.isDrinker).length;

  const getWeight = (roleId: string) => {
    const role = roleMap.get(roleId);
    return role ? role.weight : 1;
  };

  // Check total weight sum of attendees
  const totalWeightSum = attendees.reduce((sum, a) => sum + getWeight(a.roleId), 0);
  const useEqualWeights = totalWeightSum === 0;

  const rawResults: { member: Member; weight: number; base: number }[] = [];

  if (drinkerSetting.mode === 'flat_surcharge') {
    const surchargeValue = drinkerSetting.value;
    const totalSurcharge = drinkerCount * surchargeValue;

    if (totalSurcharge >= totalBill) {
      // Surcharge covers whole bill or more. Split proportionally among drinkers only.
      attendees.forEach((a) => {
        if (a.isDrinker) {
          rawResults.push({ member: a, weight: 1, base: totalBill / drinkerCount });
        } else {
          rawResults.push({ member: a, weight: 0, base: 0 });
        }
      });
    } else {
      const remainingBill = totalBill - totalSurcharge;
      const weightSum = useEqualWeights
        ? attendees.length
        : attendees.reduce((sum, a) => sum + getWeight(a.roleId), 0);

      attendees.forEach((a) => {
        const w = useEqualWeights ? 1 : getWeight(a.roleId);
        const baseShare = weightSum > 0 ? (remainingBill * w) / weightSum : 0;
        const finalShare = baseShare + (a.isDrinker ? surchargeValue : 0);
        rawResults.push({ member: a, weight: w, base: finalShare });
      });
    }
  } else if (drinkerSetting.mode === 'weight_multiplier') {
    const mult = drinkerSetting.value;

    let effectiveWeightSum = 0;
    attendees.forEach((a) => {
      const w = useEqualWeights ? 1 : getWeight(a.roleId);
      const effW = a.isDrinker ? w * mult : w;
      effectiveWeightSum += effW;
    });

    attendees.forEach((a) => {
      const w = useEqualWeights ? 1 : getWeight(a.roleId);
      const effW = a.isDrinker ? w * mult : w;
      const finalShare = effectiveWeightSum > 0 ? (totalBill * effW) / effectiveWeightSum : 0;
      rawResults.push({ member: a, weight: effW, base: finalShare });
    });
  } else {
    // No drinker difference
    const weightSum = useEqualWeights
      ? attendees.length
      : attendees.reduce((sum, a) => sum + getWeight(a.roleId), 0);

    attendees.forEach((a) => {
      const w = useEqualWeights ? 1 : getWeight(a.roleId);
      const finalShare = weightSum > 0 ? (totalBill * w) / weightSum : 0;
      rawResults.push({ member: a, weight: w, base: finalShare });
    });
  }

  // Rounding application
  const applyRounding = (amount: number, rule: RoundingRule): number => {
    if (amount <= 0) return 0;
    switch (rule) {
      case 'up100':
        return Math.ceil(amount / 100) * 100;
      case 'down100':
        return Math.floor(amount / 100) * 100;
      case 'round100':
        return Math.round(amount / 100) * 100;
      case 'up500':
        return Math.ceil(amount / 500) * 500;
      case 'up1000':
        return Math.ceil(amount / 1000) * 1000;
      case 'none':
      default:
        return Math.round(amount);
    }
  };

  const splits: SplitResult[] = rawResults.map((res) => {
    const role = roleMap.get(res.member.roleId);
    return {
      memberId: res.member.id,
      memberName: res.member.name,
      roleName: role ? role.name : '一般',
      isDrinker: res.member.isDrinker,
      baseAmount: Math.round(res.base),
      roundedAmount: applyRounding(res.base, roundingRule),
    };
  });

  const totalCollected = splits.reduce((sum, s) => sum + s.roundedAmount, 0);
  const surplus = totalCollected - totalBill;

  return {
    splits,
    totalCollected,
    surplus,
  };
}

export function generateClassSummary(
  roles: Role[],
  splits: SplitResult[],
  members: Member[]
): ClassSummary[] {
  return roles.map((role) => {
    const classSplits = splits.filter((s) => {
      const m = members.find((mem) => mem.id === s.memberId);
      return m && m.roleId === role.id;
    });

    const drinkerSplits = classSplits.filter((s) => s.isDrinker);
    const nonDrinkerSplits = classSplits.filter((s) => !s.isDrinker);

    // Get representative amounts
    const drinkerAmount = drinkerSplits.length > 0 ? drinkerSplits[0].roundedAmount : 0;
    const nonDrinkerAmount = nonDrinkerSplits.length > 0 ? nonDrinkerSplits[0].roundedAmount : 0;

    return {
      roleId: role.id,
      roleName: role.name,
      weight: role.weight,
      drinkerAmount,
      nonDrinkerAmount,
      drinkerCount: drinkerSplits.length,
      nonDrinkerCount: nonDrinkerSplits.length,
    };
  });
}

export function generateLineShareText(
  totalBill: number,
  totalCollected: number,
  surplus: number,
  classSummaries: ClassSummary[],
  splits: SplitResult[]
): string {
  const header = `🍻【お会計・傾斜割り勘精算】🍻\n\nお疲れ様でした！本日の精算内容を共有します。\n\n💸 会計総額: ${totalBill.toLocaleString()} 円\n💴 回収総額: ${totalCollected.toLocaleString()} 円`;
  
  let surplusText = '';
  if (surplus > 0) {
    surplusText = `\n🪙 幹事お釣り分（端数）: +${surplus.toLocaleString()} 円\n`;
  } else if (surplus < 0) {
    surplusText = `\n⚠️ 不足分（幹事調整）: -${Math.abs(surplus).toLocaleString()} 円\n`;
  } else {
    surplusText = `\n🪙 ピッタリ精算（お釣りなし）\n`;
  }

  let classSection = `\n─────────────────\n▼ 【比率傾斜と設定】\n`;
  classSummaries.forEach((sum) => {
    if (sum.drinkerCount === 0 && sum.nonDrinkerCount === 0) return;
    classSection += `\n■ ${sum.roleName} (比率: ${sum.weight})\n`;
    if (sum.drinkerCount > 0) {
      classSection += ` ・飲む人: ${sum.drinkerAmount.toLocaleString()} 円 × ${sum.drinkerCount}名\n`;
    }
    if (sum.nonDrinkerCount > 0) {
      classSection += ` ・飲まない人: ${sum.nonDrinkerAmount.toLocaleString()} 円 × ${sum.nonDrinkerCount}名\n`;
    }
  });

  let individualSection = `\n─────────────────\n▼ 【個人別お支払い一覧】\n`;
  splits.forEach((s) => {
    individualSection += `・${s.memberName}さん (${s.roleName}${s.isDrinker ? '・飲酒' : '・ノンアル'}): ${s.roundedAmount.toLocaleString()} 円\n`;
  });

  const footer = `\n支払いは幹事までお願いします。ご協力ありがとうございました！🏼🏼`;

  return header + surplusText + classSection + individualSection + footer;
}
