// Get the button
const button = document.querySelector('#buyConfirmation');

// Attach the click event listener
button.addEventListener('click', async function() {
    const radios = document.getElementsByName('buyThis');

    // Loop through all radio buttons
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            const flightNum = radios[i].value;

            // Proceed with buying the selected flight
            await fetch('buyTicket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    flightNum: flightNum
                })
            });
            // const data = await response.json();
            // console.log(data);
            const successMes = document.createElement('p');
            successMes.innerHTML = `Ticket for the flight ${flightNum} bought successfully!<br>Click <a href="/myTickets">here</a> to view your tickets.`;
            document.body.appendChild(successMes);
            break;
        }
    }
});