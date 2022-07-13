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
    
//Login
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
   
 

//invite persons to booth setup
    for (let i = 12; i < data.length; i++){
        await page.goto('https://hopin.com/organisers/events/eventname/redeem_codes/vendors');
        await page.waitForSelector('#redeem_code_email');
        let input = await page.$('#redeem_code_email');
        await input.click({ clickCount: 1 });
        console.log(data[i][1])
        await page.type('#redeem_code_email', data[i][1]);

        await page.waitForSelector('#redeem_code_vendor_id');

        let option = (await page.$x(`//*[@id = "redeem_code_vendor_id"]/option[text() = "${data[i][0]}"]`))[0];
        let value = await (await option.getProperty('value')).jsonValue();
        await page.select('select#redeem_code_vendor_id', value);
        
        await page.click('[data-testid="send-vendor-invite"]');
        await page.waitForSelector('#redeem_code_email');
        console.log(i, data[i]);
        }
    await page.waitForSelector('#redeem_code_email');
    await browser.close();
})