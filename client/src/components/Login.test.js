const {
  Builder, By, Key, until,
} = require('selenium-webdriver');
require('chromedriver');
require('selenium-webdriver/chrome');
const fetch = require('node-fetch');

let driver;
beforeAll(async () => { driver = await new Builder().forBrowser('chrome').build(); });
afterAll(async () => { await driver.quit(); });

beforeEach(async () => {
  driver.wait(until.urlIs('http://localhost:3000/login'));
  await driver.get('http://localhost:3000/login');
});


test('login-page-loads', async () => {
  const url = await driver.getCurrentUrl();
  expect(url).toBe('http://localhost:3000/login');
  await driver.findElement(By.id('username')).getText().then((text) => {
    expect(text).toBe('');
  });
  await driver.findElement(By.id('pwd')).getText().then((text) => {
    expect(text).toBe('');
  });
});