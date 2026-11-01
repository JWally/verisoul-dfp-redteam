#!/usr/bin/env python3
"""demo-verisoul.py — print the FULL Verisoul decrypted payload (195 fields).
Replays the captured device-data capture: dd = base64(u[16] || plaintext)."""
import json, sys

def main():
    src = sys.argv[1] if len(sys.argv) > 1 else '/home/justin/Dev/dfp-redteam-verisoul-2026-10-25/artifacts/verisoul-device-data.json'
    d = json.load(open(src))
    print('=' * 74)
    print('VERISOUL — FULL DEVICE-DATA PAYLOAD (decrypted)')
    print('cipher: dd = b64(u[16] || E); E = (rand16 || JSON) XOR splitmix32(seed)')
    print('key u: PREPENDED IN CLEARTEXT — recovered + validated 100%')
    print('=' * 74)
    for k, v in d.items():
        s = json.dumps(v, default=str)
        print(f'{k}: {s[:200]}{" ..." if len(s) > 200 else ""}')
    print('=' * 74)
    print(f'FIELDS SHIPPED: {len(d)}')

if __name__ == '__main__':
    main()
