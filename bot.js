const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())

async function nse(dates) {
    let launchOptions = {
        headless: false,
        executablePath: 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe', // because we are using puppeteer-core so we must define this option
        args: ['--start-maximized']
    };
    console.log(dates)
    const browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    // set viewport and user agent (just in case for nice viewing)
    await page.setViewport({ width: 1366, height: 768 });
    await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36');

    // go to the target web
    await page.goto('https://www1.nseindia.com/products/content/derivatives/equities/historical_fo.htm', {timeout: 3000000});
    await page.select('#instrumentType', 'OPTIDX')
    await page.select('#symbol', 'NIFTY')
    await page.select('#year', '2020')
    await page.select('#expiryDate', `${dates[0]}`)
    await page.select('#optionType', 'CE')
    await page.waitForSelector('#rdDateToDate');
    let button = 'input[id="rdDateToDate"]';
    await page.evaluate((button) => document.querySelector(button).click(), button);
    // await page.select('#dateRange', '3month')
    await page.waitForSelector('#fromDate');
    await page.$eval('#fromDate', (el,date1) => el.value = date1, dates[1]);
    await page.waitForSelector('#toDate');
    await page.$eval('#toDate', (el,date2) => el.value = date2,dates[2]);
    let selector = 'input[class="getdata-button"]';
    await page.evaluate((selector) => document.querySelector(selector).click(), selector);
    await page.waitForFunction("document.querySelector('.download-data-link') && document.querySelector('.download-data-link').clientHeight != 0");
    const btnNext = await page.$('.download-data-link');
    await page.waitFor(3000);
    await btnNext.click();
    await page.waitFor(30000);
    await browser.close()
}


async function input_dates(input) {
    var dates = []
    for (let i = 0; i < input[0].length; i++) {
        dates.push([input[0][i], input[1][i], input[2][i]])

    }
    return dates

}
var data = [['30-01-2020', '27-02-2020', '26-03-2020', '30-04-2020', '28-05-2020'],//expiry date array
['01-Jan-2020', '01-Feb-2020', '01-Mar-2020', '01-Apr-2020', '01-May-2020'],//start date array
['30-Jan-2020', '27-Feb-2020', '26-Mar-2020', '30-Apr-2020', '28-May-2020']]//end date array

input_dates(data).then(async dates => {
    dates.forEach(async el =>{
        nse(el)
    } )
}).catch(err=>console.log(err))