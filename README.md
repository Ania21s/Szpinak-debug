# Szpinak

Co to jest: Aplikacja promująca szpinak przez wyzwania, przepisy i akcje, za które zdobywa się punkty.

Dla kogo: Dla wszystkich, którzy chcą odkrywać szpinak i brać udział w kulinarnych wyzwaniach.

Jaki problem: Zachęca do poznawania szpinaku i pomaga włączyć go do codziennych posiłków.

> **Zadanie z kursu:** w tej wersji siedzi kilka błędów. Instrukcja w [DEBUG.md](DEBUG.md).

## Asystent AI

Asystent przepisów korzysta z routera `openrouter/free`, który kieruje zapytania wyłącznie do dostępnych bezpłatnych modeli OpenRouter. Klucz API nie jest udostępniany przeglądarce.

### Uruchomienie lokalne

1. Zainstaluj zależności: `npm install`.
2. Utwórz plik `.dev.vars` w katalogu głównym i dodaj `OPENROUTER_API_KEY="twój-klucz-openrouter"`.
3. Uruchom `npm run dev`, a następnie otwórz adres wyświetlony przez Cloudflare.

Plik `.dev.vars` jest ignorowany przez Git. Nie umieszczaj klucza w plikach aplikacji ani w repozytorium.

### Wdrożenie

1. Uruchom `npm run deploy` i zaloguj się do Cloudflare, jeśli CLI o to poprosi.
2. W panelu Cloudflare otwórz Workera `szpinak-ai-assistant` → **Settings** → **Variables and Secrets** i dodaj `OPENROUTER_API_KEY` jako sekret.
3. Wdróż nową wersję Workera po dodaniu sekretu.

`npm test` uruchamia testy endpointu, a `npm run build` sprawdza konfigurację i kompilację bez wdrażania.
