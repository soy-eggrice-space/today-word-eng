import base64, subprocess, re
body = open('/tmp/q/page_body.html', encoding='utf-8').read()
ko = ''.join(sorted(set(re.sub(r'[\x00-\x7f]', '', body))))
open('/tmp/st_chars.txt', 'w', encoding='utf-8').write(ko + ''.join(chr(c) for c in range(32, 127)))
subprocess.run(['pyftsubset', '/home/claude/word-play/app/src/main/assets/fonts/GumiRomance.otf', '--text-file=/tmp/st_chars.txt', '--flavor=woff', '--output-file=/tmp/st.woff'], check=True, capture_output=True)
f = base64.b64encode(open('/tmp/st.woff', 'rb').read()).decode()
open('/home/claude/today-word-eng/web/today-study/pet/index.html', 'w', encoding='utf-8').write(body.replace('%FONT%', f))
print(len(body) // 1024 + len(f) // 1024, 'KB')
