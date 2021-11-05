const { chromium } = require('playwright-chromium');


module.exports = async function(context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    const url = req.query.url || "https://returngis.net/";
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.emulateMedia('screen');
    await page.goto(url);
    const screenshotBuffer = await page.pdf({ format: 'A4' })
    await browser.close();
    context.res = {
        body: screenshotBuffer,
        headers: {
            "content-type": "application/pdf",
            "Content-disposition": "attachment; filename=" + url + ".pdf"
        }
    };
}