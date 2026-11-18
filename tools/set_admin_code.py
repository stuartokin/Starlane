"""Set (or change) the STARTER password for the grown-ups' question-bank page, from STARLANE_ADMIN_CODE.
Writes only the check value into js/admin-lock.js — never the password — and never prints it.
   python3 tools/set_admin_code.py            set it
   python3 tools/set_admin_code.py --check    say whether js/admin-lock.js matches STARLANE_ADMIN_CODE (exit 1 if not)
Families who have set their own password on a device are not affected by a change."""
import hashlib, os, re, sys, pathlib
LOCK = pathlib.Path(__file__).resolve().parent.parent / 'js' / 'admin-lock.js'

def keys(code):
    src = LOCK.read_text(encoding='utf-8')
    salt = re.search(r"SALT = '([^']+)'", src).group(1); it = int(re.search(r'ITER = (\d+)', src).group(1))
    k = hashlib.pbkdf2_hmac('sha256', code.strip().encode(), salt.encode(), it).hex()
    return src, k, hashlib.sha256(k.encode()).hexdigest()

if __name__ == '__main__':
    code = os.environ.get('STARLANE_ADMIN_CODE', '')
    if not code.strip(): sys.exit('STARLANE_ADMIN_CODE is not set in this session (add it to the cloud environment, then start a new session).')
    src, k, check = keys(code)
    cur = re.search(r"CHECK = '([^']*)'", src).group(1)
    if '--check' in sys.argv:
        print('js/admin-lock.js matches STARLANE_ADMIN_CODE' if cur == check else 'js/admin-lock.js does NOT match STARLANE_ADMIN_CODE'); sys.exit(0 if cur == check else 1)
    LOCK.write_text(src.replace(f"CHECK = '{cur}'", f"CHECK = '{check}'"), encoding='utf-8')
    print(f'Check value written to js/admin-lock.js ({len(code.strip())}-character password; the password itself is not stored).')
