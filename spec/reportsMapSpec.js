//To get sjhint to ignore protrator calls ad this to .jshint "browser","element","by","expect","protractor","beforeEach"
describe('Online Reporting Search Page', function() { //jshint ignore:line

  var EC = protractor.ExpectedConditions;

  beforeEach(function() {
    browser.get('/search/reporting-map?filter=all');
    browser.driver.sleep(1);
    browser.waitForAngular();
    //       spyOn(console, 'error');
  }); // it

  it('should not report errors when the page is loaded', function() {

      if (browser.browserName !== 'internet explorer') {
        var count = 0;
        browser.manage().logs().get('browser').then(function(browserLog) {

          for (var i = 0; i < browserLog.length; i++) {
            if (browserLog[i].level.name === 'SEVERE'){
                  count++;
                  console.log('-----------------------',browserLog[i]);
            }

          }
          expect(count).toEqual(0);
        });
      }
  });
});
