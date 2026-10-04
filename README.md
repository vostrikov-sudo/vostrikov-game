Гра по Вострикову Ігорю Тимофійовичу.

Код може редагуватися та виправлятися. Це бета версія.
За багами та проблемами можете відписати на пошту kremlin@netavex.com або в Telegram на @collraynote

Гра доступна на сайті: http://vostrikov-game.duckdns.org/

## Сражение

Арена в 2.5D: объёмные укрытия, солдаты, танки и летающие дроны. После зачистки
волны — 4 секунды передышки и восстановление 20 HP. Аптечки восстанавливают 25 HP.
Результат, монеты и опыт сохраняются в профиле после поражения.

| Действие | Компьютер | Телефон / планшет |
| --- | --- | --- |
| Движение | WASD / стрелки | Левый стик |
| Прицел | Мышь | Правый стик |
| Огонь | Удерживать ЛКМ / пробел | Отклонить правый стик |
| Оружие | 1–9 / колесо / кнопки арсенала | Кнопки арсенала |
| Перезарядка | R (автоматически при пустом магазине) | «Зарядить» |
| Рывок | Shift во время движения | «Рывок» во время движения |
| Пауза | Esc / P / кнопка паузы | Кнопка паузы |

Меч, пистолет, автомат и дробовик доступны сразу, в том числе в старых сохранениях.
Пушка открывается на 2-й волне, ракеты и дроны — на 3-й, снайперская винтовка —
на 4-й, плазма — на 5-й. Открытия по волнам действуют до конца текущего боя.
Покупка в профиле даёт постоянный доступ, улучшения повышают урон.
Запас патронов неограничен, но магазины нужно перезаряжать. Смена оружия отменяет
незаконченную перезарядку. Рывок восстанавливается за 2,4 секунды.
При переключении вкладки или потере фокуса бой автоматически ставится на паузу.

## Локальный запуск

Нужен Node.js 24 LTS и npm. Команды выполняются из корня репозитория:

```bash
npm ci
npm run dev
```

Приложение доступно на `http://localhost:8080`. Проверки:

```bash
npm run typecheck
npm run test:battle
npm test
```

## Деплой на собственный VPS: домен + Let's Encrypt

Ниже — вариант для **Ubuntu 24.04 LTS**, с `sudo`, systemd и Nginx.
Для другой ОС команды установки пакетов отличаются.
Используйте VPS с 2 ГБ RAM или больше для сборки; при нехватке памяти собирайте
на другой Linux-машине с Node.js 24 и переносите **всю** папку `.output` на VPS.

Игра использует React / TanStack Start и сервер Nitro: одного копирования HTML
в Nginx недостаточно. Команда `npm run build:vps` собирает автономный Node-сервер
в `.output/server/index.mjs` и статику в `.output/public`.
Обычная `npm run build` сохраняет сборку для Vercel.

### 1. Домен и открытые порты

В DNS домена создайте запись `A` для `game.example.com`, указывающую на публичный
IPv4 VPS. `game.example.com` далее везде замените на свой домен.
Если используете `AAAA`, она должна указывать на работающий IPv6 этого же VPS;
неправильную `AAAA` удалите. DuckDNS тоже подходит: используйте выданный поддомен.
Дождитесь обновления DNS перед выпуском сертификата.

В firewall провайдера разрешите входящие TCP **80**, **443** и свой SSH-порт.
Если используете UFW, сначала разрешите текущий SSH-порт, чтобы не потерять доступ
(пример ниже предполагает стандартный порт 22):

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Порт приложения 3000 наружу открывать не нужно — сервер будет слушать loopback.
Порт 80 нужен также для последующих продлений сертификата HTTP-01.

### 2. Установка и сборка

```bash
sudo apt update
sudo apt install -y git nginx snapd curl
sudo snap install node --classic --channel=24
/snap/bin/node --version
/snap/bin/npm --version

sudo useradd --system --user-group --create-home --home-dir /opt/vostrikov --shell /usr/sbin/nologin vostrikov
sudo -u vostrikov -H git clone https://github.com/vostrikov-sudo/vostrikov-game.git /opt/vostrikov/app
cd /opt/vostrikov/app
sudo -u vostrikov -H env PATH=/snap/bin:/usr/bin:/bin npm ci
sudo -u vostrikov -H env PATH=/snap/bin:/usr/bin:/bin npm run build:vps
```

`useradd` нужен только при первой установке. Если Node.js 24 уже установлен другим
способом, используйте его и npm; в systemd ниже укажите абсолютный путь к этому
Node вместо `/snap/bin/node`. Пакеты для сборки устанавливайте полностью, без
`--omit=dev`. После сборки для запуска достаточно `.output` и Node.js.

Сейчас авторизация и база данных выключены в `.grok/app-env.json`, миграции
пропускаются, ключи API и PostgreSQL для игры не нужны. Профиль хранится в
`localStorage` браузера: при смене домена, HTTP на HTTPS или браузера старый
профиль автоматически не переносится. Это одиночная игра с ботами.

### 3. Сервис systemd

Создайте `/etc/systemd/system/vostrikov.service`:

```ini
[Unit]
Description=Vostrikov Game
After=network.target

[Service]
Type=simple
User=vostrikov
Group=vostrikov
WorkingDirectory=/opt/vostrikov/app
Environment=NODE_ENV=production
Environment=NITRO_HOST=127.0.0.1
Environment=NITRO_PORT=3000
ExecStart=/snap/bin/node /opt/vostrikov/app/.output/server/index.mjs
Restart=on-failure
RestartSec=5
UMask=0027

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now vostrikov
sudo systemctl status vostrikov --no-pager
curl -I http://127.0.0.1:3000/battle
```

Ожидается HTTP 200. Логи: `sudo journalctl -u vostrikov -n 100 --no-pager`.
Для ручного запуска той же сборки можно использовать
`NITRO_HOST=127.0.0.1 NITRO_PORT=3000 npm start`.

### 4. Nginx

Создайте `/etc/nginx/sites-available/vostrikov` (замените домен):

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name game.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/vostrikov /etc/nginx/sites-enabled/vostrikov
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx
curl -I http://game.example.com/battle
```

Создание ссылки требуется только один раз. Сначала убедитесь, что сайт открывается
по домену через HTTP и DNS указывает именно на этот VPS. Если на сервере несколько
сайтов, у каждого должен быть свой `server_name`.

### 5. HTTPS от Let's Encrypt

Установите Certbot через snap по [официальной инструкции Certbot для Nginx](https://certbot.eff.org/instructions?ws=nginx&os=snap).
Если Certbot уже установлен через apt, сначала удалите именно пакеты `certbot` и
`python3-certbot-nginx`, чтобы не смешивать установки; существующие сертификаты
и `/etc/letsencrypt` сохраняйте.

```bash
sudo snap install --classic certbot
sudo /snap/bin/certbot --nginx --redirect -d game.example.com
```

Certbot запросит email и принятие условий, выпустит сертификат, добавит настройки
TLS в Nginx и перенаправление с HTTP на HTTPS. Указывайте только домены, для которых
уже настроен DNS; для дополнительного имени добавьте ещё один `-d`.

```bash
sudo nginx -t
curl -I https://game.example.com/battle
sudo /snap/bin/certbot renew --dry-run
systemctl list-timers --all | grep -i certbot
```

Snap настраивает автоматическое продление. Проверка `renew --dry-run` должна
завершиться успешно; вручную добавлять cron не требуется. Оставьте 80/443 доступными.
Если сертификат не выдаётся, проверьте A/AAAA, firewall VPS и провайдера, доступность
домена извне по HTTP и отсутствие конфликтующего Nginx `server_name`.
[Описание проверки HTTP-01](https://letsencrypt.org/docs/challenge-types/#http-01-challenge).

### 6. Обновление и откат

Этот простой способ обновления предполагает короткую остановку игры на время сборки.
Сначала получите изменения, сохраните старую сборку и только потом остановите сервис:

```bash
cd /opt/vostrikov/app
sudo -u vostrikov -H git pull --ff-only
sudo -u vostrikov cp -a .output .output-backup-$(date +%Y%m%d-%H%M%S)
sudo systemctl stop vostrikov
sudo -u vostrikov -H env PATH=/snap/bin:/usr/bin:/bin npm ci
sudo -u vostrikov -H env PATH=/snap/bin:/usr/bin:/bin npm run build:vps
# Продолжайте только после успешной сборки:
sudo systemctl start vostrikov
curl -I https://game.example.com/battle
```

Если установка или сборка завершилась с ошибкой, не запускайте неполную сборку.
Переместите нерабочую `.output` в отдельную папку и восстановите `.output` из
созданной резервной копии, затем запустите `sudo systemctl start vostrikov`.
Ошибки **502** обычно означают, что Node-сервис не запущен: проверьте `systemctl
status vostrikov`, журнал сервиса и `curl http://127.0.0.1:3000/`.
После деплоя проверьте также прямое открытие `/profile` и `/battle`, загрузку
ресурсов и начало боя на компьютере и телефоне.
