import request from 'request';
import saveData from './saveData.js';
async function eventbrite_schedulejob() {
    var options = {
        'method': 'GET',
        'url': process.env.EVENTBRITE_URL,
        'headers': {
            'Authorization': process.env.EVENTBRITE_TOKEN,
        }
    };
    request(options, function (error, response) {

        if (error) throw new Error(error);

        const bodyObj = (JSON.parse(response.body))
        const toursObj = bodyObj.events;
        let i = 0;

        toursObj.forEach(element => {
            console.log('eventbrite completed at:'+(i*100)/toursObj.length)+'%';
            i++;
            const tourData = {
                date: element.start.local,
                title: element.name.text.toLowerCase().trim(),
                reservations: []
            };

            var options = {
                'method': 'GET',
                'url': 'https://www.eventbriteapi.com/v3/events/' + element.id + '/attendees/',
                'headers': {
                    'Authorization': process.env.EVENTBRITE_TOKEN,
                }
            };
            request(options, async function (error, response) {

                if (error) console.error(error);

                const bodyObj = (JSON.parse(response.body))
                const attendancesObj = bodyObj.attendees;
                let reservations_array = new Map();
                for (const element of attendancesObj) {
                

                    if (reservations_array.has(element.profile.name)) {
                        reservations_array.get(element.profile.name).num_participants = reservations_array.get(element.profile.name).num_participants + element.quantity;
                    } else {
                        const tourResData = {
                            reservation_id: element.order_id,
                            walker: element.profile.name,
                            num_participants: element.quantity,
                            site: 'EventBrite',
                        };
                        reservations_array.set(element.profile.name, tourResData);
                    }
                }

                for (const reservation of reservations_array.values()) {
                    await saveData(tourData, reservation);
                }
            });
        });
    });
}

export default eventbrite_schedulejob;