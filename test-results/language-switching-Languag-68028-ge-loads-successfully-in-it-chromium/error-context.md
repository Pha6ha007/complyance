# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e5]:
    - img [ref=e7]
    - generic [ref=e9]:
      - heading "errors.global.title" [level=1] [ref=e10]
      - paragraph [ref=e11]: errors.global.description
    - paragraph [ref=e13]: Cannot destructure property 'client' of 'useContext(...)' as it is null.
    - generic [ref=e14]:
      - button "errors.global.tryAgain" [ref=e15] [cursor=pointer]:
        - img [ref=e16]
        - text: errors.global.tryAgain
      - link "errors.global.goToDashboard" [ref=e21] [cursor=pointer]:
        - /url: /dashboard
        - img [ref=e22]
        - text: errors.global.goToDashboard
    - paragraph [ref=e25]:
      - text: errors.global.helpText
      - link "errors.global.contactSupport" [ref=e26] [cursor=pointer]:
        - /url: /contact
  - region "Notifications alt+T"
  - alert [ref=e27]
```