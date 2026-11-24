# Debugowanie: napraw Szpinaka

Ta wersja aplikacji ma w sobie kilka błędów. Twoje zadanie: znaleźć je, zrozumieć, skąd się biorą, i naprawić z pomocą AI.

## Start (10 minut)

1. Na górze tej strony kliknij **Use this template** → **Create a new repository**. Nazwij je `szpinak-debug` i utwórz na swoim koncie.
2. Sklonuj **swoje** nowe repo na komputer, tak jak na spotkaniu 3.
3. Otwórz folder w aplikacji z agentem AI.
4. Otwórz plik `index.html` w przeglądarce (dwuklik albo przeciągnij do okna).
5. Otwórz **konsolę przeglądarki**: prawy przycisk na stronie → **Zbadaj** → zakładka **Console**.

## Zasady

- **Najpierw zobacz, potem naprawiaj.** Zanim poprosisz AI o poprawkę, opisz objaw własnymi słowami.
- **Jeden błąd = jeden commit.** Opis commita mówi, co naprawiłeś, np. `fix: punkty zostają po odświeżeniu`.
- **Do każdego błędu jeden wiersz w logu promptów:** co poprosiłeś, co dostałeś, czy zadziałało.
- Nie wklejaj do czatu prawdziwych kluczy ani danych osobowych.

## Trzy pytania do każdego błędu

1. **Co miało się stać?**
2. **Co się dzieje zamiast tego?** Co pokazuje konsola?
3. **Kiedy dokładnie?** Po kliknięciu, po odświeżeniu, na telefonie?

## Lista objawów

### Poziom 1: każdy
1. Po otwarciu strony nic nie reaguje na kliknięcia, a konsola jest czerwona.
2. Komunikat mówi „Dodano 20 punktów”, ale licznik rośnie o mniej.
3. Po zdobyciu punktów odśwież stronę. Gdzie są Twoje punkty?

### Poziom 2: dla tych, którzy skończyli
4. Włącz w narzędziach przeglądarki widok telefonu (ikona telefonu obok „Elements”). Czy wszystko mieści się na ekranie?
5. Przejrzyj pliki w repo jak audytor bezpieczeństwa. Czy jest tu coś, co nigdy nie powinno trafić na GitHuba?

### Poziom 3: bonus (wymaga Node.js)
6. Asystent AI nie odpowiada. Uruchom testy: `npm test`. Co mówi test, który nie przechodzi?

## Gotowe, gdy

- Wszystkie błędy z Twojego poziomu naprawione i każdy w osobnym commicie.
- Push na GitHuba, link do Twojego repo na kanale kursu.
- Na czacie jedno zdanie: który błąd był najtrudniejszy i czego się z niego nauczyłeś.
