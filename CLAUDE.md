# Portfolio - Claude Code Talimatları

## Otomatik Commit & Push Kuralı

Her görev tamamlandığında **onay beklemeden**:

1. Yapılan değişiklikleri `git add` ile sahnele
2. Anlamlı bir commit mesajıyla commit oluştur
3. `origin/main`'e push at

Çalışma branch'i ne olursa olsun nihai hedef `main` branch'idir. Worktree veya feature branch'ten doğrudan main'e push etmek için:

```
git push origin HEAD:main
```

### İstisnalar (yine de sor)
- Destructive git işlemleri (`reset --hard`, `push --force`, branch silme)
- `.env`, credentials veya secret içeren dosyalar
- LICENSE veya repo metadata değişiklikleri
