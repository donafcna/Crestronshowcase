// Existing rendering tests exercise manual controls, not the automatic tour.
exports.pauseVillaTour = async page => {
  await page.waitForFunction(() => window.__plan3d && document.querySelector('iframe')?.contentWindow?.Villa?.ready);
  await page.locator('.device-stage').click({position:{x:5,y:5}});
  await page.frameLocator('iframe').locator('#room-select').selectOption('1');
  await page.evaluate(() => __plan3d.focusSelected());
};
