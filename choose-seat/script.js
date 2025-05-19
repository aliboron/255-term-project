$(document).ready(function() {
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));

    if (!tripDetails) {
        alert('Please make a search first.');
        window.location.href = '/mainPage.html'; 
        return;
    }

    const { from, to, date } = tripDetails;
    const companies = ['Pegasus', 'Turkish Airlines', 'AJet', 'Ryan Air', 'SunExpress'];
    const trips = [];
    const numGeneratedTrips = 5;
    
    function formatDate(dateString) {
        if (!dateString) return "No date";
        
        if (dateString.includes(',')) return dateString;
        
        const parts = dateString.split('-');
        if (parts.length !== 3) return dateString;
        
        const year = parts[0];
        const month = parts[1];
        const day = parts[2];
        
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        
        const monthName = monthNames[parseInt(month) - 1];
        return `${monthName} ${parseInt(day)}, ${year}`;
    }

    for (let i = 0; i < numGeneratedTrips; i++) {
        const randomCompany = companies[Math.floor(Math.random() * companies.length)];
        const randomHour = Math.floor(Math.random() * 5) + 1;
        const randomMinute = [15, 30, 45][Math.floor(Math.random() * 3)];
        const randomDuration = `${randomHour} Hours ${randomMinute} Minutes`;
        const randomPrice = `${(Math.floor(Math.random() * 200) + 400)} TL`;

        const totalSeats = 60;
        const unavailableSeats = {};
        const numUnavailable = Math.floor(Math.random() * (totalSeats / 4)) + (totalSeats / 6);

        for (let j = 0; j < numUnavailable; j++) {
            const seatNumber = Math.floor(Math.random() * totalSeats) + 1;
            const gender = Math.random() > 0.5 ? 'male' : 'female';
            unavailableSeats[seatNumber] = gender;
        }

        trips.push({
            id: `trip-${Date.now()}-${i}`,
            company: randomCompany,
            time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
            duration: randomDuration,
            route: `${from} > ${to}`,
            date: formatDate(date), 
            price: randomPrice,
            unavailableSeats,
            totalSeats
        });
    }

    let currentFlightPricePerSeat = 0;

    $.each(trips, function(index, trip) {
        const $tripContainer = $('<div>', {
            class: 'trip-item-container'
        });

        const $summary = $('<div>', {
            class: 'trip-summary',
            html: `
                <div class="info">
                    <span><strong>Airline:</strong> ${trip.company}</span>
                    <span><strong>Time:</strong> ${trip.time}</span>
                    <span><strong>Duration:</strong> ${trip.duration}</span>
                    <span><strong>Route:</strong> <i class="fas fa-plane"></i> ${trip.route} (${trip.date})</span>
                </div>
                <div class="price">${trip.price}</div>
                <div class="toggle-icon">▼</div>
            `
        });

        const $seatDetails = $('<div>', {
            class: 'seat-details',
            css: {
                display: 'none'
            }
        });

        const $seatMap = $('<div>', {
            class: 'airplane-seat-map'
        });

        const $legend = $('<div>', {
            class: 'seat-legend',
            html: `
                <h3>Legend</h3>
                <ul>
                    <li><img src="images/empty.svg" alt="Empty"> Empty Seat</li>
                    <li><img src="images/selected.svg" alt="Selected"> Selected Seat</li>
                    <li><img src="images/male.svg" alt="Occupied Male"> Occupied (Male)</li>
                    <li><img src="images/female.svg" alt="Occupied Female"> Occupied (Female)</li>
                </ul>
            `
        });

        $legend.append($('<div>', {
            class: 'plane-property',
            html: `
                <h3>Aircraft Features</h3>
                <div class="features-icons">
                    <span title="WiFi"><i class="fas fa-wifi"></i></span>
                    <span title="Power Outlet"><i class="fas fa-plug"></i></span>
                    <span title="USB"><i class="fas fa-usb"></i></span>
                    <span title="Meal"><i class="fas fa-utensils"></i></span>
                </div>
            `
        }));

        const $columnLabels = $('<div>', { class: 'column-labels' });
        $columnLabels.append($('<div>', { class: 'row-letter-spacer' }));
        
        for (let col = 1; col <= 10; col++) {
            const $label = $('<div>', { 
                class: 'column-label',
                text: col
            });
            $columnLabels.append($label);
        }
        
        $seatMap.append($columnLabels);

        // Create rows (A, B, C, aisle, D, E, F)
        const rowLetters = ['A', 'B', 'C', 'aisle', 'D', 'E', 'F'];
        
        for (let rowIndex = 0; rowIndex < rowLetters.length; rowIndex++) {
            const rowLetter = rowLetters[rowIndex];
            const $seatRow = $(`<div class="seat-row"></div>`);
            
            const $rowLabel = rowLetter === 'aisle' 
                ? $(`<div class="aisle-label"></div>`)
                : $(`<div class="row-letter">${rowLetter}</div>`);
                
            $seatRow.append($rowLabel);
            
            if (rowLetter === 'aisle') {
                for (let col = 1; col <= 10; col++) {
                    const $aisle = $('<div>', { class: 'aisle' });
                    $seatRow.append($aisle);
                }
                $seatMap.append($seatRow);
                continue;
            }
            
            for (let col = 1; col <= 10; col++) {
                let letterIndex = rowIndex;
                if (letterIndex > 3) letterIndex--; // Skip aisle
                
                const seatNumber = col + (letterIndex * 10);
                
                if (seatNumber <= trip.totalSeats) {
                    const $seat = createSeatElement(seatNumber, trip.unavailableSeats);
                    $seatRow.append($seat);
                }
            }
            
            $seatMap.append($seatRow);
        }
        
        $seatDetails.append($seatMap);
        $seatMap.append($legend);
        $tripContainer.append($summary).append($seatDetails);
        $('#trip-list').append($tripContainer);

        const numericPrice = parseInt(trip.price.replace(' TL', ''));

        $summary.on('click', function() {
            const $icon = $(this).find('.toggle-icon');
            const isVisible = $seatDetails.is(':visible');
            
            if (!isVisible) {
                $('.seat-details').not($seatDetails).slideUp(300);
                $('.trip-summary .toggle-icon').not($icon).text('▼');
                
                $('.seat.selected').removeClass('selected');
                
                $('#selected-seats-list').html('<li>No seats selected yet.</li>');
                $('#confirm-button').prop('disabled', true);
                $('#total-price').text('0 TL');
                
                currentFlightPricePerSeat = numericPrice;
            }

            $seatDetails.slideToggle(300);
            $icon.text(isVisible ? '▼' : '▲');
            
            if (!isVisible) {
                $('#sidebar').fadeIn(300);
            }
        });
    });

    $(document).on('click', '.seat.available', function() {
        const seatNumber = $(this).find('span').text();
        
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
            
            $('#selected-seats-list li[data-seat="' + seatNumber + '"]').remove();
            
            if ($('#selected-seats-list li').length === 0) {
                $('#selected-seats-list').html('<li>No seats selected yet.</li>');
                $('#confirm-button').prop('disabled', true);
                $('#total-price').text('0 TL');
            } else {
                updateTotalPrice();
            }
        } else {
            $(this).addClass('selected');
            
            if ($('#selected-seats-list li').first().text() === 'No seats selected yet.') {
                $('#selected-seats-list').empty();
            }
            
            const seatClass = 'selected';
            const $listItem = $('<li>', {
                'data-seat': seatNumber,
                html: `<div class="sidebar-seat-icon ${seatClass}"><span>${seatNumber}</span></div> Seat ${seatNumber} - Adult`
            });
            
            $('#selected-seats-list').append($listItem);
            $('#confirm-button').prop('disabled', false);
            
            updateTotalPrice();
        }
    });

    function updateTotalPrice() {
        const seatCount = $('#selected-seats-list li').length;
        const totalPrice = seatCount * currentFlightPricePerSeat;
        $('#total-price').text(totalPrice + ' TL');
    }

    $('#confirm-button').on('click', function() {
        if (!$(this).prop('disabled')) {
            const selectedSeats = [];
            $('#selected-seats-list li').each(function() {
                const seatNumber = $(this).data('seat');
                if (seatNumber) {
                    selectedSeats.push(seatNumber);
                }
            });
            
            const totalPrice = $('#total-price').text();
            
            localStorage.setItem('selectedSeats', JSON.stringify(selectedSeats));
            localStorage.setItem('seatPrice', totalPrice);
            localStorage.setItem('pricePerSeat', currentFlightPricePerSeat.toString());
            
            window.location.href = '/additional-services/';
        }
    });

    function createSeatElement(seatNumber, unavailableSeats) {
        const $seat = $('<div>', {
            class: 'seat',
            html: `<span>${seatNumber}</span>`
        });
        
        const status = unavailableSeats[seatNumber];
        if (status) {
            $seat.addClass(status).addClass('unavailable');
        } else {
            $seat.addClass('available');
        }
        
        return $seat;
    }
});