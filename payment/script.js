$(document).ready(function() {
    const tripDetails = JSON.parse(localStorage.getItem('tripDetails'));
    const selectedSeats = JSON.parse(localStorage.getItem('selectedSeats'));
    const selectedServices = JSON.parse(localStorage.getItem('selectedServices'));
    const seatPrice = localStorage.getItem('seatPrice');
    const servicePrice = localStorage.getItem('servicePrice');
    const totalPrice = localStorage.getItem('totalPrice');

    if (!tripDetails || !selectedSeats || !seatPrice || !totalPrice) {
        alert('Please select your tickets and services first.');
        window.location.href = '/mainPage.html'; 
        return;
    }

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

    $('#route').text(`${tripDetails.from} > ${tripDetails.to}`);
    $('#date').text(formatDate(tripDetails.date));

    const $seatsList = $('#selected-seats-list');
    $seatsList.empty();
    
    const pricePerSeat = parseInt(localStorage.getItem('pricePerSeat') || '350');

    selectedSeats.forEach(function(seat) {
        $seatsList.append(`
            <li>
                <div class="sidebar-seat-icon selected"><span>${seat}</span></div> 
                Seat ${seat} - <span class="seat-price">${pricePerSeat} TL</span>
            </li>
        `);
    });

    $('#seat-price').text(seatPrice);
    const $servicesList = $('#selected-services-list');
    
    if (selectedServices && selectedServices.length > 0) {
        $servicesList.empty();
        selectedServices.forEach(function(service) {
            $servicesList.append(`<li>${service.title} - ${service.price}</li>`);
        });
        $('#service-price').text(servicePrice);
    } else {
        $servicesList.html('<li>No services selected.</li>');
        $('#service-price').text('0 TL');
    }

    const originalPrice = parseInt(totalPrice.replace(' TL', ''));
    let discountedPrice = originalPrice;
    const discounts = [];

    if (tripDetails.from === 'Ankara') {
        const ankaraDiscount = Math.round(originalPrice * 0.2);
        discounts.push({
            name: 'Ankara Origin Discount (20%)',
            amount: ankaraDiscount
        });
        discountedPrice -= ankaraDiscount;
    }

    if (selectedSeats.length > 3) {
        const multiSeatDiscount = 200;
        discounts.push({
            name: 'Multi-seat Discount (>3 seats)',
            amount: multiSeatDiscount
        });
        discountedPrice -= multiSeatDiscount;
    }

    if (tripDetails.to === 'Adana') {
        const adanaDiscount = Math.round(originalPrice * 0.1);
        discounts.push({
            name: 'Adana Destination Discount (10%)',
            amount: adanaDiscount
        });
        discountedPrice -= adanaDiscount;
    }

    if (discounts.length > 0) {
        const $discountsList = $('#discounts-list');
        $discountsList.empty();
        
        discounts.forEach(function(discount) {
            $discountsList.append(`<li>${discount.name} - <span class="discount-amount">-${discount.amount} TL</span></li>`);
        });
        
        $('#discounts-section').show();
        $('#original-price').text(`${originalPrice} TL`);
        $('#total-price').text(`${discountedPrice} TL`);
        
        localStorage.setItem('discountedPrice', discountedPrice + ' TL');
    } else {
        $('#discounts-section').hide();
        $('#total-price').text(totalPrice);
    }

    function validateForm() {
        const fullname = $('#fullname').val();
        const email = $('#email').val();
        const phone = $('#phone').val();
        const tcno = $('#tcno').val();
        const cardname = $('#cardname').val();
        const cardnumber = $('#cardnumber').val();
        const expiry = $('#expiry').val();
        const cvv = $('#cvv').val();
        const terms = $('#terms').prop('checked');

        return (
            fullname && 
            email && 
            phone && 
            tcno && 
            cardname && 
            cardnumber && 
            expiry && 
            cvv && 
            terms
        );
    }

    $('input').on('input change', function() {
        $('#pay-button').prop('disabled', !validateForm());
    });

    $('#pay-button').on('click', function(e) {
        e.preventDefault();

        if (validateForm()) {
            const fullname = $('#fullname').val();
            const route = $('#route').text();
            const date = $('#date').text();
            const totalPrice = $('#total-price').text();
            
            const newTicket = {
                fullName: fullname,
                route: route,
                date: date,
                totalPrice: totalPrice,
                purchaseDate: new Date().toISOString(),
                seats: localStorage.getItem("selectedSeats").replace("[", "").replace("]","")
            };
            
            let purchasedTickets = JSON.parse(localStorage.getItem('purchasedTickets')) || [];
            
            purchasedTickets.push(newTicket);
            
            localStorage.setItem('purchasedTickets', JSON.stringify(purchasedTickets));
            
            $('#success-modal').css('display', 'flex');
        }
    });

    $('#go-to-home').on('click', function() {
        window.location.href = '/mainPage.html';
    });
});