# Vostrikov Game

Гра про Вострикова Ігоря Тимофійовича.

Код можна редагувати та виправляти. Це бета-версія.
Про помилки та проблеми можна повідомити на пошту kremlin@netavex.com або в Telegram: @collraynote.

Гра доступна на сайті: http://vostrikov-game.duckdns.org/

## Бій

Арена у 2.5D: об’ємні укриття, солдати, танки та дрони. Після зачистки
хвилі — 4 секунди перепочинку й відновлення 20 HP. Аптечки відновлюють 25 HP.
Результат, монети та досвід зберігаються у профілі після поразки.

| Дія | Комп’ютер | Телефон / планшет |
| --- | --- | --- |
| Рух | WASD / стрілки | Лівий стік |
| Прицілювання | Миша | Правий стік |
| Вогонь | Утримувати ліву кнопку миші / пробіл | Відхилити правий стік |
| Зброя | 1–9 / коліщатко / кнопки арсеналу | Кнопки арсеналу |
| Перезаряджання | R (автоматично, коли магазин порожній) | Кнопка перезаряджання |
| Ривок | Shift під час руху | Кнопка ривка під час руху |
| Пауза | Esc / P / кнопка паузи | Кнопка паузи |

Меч, пістолет, автомат і дробовик доступні одразу, зокрема у старих збереженнях.
Гармата відкривається на 2-й хвилі, ракети й дрони — на 3-й, снайперська гвинтівка —
на 4-й, плазма — на 5-й. Зброя, відкрита за проходження хвиль, доступна до кінця поточного бою.
Купівля у профілі надає постійний доступ, а поліпшення збільшують шкоду.
Запас набоїв необмежений, але магазини потрібно перезаряджати. Зміна зброї скасовує
незавершене перезаряджання. Ривок відновлюється за 2,4 секунди.
Під час перемикання вкладки або втрати фокуса бій автоматично стає на паузу.

## Локальний запуск

Потрібні Node.js 24 LTS та npm. Команди виконуються з кореня репозиторію:

```bash
npm ci
npm run dev
```

Застосунок доступний за адресою `http://localhost:8080`. Перевірки:

```bash
npm run typecheck
npm run test:battle
npm test
```

## Розгортання на власному VPS: домен + Let's Encrypt

Нижче наведено варіант для **Ubuntu 24.04 LTS**, із `sudo`, systemd та Nginx.
Для іншої ОС команди встановлення пакетів відрізнятимуться.
Для збирання використовуйте VPS із 2 ГБ оперативної пам’яті або більше; якщо пам’яті
бракує, збирайте на іншій Linux-машині з Node.js 24 та переносьте **всю** папку `.output` на VPS.

Гра використовує React / TanStack Start і сервер Nitro: самого копіювання HTML
до Nginx недостатньо. Команда `npm run build:vps` створює автономний Node-сервер
у `.output/server/index.mjs`, а статичні файли — у `.output/public`.
Звичайна команда `npm run build` створює збірку для Vercel.

### 1. Домен і відкриті порти

У DNS домену створіть запис `A` для `game.example.com`, що вказує на публічну
IPv4-адресу VPS. Далі всюди замініть `game.example.com` на свій домен.
Якщо використовуєте `AAAA`, цей запис має вказувати на робочу IPv6-адресу того самого VPS;
неправильний запис `AAAA` видаліть. DuckDNS також підходить: використовуйте наданий піддомен.
Дочекайтеся оновлення DNS, перш ніж отримувати сертифікат.

У брандмауері провайдера дозвольте вхідні TCP-з’єднання на порти **80**, **443** і свій SSH-порт.
Якщо використовуєте UFW, спочатку дозвольте поточний SSH-порт, щоб не втратити доступ
(приклад нижче передбачає стандартний порт 22):

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

Порт застосунку 3000 не потрібно відкривати ззовні — сервер слухатиме локальний інтерфейс loopback.
Порт 80 також потрібен для подальшого поновлення сертифіката за допомогою перевірки HTTP-01.

### 2. Встановлення та збирання

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

`useradd` потрібен лише під час першого встановлення. Якщо Node.js 24 вже встановлено іншим
способом, використовуйте його та npm; у конфігурації systemd нижче вкажіть абсолютний шлях
до цього Node замість `/snap/bin/node`. Пакети для збирання встановлюйте повністю, без
`--omit=dev`. Після збирання для запуску достатньо `.output` та Node.js.

Наразі авторизацію та базу даних вимкнено у `.grok/app-env.json`, міграції
пропускаються, ключі API та PostgreSQL для гри не потрібні. Профіль зберігається у
`localStorage` браузера: у разі зміни домену, переходу з HTTP на HTTPS або зміни браузера
старий профіль автоматично не переноситься. Це одиночна гра з ботами.

### 3. Служба systemd

Створіть `/etc/systemd/system/vostrikov.service`:

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

Очікується HTTP 200. Журнал: `sudo journalctl -u vostrikov -n 100 --no-pager`.
Для ручного запуску тієї самої збірки можна використати
`NITRO_HOST=127.0.0.1 NITRO_PORT=3000 npm start`.

### 4. Nginx

Створіть `/etc/nginx/sites-available/vostrikov` (замініть домен):

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

Символічне посилання потрібно створити лише один раз. Спочатку переконайтеся, що сайт
відкривається за доменом через HTTP, а DNS вказує саме на цей VPS. Якщо на сервері кілька
сайтів, кожен повинен мати власний `server_name`.

### 5. HTTPS від Let's Encrypt

Встановіть Certbot через snap за [офіційною інструкцією Certbot для Nginx](https://certbot.eff.org/instructions?ws=nginx&os=snap).
Якщо Certbot уже встановлено через apt, спочатку видаліть саме пакети `certbot` і
`python3-certbot-nginx`, щоб не змішувати способи встановлення; наявні сертифікати
та `/etc/letsencrypt` збережіть.

```bash
sudo snap install --classic certbot
sudo /snap/bin/certbot --nginx --redirect -d game.example.com
```

Certbot запитає адресу електронної пошти та згоду з умовами, отримає сертифікат,
додасть налаштування TLS до Nginx і перенаправлення з HTTP на HTTPS. Вказуйте лише домени,
для яких уже налаштовано DNS; для додаткового імені додайте ще один `-d`.

```bash
sudo nginx -t
curl -I https://game.example.com/battle
sudo /snap/bin/certbot renew --dry-run
systemctl list-timers --all | grep -i certbot
```

Snap налаштовує автоматичне поновлення. Перевірка `renew --dry-run` має
завершитися успішно; вручну додавати cron не потрібно. Залиште порти 80/443 доступними.
Якщо сертифікат не видається, перевірте A/AAAA, брандмауер VPS і провайдера, доступність
домену ззовні через HTTP та відсутність конфліктів `server_name` у Nginx.
[Опис перевірки HTTP-01](https://letsencrypt.org/docs/challenge-types/#http-01-challenge).

### 6. Оновлення та відкат

Цей простий спосіб оновлення передбачає коротку зупинку гри на час збирання.
Спочатку отримайте зміни, збережіть стару збірку й лише потім зупиніть службу:

```bash
cd /opt/vostrikov/app
sudo -u vostrikov -H git pull --ff-only
sudo -u vostrikov cp -a .output .output-backup-$(date +%Y%m%d-%H%M%S)
sudo systemctl stop vostrikov
sudo -u vostrikov -H env PATH=/snap/bin:/usr/bin:/bin npm ci
sudo -u vostrikov -H env PATH=/snap/bin:/usr/bin:/bin npm run build:vps
# Продовжуйте лише після успішного збирання:
sudo systemctl start vostrikov
curl -I https://game.example.com/battle
```

Якщо встановлення або збирання завершилося з помилкою, не запускайте неповну збірку.
Перемістіть неробочу `.output` до окремої папки та відновіть `.output` зі
створеної резервної копії, а потім запустіть `sudo systemctl start vostrikov`.
Помилки **502** зазвичай означають, що Node-службу не запущено: перевірте `systemctl
status vostrikov`, журнал служби та `curl http://127.0.0.1:3000/`.
Після розгортання також перевірте пряме відкриття `/profile` і `/battle`, завантаження
ресурсів та початок бою на комп’ютері й телефоні.
