import puppeteer from "puppeteer";

const startBrowser = async () => {
  let browser;
  try {
    console.log("Opening the browser......");
    console.log(puppeteer.executablePath(), "EXECUTABLE");
    browser = await puppeteer.launch({
      headless: true,
      args: ["--disable-setuid-sandbox", "--no-sandbox", "--disable-gpu"],
      executablePath: "/usr/bin/chromium-browser",
      ignoreHTTPSErrors: true,
    });
  } catch (err) {
    console.log("Could not create a browser instance => : ", err);
  }
  return browser;
};

export { startBrowser };
