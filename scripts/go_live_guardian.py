#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import shutil
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

REPO = Path('/opt/vlad/projects/DELIKREOL')
REPORT_DIR = REPO / 'reports'
RUNTIME_DIR = REPO / 'runtime'
REPORT_DIR.mkdir(parents=True, exist_ok=True)
RUNTIME_DIR.mkdir(parents=True, exist_ok=True)

PUBLIC_PATHS = [
    '/', '/catalogue', '/traiteurs', '/panier', '/admin',
    '/traiteur/les-delices-de-ninice', '/traiteur/saveurs-d-afrique',
    '/catalogue-partenaire', '/devenir-livreur', '/cgu', '/cgv',
]
ESSENTIAL_CONTAINERS = ['delikreol-web', 'delikreol-whatsapp', 'delikreol-n8n']
def run(*args: str, cwd: Path | None = None) -> tuple[int, str]:
    try:
        result = subprocess.run(args, cwd=cwd, text=True, capture_output=True, timeout=60)
        return result.returncode, (result.stdout + result.stderr).strip()
    except Exception as exc:
        return 99, f'{type(exc).__name__}: {exc}'


def http_status(url: str, timeout: int = 10) -> tuple[int, str]:
    try:
        req = Request(url, headers={'User-Agent': 'DELIKREOL-GoLive-Guardian/1.0', 'Cache-Control': 'no-cache'})
        with urlopen(req, timeout=timeout) as response:
            return int(response.status), response.headers.get('content-type', '')
    except HTTPError as exc:
        return int(exc.code), str(exc.reason)
    except (URLError, TimeoutError, OSError) as exc:
        return 0, str(exc)


def env_presence(path: Path, names: list[str]) -> dict[str, bool]:
    found: dict[str, bool] = {name: False for name in names}
    if not path.exists():
        return found
    for raw in path.read_text(errors='ignore').splitlines():
        if '=' not in raw or raw.lstrip().startswith('#'):
            continue
        key, value = raw.split('=', 1)
        if key in found:
            found[key] = bool(value.strip())
    return found
def docker_state(names: list[str]) -> dict[str, str]:
    code, output = run('docker', 'ps', '-a', '--format', '{{.Names}}|{{.Status}}')
    states = {name: 'missing' for name in names}
    if code != 0:
        return states
    for line in output.splitlines():
        if '|' not in line:
            continue
        name, status = line.split('|', 1)
        if name in states:
            states[name] = status
    return states


def git_state() -> dict[str, str | bool]:
    _, head = run('git', 'rev-parse', '--short=12', 'HEAD', cwd=REPO)
    _, status = run('git', 'status', '--porcelain', cwd=REPO)
    state_file = RUNTIME_DIR / 'last_audited_head'
    audited = state_file.read_text().strip() if state_file.exists() else ''
    return {
        'head': head.strip(),
        'dirty': bool(status.strip()),
        'audited_head': audited,
        'head_is_audited': bool(audited and head.strip().startswith(audited)),
    }


def disk_state() -> dict[str, float]:
    usage = shutil.disk_usage('/')
    free_pct = usage.free / usage.total * 100 if usage.total else 0
    return {'free_gb': round(usage.free / (1024 ** 3), 2), 'free_pct': round(free_pct, 1)}
def collect() -> dict:
    now = datetime.now(timezone.utc).isoformat()
    routes = {path: http_status('https://delikreol.com' + path)[0] for path in PUBLIC_PATHS}
    whatsapp_health = http_status('http://127.0.0.1:3000/health')[0]
    n8n_health = http_status('http://127.0.0.1:5678/healthz')[0]
    whatsapp_env = env_presence(
        Path('/opt/delikreol-whatsapp/.env'),
        ['WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_APP_SECRET', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID'],
    )
    return {
        'generated_at': now,
        'git': git_state(),
        'disk': disk_state(),
        'containers': docker_state(ESSENTIAL_CONTAINERS),
        'routes': routes,
        'whatsapp_health': whatsapp_health,
        'n8n_health': n8n_health,
        'whatsapp_credentials_configured': whatsapp_env,
    }


def evaluate(data: dict) -> tuple[int, str, list[str]]:
    score = 100
    blockers: list[str] = []
    if any(code != 200 for code in data['routes'].values()):
        score -= 25
        blockers.append('Une ou plusieurs routes publiques critiques ne répondent pas en HTTP 200.')
    if not all(str(v).startswith('Up') for v in data['containers'].values()):
        score -= 20
        blockers.append('Un conteneur essentiel n’est pas actif.')
    if data['disk']['free_pct'] < 10:
        score -= 15
        blockers.append('Moins de 10% d’espace disque libre sur le VPS.')
    if not data['git']['head_is_audited'] or data['git']['dirty']:
        score -= 20
        blockers.append('Le HEAD courant n’est pas marqué comme audité ou le dépôt contient des modifications non validées.')
    wa_creds = data['whatsapp_credentials_configured']
    if not (wa_creds.get('WHATSAPP_APP_SECRET') and wa_creds.get('WHATSAPP_ACCESS_TOKEN') and wa_creds.get('WHATSAPP_PHONE_NUMBER_ID')):
        score -= 10
        blockers.append('WhatsApp automatisé bloqué : APP_SECRET, ACCESS_TOKEN ou PHONE_NUMBER_ID manque.')
    if data['whatsapp_health'] != 200:
        score -= 5
        blockers.append('Le bridge WhatsApp local ne répond pas en HTTP 200.')
    if data['n8n_health'] != 200:
        score -= 5
        blockers.append('n8n local ne répond pas en HTTP 200.')
    score = max(0, score)
    state = 'GO' if score == 100 and not blockers else ('PILOT-ONLY' if score >= 80 else 'NO-GO')
    return score, state, blockers


def write_reports(data: dict, score: int, state: str, blockers: list[str]) -> None:
    payload = {**data, 'score': score, 'state': state, 'blockers': blockers}
    (REPORT_DIR / 'go-live-latest.json').write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')
    lines = [
        '# DELIKREOL — Go-live guardian', '',
        f"- État : **{state}**", f"- Score : **{score}/100**", f"- Généré : {data['generated_at']}",
        f"- Git : `{data['git']['head']}` · dirty={data['git']['dirty']} · audited={data['git']['head_is_audited']}",
        f"- Disque libre : {data['disk']['free_gb']} Go ({data['disk']['free_pct']}%)", '',
        '## Blockers',
    ]
    lines += [f'- {item}' for item in blockers] or ['- Aucun blocker technique détecté par le guardian.']
    lines += ['', '## Routes critiques']
    lines += [f"- `{path}` : {code}" for path, code in data['routes'].items()]
    lines += ['', '## Services']
    lines += [f"- {name}: {status}" for name, status in data['containers'].items()]
    lines += [
        f"- WhatsApp health: {data['whatsapp_health']}",
        f"- n8n health: {data['n8n_health']}",
        '', '## Secrets WhatsApp (présence uniquement)',
    ]
    lines += [f"- {key}: {'configuré' if value else 'manquant'}" for key, value in data['whatsapp_credentials_configured'].items()]
    (REPORT_DIR / 'go-live-latest.md').write_text('\n'.join(lines) + '\n')


def main() -> int:
    data = collect()
    score, state, blockers = evaluate(data)
    write_reports(data, score, state, blockers)
    print(json.dumps({'state': state, 'score': score, 'blockers': blockers}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
