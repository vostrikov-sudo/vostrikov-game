# Vostrikov Game

Сайт с двумя играми: **Раннер** (платформер в стиле Марио + задания как в Among Us) и **Сражение** (арена с танками, оружием и дронами).

Герой — персонаж с картинок (Minecraft-стиль + фото).

## Структура

```
/
├── index.html          # Главная страница
├── runner.html         # Игра-раннер
├── battle.html         # Игра-сражение
├── css/style.css
├── js/
│   ├── main.js
│   ├── runner.js
│   └── battle.js
├── img/
│   ├── character.png   # Спрайт героя
│   ├── hero.jpg        # Главный баннер
│   └── armwrestle.jpg  # Картинка для правил
└── README.md
```

## Запуск локально

Просто открой `index.html` в браузере, или подними любой статический сервер:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

## Перенос на VPS

1. Залей всю папку на сервер (scp, rsync, git, FileZilla…).
2. Настрой nginx / Apache / Caddy на раздачу статики из этой папки.
3. Пример nginx:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/vostrikov-game;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # кэш картинок
    location ~* \.(png|jpg|jpeg|css|js)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}
```

4. (Опционально) HTTPS через certbot.

Игры полностью на клиенте (Canvas + JS), бэкенд не нужен.

## Управление

### Раннер
- Прыжок: ↑ / Пробел / Тап
- Задания: клик по зелёным панелям «TASK»

### Сражение
- Движение: WASD / Стрелки
- Атака: ЛКМ / Пробел
- Оружие: 1 — Меч, 2 — Пушка, 3 — Дроны
