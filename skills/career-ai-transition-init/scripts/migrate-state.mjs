#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const statePath = path.resolve(process.argv[2] || '.skill-state.json');
const here = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(here, '../templates/skill-state.template.json');

if (!fs.existsSync(statePath)) {
  console.error(`State file not found: ${statePath}`);
  process.exit(1);
}

const state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
if ((state.schema_version || 1) >= 2) {
  console.log(JSON.stringify({ ok: true, migrated: false, schema_version: state.schema_version }, null, 2));
  process.exit(0);
}

const template = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

function mergeDefaults(defaults, current) {
  if (Array.isArray(defaults)) return Array.isArray(current) ? current : [];
  if (defaults && typeof defaults === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(defaults)) {
      out[key] = mergeDefaults(value, current?.[key]);
    }
    for (const [key, value] of Object.entries(current || {})) {
      if (!(key in out)) out[key] = value;
    }
    return out;
  }
  return current === undefined ? defaults : current;
}

const migrated = mergeDefaults(template, state);
migrated.schema_version = 2;
migrated.profile.start_tier = state.profile?.start_tier || null;
migrated.candidate_roles = Array.isArray(state.candidate_roles) ? state.candidate_roles : [];
for (const role of migrated.candidate_roles) {
  if (!role.transition_verdict && role.learnability_verdict) {
    const map = {
      '高可学': '高匹配',
      '中等': '可转型',
      '吃力': '高成本',
      '劝退': '当前不建议'
    };
    role.transition_verdict = map[role.learnability_verdict] || '可转型';
  }
  delete role.learnability_score;
  delete role.learnability_verdict;
}

const backupPath = path.resolve(path.dirname(statePath), '.skill-state.v1.backup.json');
fs.copyFileSync(statePath, backupPath, fs.constants.COPYFILE_EXCL);
const tmpPath = `${statePath}.tmp`;
fs.writeFileSync(tmpPath, `${JSON.stringify(migrated, null, 2)}\n`, { mode: 0o600 });
fs.renameSync(tmpPath, statePath);

console.log(JSON.stringify({
  ok: true,
  migrated: true,
  from: state.schema_version || 1,
  to: 2,
  backup: backupPath,
  state: statePath
}, null, 2));
