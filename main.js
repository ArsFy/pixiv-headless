const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const multipartMiddleware = require('connect-multiparty')();
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const fs = require('fs');

const token = fs.readFileSync('./token', 'utf8').replace(/(^\s*)|(\s*$)/g, "");

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

let haveCookie = false, cookies = [];
try {
    haveCookie = fs.readFileSync('./cookie.json', 'utf8');
    cookies = JSON.parse(haveCookie);
    haveCookie = true;
} catch (e) { }

// Setting
app.disable('x-powered-by');
// Use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());

(async () => {
    // Status
    app.get('/api/status', multipartMiddleware, (req, res) => res.json({ "status": 200 }));

    const browser = await puppeteer.launch({ headless: false, args: ['--no-sandbox'] });
    const page = await browser.newPage();
    if (haveCookie) for (const cookie of cookies) {
        await page.setCookie(cookie);
    }
    await page.goto('https://pixiv.net/');

    if (!haveCookie) {
        readline.question('Login OK?', async (name) => {
            const cookies = await page.cookies();
            fs.writeFileSync('./cookie.json', JSON.stringify(cookies));
            process.exit(0);
        });
    }

    if (haveCookie) {
        app.post('/api/get_image', multipartMiddleware, async (req, res) => {
            if (req.body.token == token) {
                const id = req.body.i;
                if (!isNaN(Number(id))) {
                    const image = await browser.newPage();
                    await image.goto('https://pixiv.net/i/' + id);

                    await image.evaluate(() => {
                        try {
                            const btn = document.getElementsByTagName("button");
                            for (let i in btn) {
                                try {
                                    const t = btn[i].getElementsByTagName("div");
                                    for (let ii in t) {
                                        if (t[ii].innerText == "查看全部") {
                                            btn[i].click();
                                            clearInterval(retry);
                                            break
                                        }
                                    }
                                } catch (e) { }
                            }
                        } catch (e) { }
                    });

                    setTimeout(async () => {
                        let arr = await image.evaluate(() => {
                            let arr = [];
                            let list = document.getElementsByTagName("img");
                            for (let i = 0; i < list.length; i++) {
                                if (list[i].parentElement.tagName == "A") {
                                    if (list[i].parentElement.href.indexOf("img-original") != -1) {
                                        arr.push(list[i].parentElement.href);
                                    }
                                }
                            }
                            return arr;
                        })

                        let taglist = await image.evaluate(() => {
                            let arr = [];
                            let list = document.getElementsByTagName("footer")[0].getElementsByTagName("li");
                            for (let i = 0; i < list.length; i++) {
                                try {
                                    if (list[i].getElementsByTagName("a")[0].innerText != null) {
                                        arr.push(list[i].getElementsByTagName("a")[0].innerText)
                                    }
                                } catch (e) { }
                                console.log(arr)
                            }
                            return arr;
                        })

                        let title = await image.evaluate(() => document.getElementsByTagName("h1")[0].innerText);

                        image.close();

                        res.json({
                            status: 'ok',
                            image: arr,
                            title: title,
                            tag: taglist
                        })
                    }, 1000)
                } else res.json({ "status": "id_error" })
            } else res.json({ "status": "token_error" })
        })

        app.listen(process.env.HTTP_PORT || 8082, () => {
            console.log("Start Service...")
        })
    }
})()

