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

        toursObj.forEach(element => {

            const tourData = {
                date: element.start.local,
                title: element.name.text,
                reservations: []
            };

            var options = {
                'method': 'GET',
                'url': 'https://www.eventbriteapi.com/v3/events/' + element.id + '/attendees/',
                'headers': {
                    'Authorization': process.env.EVENTBRITE_TOKEN,
                }
            };
            request(options, function (error, response) {

                if (error) throw new Error(error);

                const bodyObj = (JSON.parse(response.body))
                const attendancesObj = bodyObj.attendees;
                let reservations_array = new Map();

                attendancesObj.forEach(element => {

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
                });

                reservations_array.forEach((value, key) => {
                    saveData(tourData,value)
                })
            });
        });
    });
}

export default eventbrite_schedulejob;