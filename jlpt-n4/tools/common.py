import re, os, glob, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = os.path.join(ROOT, 'data')

KANJI = r'[㐀-䶿一-鿿豈-﫿々〇ヶ]'
KANJI_RE = re.compile(KANJI)
RUBY_RE = re.compile('(' + KANJI + '+)\\(([ぁ-ゟ゠-ヿー]+)\\)')

POS = {'n', 'vs', 'v5', 'v1', 'vk', 'vsi', 'adj-i', 'adj-na', 'adv', 'conj', 'pron', 'ctr', 'exp', 'int'}


def strip_ruby(s):
    """surface text: 漢字(よみ) -> 漢字"""
    return RUBY_RE.sub(lambda m: m.group(1), s)


def to_reading(s):
    """reading text: 漢字(よみ) -> よみ"""
    return RUBY_RE.sub(lambda m: m.group(2), s)


def bare_kanji(s):
    """kanji characters that are not followed by a (reading)"""
    t = RUBY_RE.sub('', s)
    return KANJI_RE.findall(t)


def kata2hira(s):
    return ''.join(chr(ord(c) - 0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)


def read_lines(path):
    out = []
    with open(path, encoding='utf-8') as f:
        for i, line in enumerate(f, 1):
            line = line.rstrip('\n')
            if not line.strip():
                continue
            out.append((i, line))
    return out


def check_sentence(s, where, errs, need_target=True):
    if need_target:
        if s.count('［') != 1 or s.count('］') != 1:
            errs.append(f'{where}: target bracket count != 1: {s}')
    bk = bare_kanji(s.replace('［', '').replace('］', '') if False else s)
    if bk:
        errs.append(f'{where}: kanji without furigana {"".join(bk)}: {s}')
    # unbalanced parens
    if s.count('(') != s.count(')'):
        errs.append(f'{where}: paren mismatch: {s}')
