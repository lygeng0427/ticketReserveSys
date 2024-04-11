const button = document.querySelector('#cancelConfirmation');

button.addEventListener('click', async function() {
    const radios = document.getElementsByName('cancelThis');
    
    for (let i = 0; i < radios.length; i++) {
        if (radios[i].checked) {
            const flightNum = radios[i].value;

            await fetch('cancelTicket', {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    flightNum: flightNum
                })
            });
            // const data = await response.json();
            const successMes = document.createElement('p');
            successMes.innerHTML = `Ticket for the flight ${flightNum} cancelled successfully!<br>Click <a href="/allTickets">here</a> to view all tickets.`;
            document.body.appendChild(successMes);

            const myTable = document.querySelector('#myTickets').childNodes[3];
            const cancelledRow = document.querySelector(`#${flightNum}`);
            myTable.removeChild(cancelledRow);
            break;
        }
    }
});