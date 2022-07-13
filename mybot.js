//imports puppeteer package
const puppeteer = require('puppeteer');
//imports filesystem and csv package
const fs = require("fs");
const { parse } = require("csv-parse");

//data conversion
var data = [];
fs.createReadStream("./testfile.csv").pipe(parse({ delimiter: ";", from_line: 1 })).on("data", function (row) {
    data.push(row);
}).on("end", async function(){
    console.log(data);
    //Setup and login
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.hopin.com/sign_in');
    
    //Submit email on first login page
    await page.waitForSelector('#session_identity');
    await page.type('#session_identity', 'email');
    await page.click('[name="commit"]');
    await page.waitForNavigation();
    console.log('email accepted! New Page URL:', page.url());
    
    //Submit password on second login page
    await page.goto('https://hopin.com/sign_in/primary');
    await page.type('#session_challenge.input', 'password');
    await page.click('[name="commit"]');
    await page.waitForNavigation();
    console.log('password accepted! New Page URL:', page.url());
    await page.screenshot({ path: 'itworked.png' });

    //Add and fill all booths with information from Excel file
    for (let i = 133; i < data.length; i++){
        await page.goto('https://hopin.com/organisers/events/eventname/vendors/new');
        await page.waitForSelector('#vendor_name');
        await page.type('#vendor_name', data[i][0]);
        await page.type('#vendor_email', data[i][1]);
        await page.type('#vendor_headline', data[i][2]);
        await page.type('#size', 'Mini');
        await page.type('#tag-input', data[i][3]);
        await page.click('#tags-add');
        await page.waitForSelector('#vendor_about');
        await page.type('#vendor_about', data[i][4]);
        await page.type('#provider', data[i][5]);
        await page.click('[data-testid="save-bar-button"]')
        await page.waitForNavigation();

        console.log(i, data[i]);

      }
      
    await browser.close();
})



