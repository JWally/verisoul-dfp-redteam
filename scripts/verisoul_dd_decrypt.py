#!/usr/bin/env python3
"""
verisoul_dd_decrypt.py — decrypt a captured Verisoul `dd` blob.

Model (recovered from the obfuscated bundle, validated 100% against a
same-run capture):

    dd = base64( u[16] || E )
      u = per-run XOR key, PREPENDED IN CLEARTEXT
      E = ( random16 || JSON(QZ-renamed device_data) ) XOR keystream
      keystream[s] = splitmix32(seed)[s % 32] XOR u[s % 16]
      seed = per-build constant `pg` (rotates per delivery)

Usage:
    python3 verisoul_dd_decrypt.py <dd_base64_or_file> [--seed N]
    --seed defaults to 380368963 (observed build); pass the value from your
    bundle (`...let pg=<N>...`) if decryption fails.
"""
import sys, base64, json, argparse

def splitmix32(seed: int, n: int = 32) -> bytes:
    out = bytearray()
    s = seed & 0xFFFFFFFF
    for _ in range(n):
        s = (s + 2654435769) & 0xFFFFFFFF
        z = s
        z = (z ^ (z >> 16)) * 2246822507 & 0xFFFFFFFF
        z = (z ^ (z >> 13)) * 3266489909 & 0xFFFFFFFF
        z = (z ^ (z >> 16)) & 0xFFFFFFFF
        out.append(z & 0xFF)
    return bytes(out)

def decrypt(dd_b64: str, seed: int = 380368963, mA: int = 32, xD: int = 16, lk: int = 16):
    K = base64.b64decode(dd_b64)
    u = K[:xD]
    E = K[xD:]
    q = splitmix32(seed, mA)
    i = bytes(q[s] ^ u[s % xD] for s in range(mA))
    P = bytes(E[s] ^ i[s % mA] for s in range(len(E)))
    return P[lk:]  # JSON body (QZ-renamed keys)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dd', help='dd blob (base64) or path to a JSON /collect capture')
    ap.add_argument('--seed', type=int, default=380368963)
    a = ap.parse_args()
    try:
        body = open(a.dd).read() if a.dd.endswith('.json') or a.dd.endswith('.txt') else a.dd
    except FileNotFoundError:
        body = a.dd
    try:
        j = json.loads(body)
        dd = j.get('dd', body)
    except Exception:
        dd = body.strip()
    pt = decrypt(dd, seed=a.seed)
    try:
        obj = json.loads(pt.decode('utf-8'))
        print(json.dumps(obj, indent=2)[:6000])
    except Exception as e:
        print('plaintext (not JSON):', pt[:300], '...', e)
    open('dd-plaintext.json', 'wb').write(pt)
    print('\n[saved] dd-plaintext.json')

if __name__ == '__main__':
    main()
