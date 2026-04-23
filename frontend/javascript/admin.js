import { getAdmin } from "./locale.js";
import { initI18n, generateToast, errorPageGenerator } from "./toolbox.js";

$(async function () {

    let language;
    try {
        language = await initI18n("admin");
        let getadmin = await getAdmin(language);
        await adminCheck(language, getadmin);

    } catch (error) {
        let $frame = $("#frame");
        $frame.html("");
        console.error(error);
        errorPageGenerator($frame, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }

});

// --- HTTP segédfüggvények ---

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        let message = data.error; //= `Szerverhiba (${response.status})`;
        /*if (data.error) {
            message = data.error;
        }
        if (data.message) {
            message = data.message;
        }*/
        generateToast(message, "danger");
        throw new Error(message);
    }
    return data;
}

async function adminCheck(language, i18n_values) {
    //try {
        const response = await fetch('/api/AdminCheck', { method: 'GET' });
        let data = {};

        data = await response.json();
        if (!response.ok || !data.admin) {
            window.location.href = '/' + language;
        } else {
            wireModeSwitch(language, i18n_values);
            wireUserSelection(language, i18n_values);
            wireUserSearch(i18n_values);
            wireFlightSelection(language, i18n_values);
            wireAdminFlightActions(language, i18n_values);
            await switchAdminMode('users', language, i18n_values);
        }
    /*} catch (error) {
        console.error(error.message);
        renderReservationError('Nem sikerült betölteni az admin adatokat.');
    }*/
}

// --- API hívások ---

async function getUsers() {
    return requestJson('/api/AdminGetUsers', { method: 'GET' });
}

async function searchUsers(email) {
    return requestJson(`/api/AdminSearchUsers?email=${email}`, { method: 'GET' });
}

async function getUserFlights(userId, language) {
    return requestJson(`/api/AdminGetUserFlights?userID=${userId}`, { method: 'GET', headers: { "Accept-Language": language } });
}

async function getUserFlightSeats(userId, flightId, language) {
    return requestJson(`/api/AdminGetUserFlightSeats?userID=${userId}&flightID=${flightId}`, { method: 'GET', headers: {"Accept-Language": language} });
}

async function getAdminFlights(language) {
    return requestJson('/api/AdminGetFlights', { method: 'GET', headers: { "Accept-Language": language }});
}

async function getAdminFlightCreateContext(language) {
    return requestJson('/api/AdminGetFlightCreateContext', { method: 'GET', headers: { "Accept-Language": language } });
}

async function cancelAdminFlight(flightId, language) {
    return requestJson('/api/AdminCancelFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Accept-Language": language },
        body: JSON.stringify({ flightID: flightId })
    });
}

async function createAdminFlight(payload, language) {
    return requestJson('/api/AdminCreateFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', "Accept-Language": language },
        body: JSON.stringify(payload)
    });
}

// --- Mód váltás ---

function wireModeSwitch(language, i18n_values) {
    $('.admin-mode-btn').off('click').on('click', function () {
        handleModeSwitchClick($(this), language, i18n_values)
    });
}

async function handleModeSwitchClick($this, language, i18n_values) {
    const mode = $this.attr('data-admin-mode');
    await switchAdminMode(mode, language, i18n_values);
}

async function switchAdminMode(mode, language, i18n_values) {
    if (mode === 'users' || mode === 'flights') {
        renderModePanels(mode);
        if (mode === 'users') {
            const searchEmail = $('#user_email_search').val().trim();
            await loadUsers(searchEmail, i18n_values);
            renderIdleReservationsState(i18n_values);
            renderSelectedUserInfo("",i18n_values);
        } else {
            await loadAdminFlightsMode(language, i18n_values);
        }
    }
}

function renderModePanels(mode) {
    const isUsers = mode === 'users';
    $('#mode_users').toggleClass('active', isUsers);
    $('#mode_flights').toggleClass('active', !isUsers);
    $('#admin_mode_users').toggleClass('d-none', !isUsers);
    $('#admin_mode_flights').toggleClass('d-none', isUsers);
}

// --- Felhasználók ---

async function loadUsers(searchEmail, i18n_values) {
    let usersResponse;
    if (searchEmail === '') {
        usersResponse = await getUsers();
    } else {
        usersResponse = await searchUsers(searchEmail);
    }
    let users = [];
    if (Array.isArray(usersResponse.adat)) {
        users = usersResponse.adat;
    }
    renderUsersTable(users, i18n_values);
}

function wireUserSearch(i18n_values) {
    $('#user_email_search').off('input').on('input', function () {
        handleUserSearchInput(i18n_values);
    });
    $('#user_email_search_clear').off('click').on('click', async function () {
        await handleUserSearchClear(i18n_values);
    });
}

function handleUserSearchInput(i18n_values) {
    let $user_email_search = $('#user_email_search');
    const searchEmail = $user_email_search.val().trim();
    clearTimeout($user_email_search.data('searchTimeout'));
    $user_email_search.data('searchTimeout', setTimeout(() => handleUserSearch(searchEmail, i18n_values), 250));
}

async function handleUserSearchClear(i18n_values) {
    const $input = $('#user_email_search');
    clearTimeout($input.data('searchTimeout'));
    $input.val('');
    await handleUserSearch('', i18n_values);
}

async function handleUserSearch(searchEmail, i18n_values) {
    try {
        await loadUsers(searchEmail, i18n_values);
        $('#tabla tbody tr.user-row').removeClass('selected-user');
        renderSelectedUserInfo("", i18n_values);
        renderIdleReservationsState(i18n_values);
    } catch (error) {
        renderReservationError(error.message);
    }
}

function renderUsersTable(users, i18n_values) {
    const headers = [i18n_values.tabel.users.header.name, i18n_values.tabel.users.header.email, i18n_values.tabel.users.header.bookings, i18n_values.tabel.users.header.rank, i18n_values.tabel.users.header.created_at];
    const $table = $('#tabla');
    $table.empty();

    const $headRow = $('<tr></tr>');
    for (const header of headers) {
        $headRow.append($('<th></th>', { text: header }));
    }
    $table.append($('<thead></thead>').append($headRow));

    const $tbody = $('<tbody></tbody>');
    if (users.length == 0) {
        $tbody.append(
            $('<tr></tr>').append(
                $('<td></td>', { colspan: headers.length, text: i18n_values.tabel.users.body.no_users })
            )
        );
    } else {
        for (const user of users) {
            const userId = Number.parseInt(user.UserID, 10);
            let userIdValue = '';
            if (Number.isInteger(userId)) {
                userIdValue = userId;
            }
            const $row = $('<tr></tr>', {
                class: 'user-row',
                'data-user-id': userIdValue,
                'data-user-name': user.UserName,
                'data-user-email': user.UserEmail
            });
            $row.append($('<td></td>', { text: user.UserName, 'data-label': headers[0] }));
            $row.append($('<td></td>', { text: user.UserEmail, 'data-label': headers[1] }));
            $row.append($('<td></td>', { text: user.NumberOfFlights, 'data-label': headers[2] }));
            $row.append($('<td></td>', { text: user.LoyaltyStatusName, 'data-label': headers[3] }));
            $row.append($('<td></td>', { text: formatDateTime(user.CreatedAt), 'data-label': headers[4] }));
            $tbody.append($row);
        }
    }
    $table.append($tbody);
}

function wireUserSelection(language, i18n_values) {
    $('#tabla').off('click', 'tbody tr.user-row').on('click', 'tbody tr.user-row', function () {
        handleUserRowClick($(this), language, i18n_values)
    });
}

async function handleUserRowClick($this, language, i18n_values) {
    const $row = $this;
    const userId = Number.parseInt($row.attr('data-user-id'), 10);
    try {
        if (!Number.isInteger(userId) || userId <= 0) {
            let message = i18n_values.error.wrong_userid;
            generateToast(message, "danger")
            throw new Error(message);
        }
        $('#tabla tbody tr.user-row').removeClass('selected-user');
        $row.addClass('selected-user');
        renderSelectedUserInfo($row, i18n_values);
        renderLoadingFlightsState(i18n_values);
        const flightsResponse = await getUserFlights(userId, language);
        let flights = [];
        if (Array.isArray(flightsResponse.adat)) {
            flights = flightsResponse.adat;
        }
        renderFlightsTable(flights, userId, i18n_values);
    } catch (error) {
        renderReservationError(error.message);
    }
}

function renderSelectedUserInfo($row, i18n_values) {
    if ($row == "") {
        $('#selected_user_info').text(i18n_values.caption.select_user_from_tabel);
    } else {
        const userName = $row.attr('data-user-name');
        const userEmail = $row.attr('data-user-email');
        $('#selected_user_info').text(`${userName} | ${userEmail}`);
    }
}

function renderIdleReservationsState(i18n_values) {
    $('#reservation_area').html(`<div class="empty-state">${i18n_values.caption.select_line_to_see_bookings}</div>`);
}

function renderEmptyReservationsState(i18n_values) {
    $('#reservation_area').html(`<div class="empty-state">${i18n_values.caption.no_bookings_of_user}</div>`);
}

function renderLoadingFlightsState(i18n_values) {
    $('#reservation_area').html(`<div class="loading-state">${i18n_values.caption.loading_flights}</div>`);
}

function renderReservationError(message) {
    $('#reservation_area').empty().append(
        $('<div></div>', { class: 'error-state', text: message })
    );
}

// --- Foglalások táblázat ---

function renderFlightsTable(flights, userId, i18n_values) {
    let validFlights = [];
    if (Array.isArray(flights)) {
        validFlights = flights.filter(f => {
            const id = Number.parseInt(f.FlightID, 10);
            return Number.isInteger(id) && id > 0;
        });
    }

    if (!validFlights.length) {
        renderEmptyReservationsState(i18n_values);
    } else {
        const headers = [i18n_values.tabel.users.header.flight, i18n_values.tabel.users.header.origin_departure, i18n_values.tabel.users.header.bookings, i18n_values.tabel.users.header.sum_price, i18n_values.tabel.users.header.status, i18n_values.tabel.users.header.open];
        const $table = $('<table></table>', { class: 'table reservation-table mb-0' });
        const $headRow = $('<tr></tr>');
        for (const header of headers) {
            $headRow.append($('<th></th>', { text: header }));
        }
        $table.append($('<thead></thead>').append($headRow));

        const $tbody = $('<tbody></tbody>');
        for (const flight of validFlights) {
            const flightId = Number.parseInt(flight.FlightID, 10);
            const cancelledCount = flight.CancelledReservationCount;
            const activeCount = flight.ActiveReservationCount;
            const reservationCount = flight.ReservationCount;

            const routeLabel = `${flight.DepartureAirport} (${flight.DepartureCity}) → ${flight.ArrivalAirport} (${flight.ArrivalCity})`;
            const timeLabel = `${formatDateTime(flight.DepartureDateTime)} – ${formatDateTime(flight.ArrivalDateTime)}`;
            const countLabel = `${i18n_values.tabel.users.body.quantity} : ${reservationCount} (${i18n_values.tabel.users.body.status.active}: ${activeCount}, ${i18n_values.tabel.users.body.status.cancelled}: ${cancelledCount})`;
            const status = getFlightStatus(flight, activeCount, cancelledCount, reservationCount, i18n_values);

            const $groupRow = $('<tr></tr>', {
                class: 'flight-group-row',
                'data-user-id': userId,
                'data-flight-id': flightId,
            });
            $groupRow.append($('<td></td>', { text: routeLabel, 'data-label': headers[0] }));
            $groupRow.append($('<td></td>', { text: timeLabel, 'data-label': headers[1] }));
            $groupRow.append($('<td></td>', { text: countLabel, class: 'flight-summary', 'data-label': headers[2] }));
            $groupRow.append($('<td></td>', { text: formatPrice(flight.TotalPrice, i18n_values), 'data-label': headers[3] }));
            $groupRow.append(
                $('<td></td>', { 'data-label': headers[4] }).append(
                    $('<span></span>', { class: `status-badge ${status.className}`, text: status.label })
                )
            );
            $groupRow.append(
                $('<td></td>', { 'data-label': headers[5] }).append(
                    $('<span></span>', { class: 'toggle-indicator', text: '+' })
                )
            );

            const $detailCell = $('<td></td>', { colspan: headers.length }).append(
                $('<div></div>', { class: 'empty-state', text: i18n_values.caption.click_on_flight_to_see_details })
            );
            const $detailRow = $('<tr></tr>', {
                class: 'flight-detail-row d-none',
                'data-user-id': userId,
                'data-flight-id': flightId
            }).append($detailCell);

            $tbody.append($groupRow, $detailRow);
        }

        $table.append($tbody);
        $('#reservation_area').html($table);
    }
}

function wireFlightSelection(language, i18n_values) {
    $('#reservation_area')
        .off('click', '.flight-group-row')
        .on('click', '.flight-group-row', async function () {
            await handleFlightToggle($(this), language, i18n_values)
        });
}

async function handleFlightToggle($this, language, i18n_values) {
    let $row = $this;
    const userId = Number.parseInt($row.attr('data-user-id'), 10);
    const flightId = Number.parseInt($row.attr('data-flight-id'), 10);
    const $detailRow = $(`#reservation_area .flight-detail-row[data-user-id="${userId}"][data-flight-id="${flightId}"]`);
    const isValid = Number.isInteger(userId) && Number.isInteger(flightId) && $detailRow.length > 0;
    if (isValid) {
        if ($row.hasClass('expanded')) {
            collapseFlightRow($row, $detailRow);
        } else {
            await expandFlightRow($row, $detailRow, userId, flightId, language, i18n_values);
        }
    }
}

function collapseFlightRow($row, $detailRow) {
    $row.removeClass('expanded');
    $row.find('.toggle-indicator').text('+');
    $detailRow.addClass('d-none');
}

async function expandFlightRow($row, $detailRow, userId, flightId, language, i18n_values) {
    $row.addClass('expanded');
    $row.find('.toggle-indicator').text('-');
    $detailRow.removeClass('d-none');

    const $detailCell = $detailRow.find('td').first();
    $detailCell.html(`<div class="loading-state loading-inline">${i18n_values.caption.loading_seats_details}</div>`);

    try {
        const seatsResponse = await getUserFlightSeats(userId, flightId, language);
        let seats = [];
        if (Array.isArray(seatsResponse.adat)) {
            seats = seatsResponse.adat;
        }
        $detailCell.empty().append(renderSeatsTable(seats, i18n_values));
    } catch (error) {
        console.error(error.message);
        $detailCell.empty().append(
            $('<div></div>', { class: 'error-state', text: error.message })
        );
    }
}

function getFlightStatus(flight, activeCount, cancelledCount, reservationCount, i18n_values) {
    let groupStatusRaw = '';
    if (flight.GroupStatus) {
        groupStatusRaw = String(flight.GroupStatus);
    }
    const groupStatus = groupStatusRaw.toLowerCase();
    const flightCancelled = toBool(flight.FlightIsCancelled);
    const cancelled = Number.parseInt(cancelledCount, 10);
    const active = Number.parseInt(activeCount, 10);
    const total = Number.parseInt(reservationCount, 10);

    let result = { label: i18n_values.tabel.flights.body.status.mixed, className: 'status-mixed' };
    if (flightCancelled) {
        result = { label: i18n_values.tabel.flights.body.status.flight_deleted, className: 'status-flight-cancelled' };
    } else {
        if (groupStatus === 'torolt' || (total > 0 && cancelled === total)) {
            result = { label: i18n_values.tabel.flights.body.status.cancelled, className: 'status-cancelled' };
        } else {
            if (groupStatus === 'aktiv' || active === total) {
                result = { label: i18n_values.tabel.flights.body.status.active, className: 'status-active' };
            }
        }
    }
    return result;
}

function renderSeatsTable(seats, i18n_values) {
    let result;
    if (!Array.isArray(seats) || !seats.length) {
        result = $('<div></div>', { class: 'empty-state', text: i18n_values.caption.no_bookings_for_flight });
    } else {
        const headers = [i18n_values.tabel.users.header.seat, i18n_values.tabel.users.header.fare_class, i18n_values.tabel.users.header.price, i18n_values.tabel.users.header.status, i18n_values.tabel.users.header.passenger_type, i18n_values.tabel.users.header.flight];
        const $table = $('<table></table>', { class: 'table seat-table mb-0' });
        const $headRow = $('<tr></tr>');
        for (const header of headers) {
            $headRow.append($('<th></th>', { text: header }));
        }
        $table.append($('<thead></thead>').append($headRow));

        const $tbody = $('<tbody></tbody>');
        for (const seat of seats) {
            const cancelled = toBool(seat.IsCancelled);
            const flightCancelled = toBool(seat.FlightIsCancelled);
            const adult = toBool(seat.IsAdult);

            let fareClassName = '-';
            if (seat.FareClassName) {
                fareClassName = seat.FareClassName;
            }

            const $row = $('<tr></tr>');
            if (cancelled) {
                $row.addClass('seat-cancelled');
            }
            $row.append($('<td></td>', { text: `${seat.RowID}${seat.ColumnID}`, 'data-label': headers[0] }));
            $row.append($('<td></td>', { text: fareClassName, 'data-label': headers[1] }));
            $row.append($('<td></td>', { text: formatPrice(seat.Price, i18n_values), 'data-label': headers[2] }));

            let statusClass = 'status-active';
            let statusText = i18n_values.tabel.users.body.status.active;
            if (cancelled) {
                statusClass = 'status-cancelled';
                statusText = i18n_values.tabel.users.body.status.cancelled;
            }
            $row.append(
                $('<td></td>', { 'data-label': headers[3] }).append(
                    $('<span></span>', { class: `status-badge ${statusClass}`, text: statusText })
                )
            );

            let passengerType = i18n_values.tabel.users.body.passenger_type.child;
            if (adult) {
                passengerType = i18n_values.tabel.users.body.passenger_type.adult;
            }
            $row.append(
                $('<td></td>', { 'data-label': headers[4] }).append(
                    $('<span></span>', { class: 'type-badge', text: passengerType })
                )
            );

            let flightStatusClass = 'status-active-light';
            let flightStatusText = i18n_values.tabel.users.body.status.active;
            if (flightCancelled) {
                flightStatusClass = 'status-flight-cancelled';
                flightStatusText = i18n_values.tabel.users.body.status.flight_deleted;
            }
            $row.append(
                $('<td></td>', { 'data-label': headers[5] }).append(
                    $('<span></span>', { class: `status-badge ${flightStatusClass}`, text: flightStatusText })
                )
            );
            $tbody.append($row);
        }

        $table.append($tbody);
        result = $('<div></div>', { class: 'seats-table-wrapper' }).append($table);
    }
    return result;
}

// --- Járatkezelő ---

function wireAdminFlightActions(language, i18n_values) {
    $('#refresh_admin_flights').off('click').on('click', async function () {
        await handleRefreshAdminFlights(language, i18n_values)
    });
    $('#admin_flights_table').off('click', '.cancel-flight-btn').on('click', '.cancel-flight-btn', async function () {
        await handleCancelFlightClick($(this), language, i18n_values);
    });
    $('#create_aircraft_id').off('change').on('change', function () {
        applyAircraftConstraint(i18n_values);
    });
    $('#create_departure_datetime').off('change').on('change', handleDepartureDateTimeChange);
    $('#create_flight_reset').off('click').on('click', resetCreateFlightForm);
    $('#create_flight_form').off('submit').on('submit', function () {
        handleCreateFlightSubmit(event, language, i18n_values);
    });
}

async function handleRefreshAdminFlights(language, i18n_values) {
    const currentMode = $('.admin-mode-btn.active').attr('data-admin-mode');
    if (currentMode === 'flights') {
        await loadAdminFlightsMode(language, i18n_values);
    }
}

async function handleCancelFlightClick($this, language, i18n_values) {
    const flightId = Number.parseInt($this.attr('data-flight-id'), 10);
    const isValidFlight = Number.isInteger(flightId) && flightId > 0;
    const confirmed = isValidFlight && window.confirm(i18n_values.caption.want_to_delete_flight_question);
    if (confirmed) {
        try {
            const result = await cancelAdminFlight(flightId, language);
            await loadAdminFlightsMode(language, i18n_values);
            let successMessage = result.message;

            renderAdminFeedback('#admin_flights_feedback', successMessage, 'success');
        } catch (error) {
            renderAdminFeedback('#admin_flights_feedback', error.message, 'error');
        }
    }
}

async function loadAdminFlightsMode(language, i18n_values) {
    renderAdminFlightsTableLoading(i18n_values);
    renderAdminFeedback('#admin_flights_feedback');
    renderAdminFeedback('#create_flight_feedback');

    try {
        const [flightsResponse, createContextResponse] = await Promise.all([
            getAdminFlights(language),
            getAdminFlightCreateContext(language)
        ]);

        let flights = [];
        if (Array.isArray(flightsResponse.adat)) {
            flights = flightsResponse.adat;
        }
        renderAdminFlightsManagementTable(flights, i18n_values);

        let createContext = {};
        if (createContextResponse.adat) {
            createContext = createContextResponse.adat;
        }
        let airports = [];
        if (Array.isArray(createContext.airports)) {
            airports = createContext.airports;
        }
        let aircraft = [];
        if (Array.isArray(createContext.aircraft)) {
            aircraft = createContext.aircraft;
        }
        populateCreateFlightOptions(airports, aircraft, i18n_values);
        resetCreateFlightForm();
    } catch (error) {
        $('#admin_flights_table').html(`<div class="error-state">${i18n_values.error.loading_flight_control}</div>`);
        renderAdminFeedback('#admin_flights_feedback', error.message, 'error');
    }
}

function renderAdminFlightsTableLoading(i18n_values) {
    $('#admin_flights_table').html(`<div class="loading-state">${i18n_values.caption.loading_flights}</div>`);
}

function renderAdminFlightsManagementTable(validFlights, i18n_values) {
    if (!validFlights.length) {
        $('#admin_flights_table').html(`<div class="empty-state">${i18n_values.caption.loading_flights}</div>`);
    } else {
        const headers = [i18n_values.tabel.flights.header.id, i18n_values.tabel.flights.header.aircraft, i18n_values.tabel.flights.header.route, i18n_values.tabel.flights.header.departure, i18n_values.tabel.flights.header.arrival, i18n_values.tabel.flights.header.base_price, i18n_values.tabel.flights.header.bookings, i18n_values.tabel.flights.header.status, i18n_values.tabel.flights.header.action];
        const $table = $('<table></table>', { class: 'table reservation-table mb-0' });
        const $headRow = $('<tr></tr>');
        for (const header of headers) {
            $headRow.append($('<th></th>', { text: header }));
        }
        $table.append($('<thead></thead>').append($headRow));

        const $tbody = $('<tbody></tbody>');
        for (const flight of validFlights) {
            const flightId = Number.parseInt(flight.FlightID, 10);
            const isCancelled = toBool(flight.IsCancelled);

            const rawReservationCount = Number.parseInt(flight.ReservationCount, 10);
            let reservationCount = 0;
            if (!Number.isNaN(rawReservationCount)) {
                reservationCount = rawReservationCount;
            }

            const rawActiveCount = Number.parseInt(flight.ActiveReservationCount, 10);
            let activeReservationCount = 0;
            if (!Number.isNaN(rawActiveCount)) {
                activeReservationCount = rawActiveCount;
            }

            let aircraftText = `#${flight.AircraftID}`;
            if (flight.AircraftModelName) {
                aircraftText = `#${flight.AircraftID} - ${flight.AircraftModelName}`;
            }

            let statusLabel = i18n_values.tabel.flights.body.status.active;
            let statusClass = 'status-active';
            if (isCancelled) {
                statusLabel = i18n_values.tabel.flights.body.status.cancelled;
                statusClass = 'status-flight-cancelled';
            }

            let cancelButtonText = i18n_values.button.delete_flight;
            if (isCancelled) {
                cancelButtonText = i18n_values.button.deleted_already;
            }

            const routeText = `${flight.DepartureAirport} (${flight.DepartureCity}) → ${flight.ArrivalAirport} (${flight.ArrivalCity})`;

            const $row = $('<tr></tr>');
            $row.append($('<td></td>', { text: flightId, 'data-label': headers[0] }));
            $row.append($('<td></td>', { text: aircraftText, 'data-label': headers[1] }));
            $row.append($('<td></td>', { text: routeText, 'data-label': headers[2] }));
            $row.append($('<td></td>', { text: formatDateTime(flight.DepartureDateTime), 'data-label': headers[3] }));
            $row.append($('<td></td>', { text: formatDateTime(flight.ArrivalDateTime), 'data-label': headers[4] }));
            $row.append($('<td></td>', { text: formatPrice(flight.BasePriceInHUF, i18n_values), 'data-label': headers[5] }));
            $row.append($('<td></td>', { text: `${i18n_values.tabel.users.body.quantity}: ${reservationCount} (${i18n_values.tabel.flights.body.status.active}: ${activeReservationCount})`, 'data-label': headers[6] }));
            $row.append(
                $('<td></td>', { 'data-label': headers[7] }).append(
                    $('<span></span>', { class: `status-badge ${statusClass}`, text: statusLabel })
                )
            );
            $row.append(
                $('<td></td>', { 'data-label': headers[8] }).append(
                    $('<button></button>', {
                        type: 'button',
                        class: 'btn btn-sm btn-outline-danger admin-action-btn cancel-flight-btn',
                        'data-flight-id': flightId,
                        text: cancelButtonText,
                        disabled: isCancelled
                    })
                )
            );
            $tbody.append($row);
        }

        $table.append($tbody);
        $('#admin_flights_table').html($table);
    }
}

function populateCreateFlightOptions(airports, aircraft, i18n_values) {
    const $aircraftSelect = $('#create_aircraft_id');
    $aircraftSelect.empty().append($('<option></option>', { value: '', text: i18n_values.caption.choose_aircraft }));
    for (const row of aircraft) {
        const $option = $('<option></option>', {
            value: row.AircraftID,
            text: `#${row.AircraftID} - ${row.AircraftModelName}`
        });
        if (row.LastArrivalAirport) {
            $option.attr('data-last-arrival-airport', row.LastArrivalAirport);
        }
        if (row.LastArrivalDateTime) {
            $option.attr('data-last-arrival-datetime', row.LastArrivalDateTime);
        }
        $aircraftSelect.append($option);
    }

    const $departureSelect = $('#create_departure_airport');
    const $arrivalSelect = $('#create_arrival_airport');
    $departureSelect.empty().append($('<option></option>', { value: '', text: i18n_values.caption.choose_origin_airport }));
    $arrivalSelect.empty().append($('<option></option>', { value: '', text: i18n_values.caption.choose_destination_airport }));

    for (const airport of airports) {
        const optionText = `${airport.AirportCode} - ${airport.City} (${airport.Country})`;
        $departureSelect.append($('<option></option>', { value: airport.AirportCode, text: optionText }));
        $arrivalSelect.append($('<option></option>', { value: airport.AirportCode, text: optionText }));
    }
}

function resetCreateFlightForm() {
    const $form = $('#create_flight_form');
    if ($form.length) {
        $form[0].reset();
    }
    $('#create_arrival_datetime').prop('disabled', true).val('');
    $('#create_departure_airport').prop('disabled', false);
    $('#create_departure_datetime').attr('min', '');
    $('#create_aircraft_hint').text('');
    renderAdminFeedback('#create_flight_feedback');
}

function handleDepartureDateTimeChange() {
    const $departure = $('#create_departure_datetime');
    const $arrival = $('#create_arrival_datetime');
    const departureValue = $departure.val();
    if (departureValue) {
        $arrival.prop('disabled', false).attr('min', departureValue);
        const currentArrival = $arrival.val();
        if (currentArrival && currentArrival <= departureValue) {
            $arrival.val('');
        }
    } else {
        $arrival.prop('disabled', true).attr('min', '').val('');
    }
}

function getSelectedAircraftContext() {
    const $option = $('#create_aircraft_id option:selected');
    const aircraftId = Number.parseInt($option.val(), 10);
    let result = null;
    if (Number.isInteger(aircraftId) && aircraftId > 0) {
        result = {
            AircraftID: aircraftId,
            LastArrivalAirport: $option.attr('data-last-arrival-airport'),
            LastArrivalDateTime: $option.attr('data-last-arrival-datetime')
        };
    }
    return result;
}

function applyAircraftConstraint(i18n_values) {
    const selectedAircraft = getSelectedAircraftContext();
    const $departureAirport = $('#create_departure_airport');
    const $departureDateTime = $('#create_departure_datetime');
    const $hint = $('#create_aircraft_hint');

    if (!selectedAircraft) {
        $departureAirport.prop('disabled', false);
        $departureDateTime.attr('min', '');
        $hint.text('');
    } else {
        if (selectedAircraft.LastArrivalAirport) {
            const requiredAirport = String(selectedAircraft.LastArrivalAirport).toUpperCase();
            const lastArrivalValue = toLocalDateTimeInputValue(selectedAircraft.LastArrivalDateTime);
            const minDepartureValue = addMinutesToInputValue(lastArrivalValue, 30);

            $departureAirport.val(requiredAirport).prop('disabled', true);
            $departureDateTime.attr('min', minDepartureValue);

            const currentDeparture = $departureDateTime.val();
            if (!currentDeparture || new Date(currentDeparture) < new Date(minDepartureValue)) {
                $departureDateTime.val(minDepartureValue);
            }
            $hint.text(`${i18n_values.caption.last_know_arrival_of_aircraft} ${requiredAirport}, ${formatDateTime(selectedAircraft.LastArrivalDateTime)}. ${i18n_values.caption.new_take_off_restriction}`);
        } else {
            $departureAirport.prop('disabled', false);
            $departureDateTime.attr('min', '');
            $hint.text(i18n_values.caption.selected_aircraft_has_no_previous_flights);
        }
    }
    $departureDateTime.trigger('change');
}

// --- Járat létrehozás validáció ---

function validateCreateFlightForm(aircraftID, departureAirport, arrivalAirport, departureDate, arrivalDate, basePriceInHUF, i18n_values) {
    let error = null;
    if (!Number.isInteger(aircraftID) || aircraftID <= 0) {
        error = i18n_values.error.choose_valid_aircraft;
    } else if (!departureAirport || !arrivalAirport) {
        error = i18n_values.error.choose_origin_and_destination_airport;
    } else if (departureAirport == arrivalAirport) {
        error = i18n_values.error.origin_equals_destination;
    } else if (Number.isNaN(departureDate.getTime()) || Number.isNaN(arrivalDate.getTime())) {
        error = i18n_values.error.choose_valid_dates;
    } else if (arrivalDate <= departureDate) {
        error = i18n_values.error.new_departure_before_old_departure;
    } else if (!Number.isInteger(basePriceInHUF) || basePriceInHUF <= 0) {
        error = i18n_values.error.base_price_must_be_positive_integer;
    }
    return error;
}

function validateAircraftConstraint(selectedAircraft, departureAirport, departureDate, i18n_values) {
    let error = null;
    if (selectedAircraft && selectedAircraft.LastArrivalAirport) {
        const lastKnownAirport = String(selectedAircraft.LastArrivalAirport).toUpperCase();
        if (departureAirport != lastKnownAirport) {
            error = `${i18n_values.error.aircraft_must_take_off_here}: ${lastKnownAirport}.`;
        } else {
            const lastArrivalDate = new Date(selectedAircraft.LastArrivalDateTime);
            if (!Number.isNaN(lastArrivalDate.getTime())) {
                const minDepartureDate = new Date(lastArrivalDate.getTime() + 30 * 60 * 1000);
                if (departureDate < minDepartureDate) {
                    error = i18n_values.error.new_take_off_just_after_previous_take_off;
                }
            }
        }
    }
    return error;
}

async function handleCreateFlightSubmit(event, language, i18n_values) {
    event.preventDefault();
    renderAdminFeedback('#create_flight_feedback');

    const aircraftID = Number.parseInt($('#create_aircraft_id').val(), 10);
    const departureAirport = $('#create_departure_airport').val().trim().toUpperCase();
    const arrivalAirport = $('#create_arrival_airport').val().trim().toUpperCase();
    const departureDateTime = $('#create_departure_datetime').val();
    const arrivalDateTime = $('#create_arrival_datetime').val();
    const basePriceInHUF = Number.parseInt($('#create_base_price').val(), 10);
    const departureDate = new Date(departureDateTime);
    const arrivalDate = new Date(arrivalDateTime);
    const selectedAircraft = getSelectedAircraftContext();

    let validationError = validateCreateFlightForm(aircraftID, departureAirport, arrivalAirport, departureDate, arrivalDate, basePriceInHUF, i18n_values);
    if (validationError === null) {
        validationError = validateAircraftConstraint(selectedAircraft, departureAirport, departureDate, i18n_values);
    }

    if (validationError) {
        renderAdminFeedback('#create_flight_feedback', validationError, 'error');
    } else {
        const $submitButton = $('#create_flight_form button[type="submit"]');
        $submitButton.prop('disabled', true);
        try {
            const result = await createAdminFlight({
                aircraftID,
                departureAirport,
                arrivalAirport,
                departureDateTime,
                arrivalDateTime,
                basePriceInHUF
            }, language);
            await loadAdminFlightsMode(language, i18n_values);
            let successMessage = result.message;

            renderAdminFeedback('#create_flight_feedback', successMessage, 'success');
        } catch (error) {
            console.error(error.message);
            renderAdminFeedback('#create_flight_feedback', error.message, 'error');
        } finally {
            $submitButton.prop('disabled', false);
        }
    }
}

// --- Segédfüggvények ---

function renderAdminFeedback(selector, message, type) {
    const $target = $(selector);
    $target.removeClass('admin-feedback is-info is-success is-error d-none');
    if (message) {
        let feedbackType = 'is-info';
        if (type === 'success') {
            feedbackType = 'is-success';
        } else if (type === 'error') {
            feedbackType = 'is-error';
        }
        $target.addClass(`admin-feedback ${feedbackType}`).text(message);
    } else {
        $target.empty().addClass('d-none');
    }
}

function toBool(value) {
    return value === true || value === 1 || value === '1';
}

function formatDateTime(value) {
    let result = '';
    if (value) {
        const parsedDate = new Date(value);
        if (Number.isNaN(parsedDate.getTime())) {
            result = String(value);
        } else {
            result = parsedDate.toLocaleString('hu-HU', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }
    return result;
}

function formatPrice(value, i18n_values) {
    const numericValue = Number(value);
    let result = '';
    if (!Number.isNaN(numericValue)) {
        result = `${new Intl.NumberFormat('hu-HU').format(numericValue)} ${i18n_values.currency}`;
    }
    return result;
}

function toLocalDateTimeInputValue(value) {
    let parsedDate;
    if (value instanceof Date) {
        parsedDate = value;
    } else {
        parsedDate = new Date(value);
    }
    let result = '';
    if (!Number.isNaN(parsedDate.getTime())) {
        const pad = n => String(n).padStart(2, '0');
        result = [
            parsedDate.getFullYear(),
            '-',
            pad(parsedDate.getMonth() + 1),
            '-',
            pad(parsedDate.getDate()),
            'T',
            pad(parsedDate.getHours()),
            ':',
            pad(parsedDate.getMinutes())
        ].join('');
    }
    return result;
}

function addMinutesToInputValue(inputValue, minutes) {
    const parsedDate = new Date(inputValue);
    let result = '';
    if (!Number.isNaN(parsedDate.getTime())) {
        parsedDate.setMinutes(parsedDate.getMinutes() + minutes);
        result = toLocalDateTimeInputValue(parsedDate);
    }
    return result;
}
