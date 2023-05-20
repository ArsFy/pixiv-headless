# Pixiv Headless

Stable pixiv crawler middleware for headless.

## Start

```bash
git clone https://github.com/ArsFy/pixiv-headless.git
cd pixiv-headless
npm install
```

> Puppeteer: `node node_modules/puppeteer/install.js`

#### Set Token

`./token`: random text

#### HTTP API

```
POST /api/get_image
```

| Key | Description |
| --- | ----------- |
| id  | Pixiv ID    |
| token | `./token` random text |

#### Return

```json
{
    "status": "ok",
    "image":[
        "https://i.pximg.net/img-original/img/2023/05/12/21/19/53/108063576_p0.jpg",
        "https://i.pximg.net/img-original/img/2023/05/12/21/19/53/108063576_p1.jpg"
    ],
    "title": "「おにいちゃんはそのまま寝ててね」",
    "tag":[
        "R-18",
        "原創",
        "女の子",
        "抱き枕",
        "ぱんつ"
    ]
}
```