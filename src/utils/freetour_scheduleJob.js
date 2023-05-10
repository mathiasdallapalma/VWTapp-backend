import moment from 'moment';
import puppeteer from 'puppeteer';
import saveData from './saveData.js';

async function loadPage(formattedDate, page) {
  // Navigate to the page with the data you want to scrape
  await page.goto(process.env.FREETOUR_PAGE_URL + formattedDate);

  const bookingCards = await page.$$('.booking-cards.js-tours');

  for (const bookingCard of bookingCards) {

    const content = await bookingCard.evaluate(el => el.textContent);

    const title = await bookingCard.$eval('.booking-card__title', el => el.textContent.trim());
    let time = await bookingCard.$eval('.booking-card__time', el => el.textContent.trim().replace(/[^0-9:]/g, ''));
    const name = await bookingCard.$eval('.booking-card__name', el => el.textContent.trim());
    const partecipants=await bookingCard.$eval('.booking-card__small', el => el.textContent.trim());
    const reservation_id = await bookingCard.$eval('.booking-card__number span', el => el.textContent.trim());

    // Split the time string into separate hour and minute components
    const [hour, minute] = time.split(':');

    // Check if the hour component is less than 8
    if (parseInt(hour) < 8) {
      // If the hour component is less than 8, add 12 to it and convert it back to a string
      // with padded zeros using toString() and padStart()
      time = (parseInt(hour) + 12).toString().padStart(2, '0') + ':' + minute;
    }

    let dateObj = moment(formattedDate + time, "YYYY-MM-DDhh:mm");
    const combinedDateTime = Date.parse(dateObj);
     
    const tourResData = {
      reservation_id: reservation_id,
      walker: name,
      num_participants: partecipants,
      site: 'FreeTour',
    };

    const tourData = {
      date: combinedDateTime,
      title: title,
      reservations: []
    };

    await saveData(tourData,tourResData);

  }
}

async function guruwalk_schedulejob() {
  const username = process.env.FREETOUR_USER;
  const password = process.env.FREETOUR_PASS;

  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  await page.goto(process.env.FREETOUR_URL);

  // Enter login credentials and submit form
  const emailInput = await page.$('.modal-input.modal-input--email.required');
  await emailInput.type(username);
  const passwordInput = await page.$('.modal-input.modal-input--pass.required');
  await passwordInput.type(password);

  const loginButton = await page.$('.modal-button');
  await loginButton.click();


  // Wait for navigation to complete
  await page.waitForNavigation();

  const isLoggedIn = page.url() == process.env.FREETOUR_URL+'backoffice/home';
  if(isLoggedIn){
    
    let date = new Date();

    for (let i = 0; i < 3; i++) {
      const formattedDate = date.toISOString().slice(0, 10);
      await loadPage(formattedDate, page);

      date.setDate(date.getDate() + 1);

    }
}else{
  console.error("Failed to logging in to FreeTour")
}
  await browser.close();
}

export default guruwalk_schedulejob;