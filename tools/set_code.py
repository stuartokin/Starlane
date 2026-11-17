"""Set (or change) the code for Starlane's test mode and cheat page, from the STARLANE_CODE environment variable.
Writes only the check value into js/lock.js — never the code — and never prints the code.
   python3 tools/set_code.py            set it
   python3 tools/set_code.py --check    say whether js/lock.js matches STARLANE_CODE (exit 1 if not)"""
import hashlib, os, re, sys, pathlib
LOCK = pathlib.Path(__file__).resolve().parent.parent / 'js' / 'lock.js'

def keys(code):
    src = LOCK.read_text(encoding='utf-8')
    salt = re.search(r"SALT = '([^']+)'", src).group(1); it = int(re.search(r'ITER = (\d+)', src).group(1))
    k = hashlib.pbkdf2_hmac('sha256', code.strip().encode(), salt.encode(), it).hex()
    return src, k, hashlib.sha256(k.encode()).hexdigest()

if __name__ == '__main__':
    code = os.environ.get('STARLANE_CODE', '')
    if not code.strip(): sys.exit('STARLANE_CODE is not set in this session (add it to the cloud environment, then start a new session).')
    src, k, check = keys(code)
    cur = re.search(r"CHECK = '([^']*)'", src).group(1)
    if '--check' in sys.argv:
        print('js/lock.js matches STARLANE_CODE' if cur == check else 'js/lock.js does NOT match STARLANE_CODE'); sys.exit(0 if cur == check else 1)
    LOCK.write_text(src.replace(f"CHECK = '{cur}'", f"CHECK = '{check}'"), encoding='utf-8')
    print(f'Check value written to js/lock.js ({len(code.strip())}-character code; the code itself is not stored).')
