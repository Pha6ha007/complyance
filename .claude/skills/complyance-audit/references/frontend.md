# Frontend Reference

## Required pages:
Marketing: landing, pricing, blog, blog/[slug], free-classifier
Auth: login, register, forgot-password
Dashboard: dashboard, systems, systems/new, systems/[id], vendors, evidence, intelligence, settings, referrals
Admin: admin
Error: not-found.tsx, error.tsx, dashboard error.tsx
Loading: skeletons for dashboard, systems, vendors, evidence, intelligence

## i18n: 7 locales × 995 keys. Validate:
```bash
node -e "const en=require('./src/i18n/messages/en.json');const g=(o,p='')=>Object.entries(o).flatMap(([k,v])=>typeof v==='object'&&v?g(v,p+k+'.'):p+k);const ek=new Set(g(en));console.log('EN:',ek.size);['fr','de','pt','ar','pl','it'].forEach(l=>{try{const lk=new Set(g(require('./src/i18n/messages/'+l+'.json')));console.log(l.toUpperCase()+':',lk.size,'missing:',[...ek].filter(k=>!lk.has(k)).length)}catch(e){console.log(l+': PARSE ERROR')}})"
```

## RTL: dir={locale==='ar'?'rtl':'ltr'} in layout
## Tailwind logical properties ONLY: ms-/me-/ps-/pe-/text-start/text-end (NOT ml-/mr-/pl-/pr-/text-left/text-right)
## Check: grep -rn "ml-\|mr-\|pl-\|pr-\|text-left\|text-right" --include="*.tsx" src/ | grep -v node_modules
