//import puppeteer library to scrape data...
const puppeteer = require("puppeteer");
const fs = require("fs");

const scrape = async () => {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(0);

    let data = [];
    let allLinks = [
      "https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579104677933#",
    ];

    async function scroll(page) {
      await page.evaluate(() => {
        const distance = 100;
        const delay = 100;
        const timer = setInterval(() => {
          document.scrollingElement.scrollBy(0, distance);
          if (
            document.scrollingElement.scrollTop + window.innerHeight >=
            document.scrollingElement.scrollHeight
          ) {
            clearInterval(timer);
          }
        }, delay);
      });
    }
    let counter = 0;
    do {
      await page.goto(allLinks[counter], { timeout: 0 });
      scroll(page);

      //links from where we have to scrape data

      let jobs = [
        "https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579487277101#",
        "https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579104677933#",
        "https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579487342637#",
        "https://teradek.com/collections/colr/products/anton-bauer-digital-battery?variant=14579487309869#",
      ];

      data.push(...jobs);

      counter++;
      await page.waitForTimeout(3000);
    } while (counter < allLinks);

    // get all the data from stored links
    const allData = [];
    for (const urls of data) {
      await page.goto(urls);
      scroll(page);

      // getting all the product name of the links
      await page.waitForSelector("h1");
      const product_name = await page.evaluate(() => {
        let Title = document.querySelector(".grid__item.one-whole h1");
        return Title ? Title.innerText : null;
      });
      // console.log(product_name);

      // getting SKU number
      const sku = await page.evaluate(() => {
        let applink = document.querySelector(".sku.grid__item.one-whole");
        return applink ? applink.innerText : null;
      });
      // console.log(sku);

      //get price of the product

      const price = await page.evaluate(() => {
        let o_price = document.querySelector("#price-section p");
        return o_price ? o_price.innerText : null;
      });
      // console.log(price);

      //push scraped data into an object

      let dataDetails = {
        product_name,
        sku,
        price,
      };
      allData.push(dataDetails);
    }
    await page.waitForTimeout(3000);
    console.log(allData);

  
    //convert object data into JSON

    console.log("JSON data:");
    var jsonString = JSON.stringify(allData);
    console.log(jsonString);

    // const jsonData = new jsonData(jsonString);
    // Array.from(jsonData);

    fs.writeFileSync("jsonFile.json", jsonString, (err) => {
      if (err) console.log(err);
      else {
        console.log("File written successfully\n");
        console.log("The written has the following contents:");
        console.log(fs.readFileSync("json.txt", "utf8"));
      }
    });

    await browser.close();
    return allData;
  } catch (error) {
    console.log(error);
  }
};

scrape();
