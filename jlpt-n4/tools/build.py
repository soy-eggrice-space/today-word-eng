#!/usr/bin/env python3
"""data/*.txt -> app/src/main/assets/data.js  (with validation)"""
import sys, os, glob, json, re
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from common import *

errs, warns = [], []


def load_vocab():
    words, cats, seen = [], [], {}
    for path in sorted(glob.glob(os.path.join(DATA, 'vocab_*.txt'))):
        fn = os.path.basename(path)
        cat = None
        sub = ''
        for ln, line in read_lines(path):
            where = f'{fn}:{ln}'
            if line.startswith('## '):
                sub = line[3:].strip()
                continue
            if line.startswith('# '):
                cid, cname, icon = line[2:].split('|')
                cat = cid
                cats.append({'id': cid, 'name': cname, 'icon': icon})
                continue
            f = line.split('|')
            if len(f) != 7:
                errs.append(f'{where}: field count {len(f)}: {line}')
                continue
            w, r, m, lv, pos, ex, tr = f
            if lv not in ('4', '5'):
                errs.append(f'{where}: bad level {lv}')
            if pos not in POS:
                errs.append(f'{where}: bad pos {pos}')
            check_sentence(ex, where, errs)
            key = w + '|' + r
            if key in seen:
                warns.append(f'{where}: duplicate {key} (first {seen[key]}) - skipped')
                continue
            seen[key] = where
            # target sanity
            mt = re.search('［(.*?)］', ex)
            if mt:
                tgt = mt.group(1)
                ts, tr_ = strip_ruby(tgt), kata2hira(to_reading(tgt))
                base = w.replace('〜', '')
                rbase = kata2hira(r)
                # stem: drop final kana for inflecting words
                if pos in ('v5', 'v1', 'vk', 'adj-i'):
                    stem = base[:-1] if pos != 'v1' else base[:-2] if len(base) > 2 and not KANJI_RE.match(base[-2]) else base[:-1]
                    rstem = rbase[:-1] if pos != 'v1' else rbase[:-2] if len(rbase) > 2 and not KANJI_RE.match(base[-2]) else rbase[:-1]
                    if pos == 'vk':
                        stem, rstem = base[:-1], ''
                    if not ts.startswith(stem[:1]):
                        warns.append(f'{where}: target {ts} vs word {w}')
                    if rstem and not tr_.startswith(rstem[:max(1, len(rstem) - 1)]):
                        warns.append(f'{where}: target reading {tr_} vs {r}')
                elif pos in ('vs', 'vsi'):
                    if not ts.startswith(base[:1]):
                        warns.append(f'{where}: target {ts} vs word {w}')
                elif pos != 'ctr':
                    if base not in ts and kata2hira(base) not in kata2hira(ts):
                        warns.append(f'{where}: target {ts} does not contain {base}')
                    if rbase not in tr_:
                        warns.append(f'{where}: target reading {tr_} does not contain {rbase}')
            words.append({'w': w, 'r': r, 'm': m, 'lv': int(lv), 'p': pos, 'ex': ex, 'tr': tr,
                          'c': cat, 's': sub})
    return words, cats


def load_grammar():
    pts = []
    for path in sorted(glob.glob(os.path.join(DATA, 'grammar_*.txt'))):
        fn = os.path.basename(path)
        cur = None
        for ln, line in read_lines(path):
            where = f'{fn}:{ln}'
            if line.startswith('# '):
                continue
            if line.startswith('@ '):
                f = line[2:].split('|')
                if len(f) != 5:
                    errs.append(f'{where}: grammar header fields {len(f)}')
                    continue
                cur = {'id': f[0], 'p': f[1], 'm': f[2], 'lv': int(f[3]), 'tag': f[4],
                       'con': [], 'ex_': [], 'note': [], 'warn': [], 'q': [], 's': []}
                if any(x['id'] == f[0] for x in pts):
                    errs.append(f'{where}: dup grammar id {f[0]}')
                pts.append(cur)
                continue
            if cur is None:
                errs.append(f'{where}: line before header')
                continue
            if line.startswith('+ '):
                cur['con'].append(line[2:])
            elif line.startswith('= '):
                cur['note'].append(line[2:])
            elif line.startswith('! '):
                cur['warn'].append(line[2:])
            elif line.startswith('ex '):
                a = line[3:].split('|')
                if len(a) != 2:
                    errs.append(f'{where}: ex fields')
                    continue
                check_sentence(a[0], where, errs, need_target=False)
                cur['ex_'].append(a)
            elif line.startswith('q '):
                a = line[2:].split('|')
                if len(a) < 5:
                    errs.append(f'{where}: q fields {len(a)}')
                    continue
                if '（　）' not in a[0]:
                    errs.append(f'{where}: q has no blank')
                if len(set(a[1:5])) != 4:
                    errs.append(f'{where}: duplicate options')
                for t in a[:5]:
                    check_sentence(t, where, errs, need_target=False)
                cur['q'].append({'t': a[0], 'o': a[1:5], 'x': a[5] if len(a) > 5 else ''})
            elif line.startswith('s '):
                a = line[2:].split('|')
                if len(a) != 5:
                    errs.append(f'{where}: s fields {len(a)}')
                    continue
                ch = a[1].split('/')
                if len(ch) != 4:
                    errs.append(f'{where}: s chunks {len(ch)}')
                    continue
                if len(set(ch)) != 4:
                    errs.append(f'{where}: s duplicate chunks')
                if a[3] not in '1234':
                    errs.append(f'{where}: s star')
                for t in [a[0], a[2]] + ch:
                    check_sentence(t, where, errs, need_target=False)
                cur['s'].append({'a': a[0], 'c': ch, 'b': a[2], 'k': int(a[3]), 'tr': a[4]})
            else:
                errs.append(f'{where}: unknown line {line[:30]}')
    return pts


def load_simple(fn, tag, nf):
    out = []
    for ln, line in read_lines(os.path.join(DATA, fn)):
        where = f'{fn}:{ln}'
        if line.startswith('#'):
            continue
        if not line.startswith(tag + ' '):
            errs.append(f'{where}: unknown line')
            continue
        a = line[len(tag) + 1:].split('|')
        if len(a) != nf:
            errs.append(f'{where}: fields {len(a)} != {nf}')
            continue
        for t in (a[2:] if tag == 'u' else a):
            check_sentence(t, where, errs, need_target=False)
        out.append(a)
    return out


def load_blocks(pattern):
    """generic @-block parser for bunshou / reading / listening"""
    blocks = []
    for path in sorted(glob.glob(os.path.join(DATA, pattern))):
        fn = os.path.basename(path)
        cur = None
        for ln, line in read_lines(path):
            where = f'{fn}:{ln}'
            if line.startswith('#'):
                continue
            if line.startswith('@ '):
                f = line[2:].split('|')
                cur = {'id': f[0], 'type': f[1] if len(f) > 2 else '', 'title': f[-1],
                       't': [], 'q': [], 'lines': [], 'o': None, 'a': None, 'sc': '', 'qq': '', 'tr': '', '_w': where}
                blocks.append(cur)
                continue
            if cur is None:
                errs.append(f'{where}: line before @')
                continue
            if line.startswith('t '):
                check_sentence(line[2:], where, errs, need_target=False)
                cur['t'].append(line[2:])
            elif line.startswith('sc '):
                check_sentence(line[3:], where, errs, need_target=False)
                cur['sc'] = line[3:]
            elif re.match(r'^[MFN]: ', line):
                check_sentence(line[3:], where, errs, need_target=False)
                cur['lines'].append([line[0], line[3:]])
            elif line.startswith('q '):
                a = line[2:].split('|')
                for t in a[:5]:
                    check_sentence(t, where, errs, need_target=False)
                if len(a) == 1:
                    cur['qq'] = a[0]
                else:
                    if len(a) < 5:
                        errs.append(f'{where}: q fields {len(a)}')
                    if len(set(a[1:5])) != 4:
                        errs.append(f'{where}: duplicate options')
                    cur['q'].append(a)
            elif line.startswith('o '):
                a = line[2:].split('|')
                if len(a) != 4 or len(set(a)) != 4:
                    errs.append(f'{where}: o options')
                for t in a:
                    check_sentence(t, where, errs, need_target=False)
                cur['o'] = a
            elif line.startswith('a '):
                a = line[2:].split('|')
                if len(a) != 3 or len(set(a)) != 3:
                    errs.append(f'{where}: a options')
                for t in a:
                    check_sentence(t, where, errs, need_target=False)
                cur['a'] = a
            elif line.startswith('tr '):
                cur['tr'] = line[3:]
            elif line.startswith('lv '):
                cur['lv'] = int(line[3:].strip())
            else:
                errs.append(f'{where}: unknown line {line[:20]}')
    return blocks


def load_kanji():
    out, seen = [], set()
    for ln, line in read_lines(os.path.join(DATA, 'kanji.txt')):
        where = f'kanji.txt:{ln}'
        if line.startswith('## '):
            grp = line[3:]
            continue
        if line.startswith('#'):
            continue
        f = line.split('|')
        if len(f) != 6:
            errs.append(f'{where}: fields')
            continue
        if f[0] in seen:
            warns.append(f'{where}: dup kanji {f[0]}')
            continue
        seen.add(f[0])
        check_sentence(f[5], where, errs, need_target=False)
        out.append(f[:4] + [int(f[4]), f[5], grp])
    return out


if __name__ == '__main__':
    words, cats = load_vocab()
    n5 = sum(1 for w in words if w['lv'] == 5)
    print(f'vocab: {len(words)} (N5 {n5}, N4 {len(words) - n5}), cats {len(cats)}')
    gp = load_grammar()
    print(f'grammar: {len(gp)} points, {sum(len(g["q"]) for g in gp)} MCQ, {sum(len(g["s"]) for g in gp)} star')
    para = load_simple('paraphrase.txt', 'p', 6)
    usage = load_simple('usage.txt', 'u', 7)
    bun = load_blocks('bunshou*.txt')
    rd = load_blocks('reading_*.txt')
    ls = load_blocks('listening_*.txt')
    kj = load_kanji()
    conf = [l.replace(' ', '') for _, l in read_lines(os.path.join(DATA, 'confusable.txt')) if not l.startswith('#')]
    print(f'para {len(para)}, usage {len(usage)}, bunshou {len(bun)} ({sum(len(b["q"]) for b in bun)} q), reading {len(rd)} ({sum(len(b["q"]) for b in rd)} q), listening {len(ls)}, kanji {len(kj)}')
    from collections import Counter
    print('reading types', Counter(b['type'] for b in rd), 'listen types', Counter(b['type'] for b in ls))
    for b in ls:
        if b['type'] in ('kadai', 'point') and (not b['o'] or not b['qq'] or not b['lines']):
            errs.append(f"{b['_w']}: listening block incomplete")
        if b['type'] == 'hatsuwa' and (not b['a'] or not b['sc'] or not b['qq']):
            errs.append(f"{b['_w']}: hatsuwa incomplete")
        if b['type'] == 'sokuji' and (not b['a'] or len(b['lines']) != 1):
            errs.append(f"{b['_w']}: sokuji incomplete")
    seen_id = {}
    for b in bun + rd + ls:
        if b['id'] in seen_id:
            errs.append(f"{b['_w']}: duplicate id {b['id']} (first {seen_id[b['id']]})")
        seen_id[b['id']] = b['_w']
    for b in bun:
        nums = re.findall('（([１２３４５])）', ''.join(b['t']))
        if len(nums) != len(b['q']):
            errs.append(f"{b['_w']}: blanks {len(nums)} vs q {len(b['q'])}")
    # ---- 난이도: N5 한자 밖의 한자 수 + 길이 + N4 문법 표지 → 낮을수록 쉬움 (N5 단계·N5 모의고사에 먼저)
    N5K = set(k[0] for k in kj if k[4] == 5)
    MARK = ['そうです', 'そうだ', 'ようです', 'ようだ', 'みたい', 'らしい', 'かもしれ', 'はず', 'ために', 'ように', 'なら', 'たら',
            'ても', 'のに', 'てしまっ', 'ちゃっ', 'ておい', 'てみ', 'ところ', 'られ', 'させ', 'いただ', 'くださ', 'いらっしゃ',
            'おっしゃ', '召し上が', 'ことにし', 'ことになっ', 'やすい', 'にくい', 'すぎ', 'ばかり', 'そうに']
    def diff(texts):
        txt = ''.join(t for t in texts if t)
        surf = strip_ruby(txt)
        ks = set(KANJI_RE.findall(surf))
        hard = sum(1 for k in ks if k not in N5K)
        L = len(surf)
        gm = sum(surf.count(m) for m in MARK)
        return round(hard + L / 60 + gm * 0.8, 2)
    def blk_texts(b):
        out = list(b['t']) + [b['sc'], b['qq']] + [l[1] for l in b['lines']]
        for q in b['q']: out += q[:5]
        out += (b['o'] or []) + (b['a'] or [])
        return out
    def mark_easy(items, getd, key):
        groups = {}
        for it in items: groups.setdefault(key(it), []).append(getd(it))
        cut = {k: sorted(v)[max(0, int(len(v) * 0.45) - 1)] for k, v in groups.items()}
        return cut
    for b in bun + rd + ls:
        b['d'] = diff(blk_texts(b))
    cut = mark_easy([b for b in bun + rd + ls if b.get('lv') != 5], lambda b: b['d'], lambda b: b['type'] or 'bunshou')
    for b in bun + rd + ls:
        if b.get('lv') == 5:
            b['e'] = 1; b['d'] = round(b['d'] / 10, 2)  # N5 전용은 가장 먼저
        else:
            b['e'] = 1 if b['d'] <= cut[b['type'] or 'bunshou'] else 0
    para_d = [diff(a) for a in para]
    usage_d = [diff(a[2:]) for a in usage]
    pc = sorted(para_d)[int(len(para_d) * 0.45)]
    print('easy blocks', Counter((b['type'] or 'bunshou') for b in bun + rd + ls if b['e']), 'para easy', sum(1 for d in para_d if d <= pc))
    # ---- write data.js
    def clean(b, keys):
        return {k: b[k] for k in keys if b.get(k)}
    D = {
        'cats': cats,
        'vocab': [[w['w'], w['r'], w['m'], w['lv'], w['p'], w['ex'], w['tr'], w['c'], w['s']] for w in words],
        'kanji': kj,
        'conf': conf,
        'grammar': [{'id': g['id'], 'p': g['p'], 'm': g['m'], 'lv': g['lv'], 'tag': g['tag'], 'con': g['con'],
                     'note': g['note'], 'warn': g['warn'], 'ex': g['ex_'],
                     'q': [[q['t']] + q['o'] + [q['x']] for q in g['q']],
                     's': [[x['a'], x['c'], x['b'], x['k'], x['tr']] for x in g['s']]} for g in gp],
        'para': para, 'paraD': para_d,
        'usage': usage, 'usageD': usage_d,
        'bunshou': [clean(b, ['id', 'title', 't', 'q', 'tr', 'd', 'e', 'lv']) for b in bun],
        'reading': [clean(b, ['id', 'type', 'title', 't', 'q', 'tr', 'd', 'e', 'lv']) for b in rd],
        'listen': [clean(b, ['id', 'type', 'title', 'sc', 'lines', 'qq', 'o', 'a', 'tr', 'd', 'e', 'lv']) for b in ls],
    }
    out = os.path.join(ROOT, 'app', 'src', 'main', 'assets', 'data.js')
    with open(out, 'w', encoding='utf-8') as f:
        f.write('window.DATA=' + json.dumps(D, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print('wrote', out, os.path.getsize(out) // 1024, 'KB')
    for w in warns:
        print('WARN', w)
    for e in errs:
        print('ERR ', e)
    print(f'{len(errs)} errors, {len(warns)} warnings')
    sys.exit(1 if errs else 0)
