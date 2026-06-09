# Project Security Checklist

Har naye project mein join karne ya clone karne ke baad yeh checks zaroor karo.

---

## 1. `vite.config.ts` / `webpack.config.js` Check

```bash
grep -n "eval\|atob\|fetch\|node-fetch\|exec\|spawn" vite.config.ts
```

**Khatarnak signs:**
- `eval(...)` — kisi bhi form mein
- `atob(...)` — base64 decode
- `fetch(...)` ya `node-fetch` config file mein
- Koi bhi `(async () => { ... })()` block jo API call kare

---

## 2. `.vscode/tasks.json` Check

```bash
cat .vscode/tasks.json
```

**Khatarnak signs:**
- `"runOn": "folderOpen"` — automatically chalne wala task
- `"hide": true` — hidden task
- `node ./public/...` ya kisi bhi non-JS file ko `node` se run karna
- `"reveal": "never"` ke saath koi shell command

---

## 3. `package.json` Scripts Check

```bash
cat package.json | grep -A2 '"scripts"'
```

**Khatarnak signs:**
- `postinstall`, `preinstall` mein koi URL fetch ya curl command
- `node-fetch`, `axios` config files mein use hona
- Unfamiliar packages jo project mein kaam nahi aate

---

## 4. Suspicious Files in `public/` Folder

```bash
find public/ -type f ! -name "*.png" ! -name "*.jpg" ! -name "*.svg" ! -name "*.ico" ! -name "*.webp"
```

**Khatarnak signs:**
- `.woff2`, `.ttf`, `.eot` files jo JavaScript content hold kar rahi hon
- Koi bhi executable ya `.sh` file
- `README.md` jo project se match nahi kare

---

## 5. Git History Check — Suspicious Commits

```bash
git log --oneline | head -20
```

Phir kisi bhi suspicious commit ko check karo:
```bash
git show <commit-hash> --stat
```

**Khatarnak signs:**
- Commit message aur actual changes match nahi karte
- Ek hi commit mein bohot zyada unrelated files change hon
- `eval`, `atob`, base64 string kisi config file mein add ho

---

## 6. Base64 Encoded Strings Check

```bash
grep -rn "eval(atob\|eval(Buffer\|Function(atob" --include="*.ts" --include="*.js" --include="*.mjs" . --exclude-dir=node_modules
```

**Yeh milne par seedha delete karo — koi legitimate code yeh pattern use nahi karta.**

---

## 7. `.env` File Check

```bash
cat .env
```

- `AUTH_API_KEY` jaise unknown variables check karo
- Koi bhi key jo tumne khud set nahi ki

---

## 8. Quick Full Scan (Ek Command)

```bash
grep -rn "eval(atob\|node-fetch\|runOn.*folderOpen\|AUTH_API_KEY" \
  --include="*.ts" --include="*.js" --include="*.json" \
  . --exclude-dir=node_modules --exclude-dir=dist
```

Agar kuch bhi milta hai — **commit history check karo aur team ko alert karo.**

---

## Agar Virus Mil Jaye — Kya Karna Hai

1. `npm run dev` mat chalao
2. Malicious code delete karo (`eval`, `atob`, hidden tasks)
3. **GitHub password change karo**
4. **GitHub 2FA enable karo**
5. GitHub Settings → Sessions → Unknown devices logout karo
6. Saari API keys / tokens rotate karo jo is machine pe use ki hain
7. Team ko alert karo

---

## Real Example — Yeh Project

Is project mein yeh 3 jagah malicious code tha:

| File | Malicious Code |
|------|---------------|
| `vite.config.ts` | `eval(atob(process.env.AUTH_API_KEY))` — remote URL se code execute |
| `vite.config.ts` | `eval(atob('Z2xvYmFs...'))` — hardcoded hidden payload |
| `.vscode/tasks.json` | `node ./public/fonts/fa-solid-400.woff2` — font file ko JS ki tarah run |
