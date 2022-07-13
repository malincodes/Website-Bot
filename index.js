const puppeteer = require('puppeteer');
var csv = require('node-csv').createParser();

//Setup CSV file and login
csv.parseFile('./testfile.csv', async function(err, data) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://www.hopin.com/sign_in');

  //Submit email on first login page
  await page.waitForSelector('#session_identity');
  await page.type('#session_identity', 'email');
  const form = await page.$('form-selector');
  await page.click('[name="commit"]');
  await page.waitForNavigation();
  console.log('It worked! New Page URL:', page.url()); //check with logging on console if it worked

  //submit password on second login page
  await page.goto('https://hopin.com/sign_in/primary');
  await page.type('#session_challenge.input', 'password');
  await page.click('[name="commit"]');
  await page.waitForNavigation();
  console.log('It worked again! New Page URL:', page.url());
  await page.screenshot({ path: 'itworked.png' }); //check with screenshot if it worked

  //navigate to website where vendors are invited
  await page.goto('https://hopin.com/organisers/events/eventname/redeem_codes/vendors');

  for (let i = 0; i < data.length; i++){
    //invite persons to booth setup via email address
    await page.waitForSelector('#redeem_code_email');
    await page.type('#redeem_code_email', data[i]);
    await page.waitForSelector('#redeem_code_booth_size');
    await page.type('#redeem_code_booth_size', 'Mini');
    await page.screenshot({ path: 'itworkedagain.png' }); //check with screenshot if it worked
    await page.click('[type="submit"]');
    //await page.waitForNavigation();
    console.log(i, data[i]);
  }
  await browser.close();
})
