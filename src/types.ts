/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Role {
  id: string;
  name: string;
  weight: number;
}

export interface Member {
  id: string;
  name: string;
  roleId: string; // References Role.id
  isDrinker: boolean; // お酒飲むかどうか
  isAttending: boolean; // 今回参加するかどうか
}

export type RoundingRule = 
  | 'up100'    // 100円未満切り上げ (日本で一番一般的、幹事の端数お釣りが出る)
  | 'down100'  // 100円未満切り捨て (不足分を幹事が払う、または後から調整)
  | 'round100' // 100円未満四捨五入
  | 'up500'    // 500円単位切り上げ
  | 'up1000'   // 1000円単位切り上げ
  | 'none';    // 端数処理なし（1円単位）

export interface DrinkerSetting {
  mode: 'flat_surcharge' | 'weight_multiplier' | 'none';
  value: number; // Flat value (e.g., 500 yen surcharge) or multiplier value (e.g., 1.5)
}

export interface SplitResult {
  memberId: string;
  memberName: string;
  roleName: string;
  isDrinker: boolean;
  baseAmount: number; // Raw exact calculated amount
  roundedAmount: number; // Amount after rounding rule applied
}

export interface ClassSummary {
  roleId: string;
  roleName: string;
  weight: number;
  drinkerAmount: number;
  nonDrinkerAmount: number;
  drinkerCount: number;
  nonDrinkerCount: number;
}
