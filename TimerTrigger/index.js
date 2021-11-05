const { chromium } = require('playwright-chromium');
const appInsights = require("applicationinsights");
const { v4 } = require('uuid');
var telemetryClient = new appInsights.TelemetryClient(process.env.APP_INSIGHTS_WEB);
const Stopwatch = require('statman-stopwatch');

module.exports = async function(context, myTimer) {
    var timeStamp = new Date().toISOString();

    if (myTimer.isPastDue) {
        context.log('JavaScript is running late!');
    }
    context.log('JavaScript timer trigger function ran!', timeStamp);

    //Create availability telemetry
    var availabilityTelemetry = {
        id: v4(),
        name: process.env.AVAILABILITY_TEST_NAME,
        runLocation: process.env.RUN_LOCATION,
        success: false
    };

    const stopwatch = new Stopwatch();
    const browser = await chromium.launch({ headless: true });

    try {
        //Create playwright flow        
        const page = await browser.newPage();
        stopwatch.start();

        context.log(`Navigating to: ${process.env.WEB_URL}`);
        await page.goto(process.env.WEB_URL);
        context.log(`Put the email ${process.env.TEST_USER_EMAIL}`);
        await page.type("input[type='email']", process.env.TEST_USER_EMAIL);
        await page.click("input[type='submit']");
        await page.waitForNavigation();

        context.log('Put the password');
        await page.click("[placeholder='Password']");
        await page.type("input[name='passwd']", process.env.TEST_USER_PWD);
        await page.click("input[type='submit']");
        await page.waitForNavigation();

        context.log('Say no');
        await page.click("text=No");
        await page.waitForNavigation();

        var title = await page.title();
        context.log('Title: ' + title);
        availabilityTelemetry.success = true;

    } catch (error) {
        context.log.error('Error: ' + error);
        availabilityTelemetry.success = false;

        //Create exception telemetry        
        telemetryClient.trackException({ exception: error });

    } finally {
        stopwatch.stop();
        var elapsed = stopwatch.read();
        context.log('Stopwatch: ' + elapsed);
        availabilityTelemetry.duration = elapsed;
        telemetryClient.trackAvailability(availabilityTelemetry);
        await browser.close();
        context.done();
    }
}