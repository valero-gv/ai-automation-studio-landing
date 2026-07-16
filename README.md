# PILOT 14 landing

Статический лендинг PILOT 14. Сайт работает без сборщика и публикуется через GitHub Pages на `https://pilot14.ru/`.

## Локальный запуск

```bash
python3 -m http.server 8080
```

Откройте `http://localhost:8080`.

## Публикация

Workflow `.github/workflows/pages.yml` публикует сайт при каждом push в `main`.
