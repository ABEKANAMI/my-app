/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Role, Member } from '../types';

export const DEFAULT_ROLES: Role[] = [
  { id: 'president', name: '社長クラス', weight: 4 },
  { id: 'manager', name: '部長クラス', weight: 3 },
  { id: 'employee', name: '正社員', weight: 2 },
  { id: 'parttimer', name: 'アルバイト', weight: 1 },
];

export const DEFAULT_MEMBERS: Member[] = [
  { id: 'm1', name: '飯田社長', roleId: 'president', isDrinker: true, isAttending: true },
  { id: 'm2', name: '上野部長', roleId: 'manager', isDrinker: true, isAttending: true },
  { id: 'm3', name: '岡田課長', roleId: 'manager', isDrinker: false, isAttending: true },
  { id: 'm4', name: '木下さん', roleId: 'employee', isDrinker: true, isAttending: true },
  { id: 'm5', name: '斉藤さん', roleId: 'employee', isDrinker: false, isAttending: true },
  { id: 'm6', name: '坂本さん', roleId: 'employee', isDrinker: true, isAttending: false }, // Absent by default to showcase checklist
  { id: 'm7', name: '田中くん', roleId: 'employee', isDrinker: false, isAttending: true },
  { id: 'm8', name: '長谷川くん', roleId: 'parttimer', isDrinker: true, isAttending: true },
  { id: 'm9', name: '矢野さん', roleId: 'parttimer', isDrinker: false, isAttending: true },
  { id: 'm10', name: '吉田くん', roleId: 'parttimer', isDrinker: true, isAttending: true },
];
