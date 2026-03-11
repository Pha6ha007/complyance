# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - combobox "Select language" [ref=e4] [cursor=pointer]:
      - option "English"
      - option "Français" [selected]
      - option "Deutsch"
      - option "Português"
      - option "العربية"
      - option "Polski"
      - option "Italiano"
    - main [ref=e5]:
      - heading "Complyance" [level=1] [ref=e6]
      - paragraph [ref=e7]: Gestion de la conformité IA pour les PME
      - link "Essai gratuit" [ref=e8] [cursor=pointer]:
        - /url: /fr/login
  - region "Notifications alt+T"
  - alert [ref=e9]
```