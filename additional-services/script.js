$(document).ready(function() {
    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
    const seatPrice = localStorage.getItem('seatPrice');
    const pricePerSeat = parseInt(localStorage.getItem('pricePerSeat') || '350');

    if (!selectedSeats || !seatPrice) {
        alert('Please select seats first.');
        window.location.href = '/choose-seat/';
        return;
    }

    const $seatsList = $('#selected-seats-list');
    $seatsList.empty();

    selectedSeats.forEach(function(seat) {
        $seatsList.append(`
            <li>
                Seat ${seat} - <span class="seat-price">${pricePerSeat} TL</span>
            </li>
        `);
    });

    $('#seat-price').text(seatPrice);
    updateTotalPrice();

    const services = [
        {
            id: 1,
            title: 'Extra Baggage',
            description: 'Additional 15 kg baggage allowance',
            price: '150 TL'
        },
        {
            id: 2,
            title: 'Special Menu',
            description: 'Special menu selection during flight',
            price: '100 TL'
        },
        {
            id: 3,
            title: 'Fast Track',
            description: 'Fast track through security check',
            price: '75 TL'
        },
        {
            id: 4,
            title: 'Travel Insurance',
            description: 'Comprehensive travel insurance',
            price: '50 TL'
        },
        {
            id: 5,
            title: 'Wi-Fi Package',
            description: 'Unlimited internet access throughout the flight',
            price: '60 TL'
        }
    ];

    const $servicesList = $('.services-list');
    services.forEach(function(service) {
        const $serviceItem = $('<div>', {
            class: 'service-item',
            'data-id': service.id,
            'data-price': service.price,
            html: `
                <div class="service-info">
                    <div class="service-title">${service.title}</div>
                    <div class="service-description">${service.description}</div>
                </div>
                <div class="service-price">${service.price}</div>
                <div class="service-toggle">
                    <label>
                        <input type="checkbox" class="filled-in service-checkbox" data-id="${service.id}" />
                        <span>Add</span>
                    </label>
                </div>
            `
        });

        $servicesList.append($serviceItem);
    });

    $('.service-checkbox').on('change', function() {
        const serviceId = $(this).data('id');
        const isChecked = $(this).prop('checked');
        const service = services.find(s => s.id === serviceId);

        if (isChecked) {
            if ($('#selected-services-list li').first().text() === 'No services selected yet.') {
                $('#selected-services-list').empty();
            }
            $('#selected-services-list').append(`<li data-id="${serviceId}">${service.title} - ${service.price}</li>`);
        } else {
            $(`#selected-services-list li[data-id="${serviceId}"]`).remove();
            
            if ($('#selected-services-list li').length === 0) {
                $('#selected-services-list').html('<li>No services selected yet.</li>');
            }
        }

        updateServicePrice();
    });

    function updateServicePrice() {
        let total = 0;
        
        $('.service-checkbox:checked').each(function() {
            const serviceId = $(this).data('id');
            const service = services.find(s => s.id === serviceId);
            const price = parseInt(service.price.replace(' TL', ''));
            total += price;
        });
        
        $('#service-price').text(total + ' TL');
        updateTotalPrice();
    }

    function updateTotalPrice() {
        const seatPriceValue = parseInt(seatPrice.replace(' TL', ''));
        const servicePriceValue = parseInt($('#service-price').text().replace(' TL', '')) || 0;
        
        const totalPrice = seatPriceValue + servicePriceValue;
        $('#total-price').text(totalPrice + ' TL');
    }

    const seatCount = selectedSeats.length;
    const seatPriceInfo = `${seatCount} seats x ${pricePerSeat} TL = ${seatPrice}`;
    $('#seat-price-info').text(seatPriceInfo);

    $('#continue-button').on('click', function() {
        const selectedServices = [];
        $('#selected-services-list li').each(function() {
            const serviceId = $(this).data('id');
            if (serviceId) {
                const service = services.find(s => s.id === serviceId);
                selectedServices.push({
                    id: serviceId,
                    title: service.title,
                    price: service.price
                });
            }
        });
        
        const servicePrice = $('#service-price').text();
        const totalPrice = $('#total-price').text();
        
        localStorage.setItem('selectedServices', JSON.stringify(selectedServices));
        localStorage.setItem('servicePrice', servicePrice);
        localStorage.setItem('totalPrice', totalPrice);
        
        window.location.href = '/payment/';
    });
});