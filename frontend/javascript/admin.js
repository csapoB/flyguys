$(async function () {
    await adminCheck();
});

// --- HTTP segédfüggvények ---

async function requestJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json();
    if (!response.ok) {
        let message = `Szerverhiba (${response.status})`;
        if (data.error) {
            message = data.error;
        }
        if (data.message) {
            message = data.message;
        }
        throw new Error(message);
    }
    return data;
}

async function adminCheck() {
    try {
        const response = await fetch('/api/AdminCheck', { method: 'GET' });
        let data = {};

        data = await response.json();
        if (!response.ok || !data.admin) {
            window.location.href = '/';
        } else {
            wireModeSwitch();
            wireUserSelection();
            wireUserSearch();
            wireFlightSelection();
            wireAdminFlightActions();
            await switchAdminMode('users');
        }
    } catch (error) {
        console.error(error.message);
        renderReservationError('Nem sikerült betölteni az admin adatokat.');
    }
}

// --- API hívások ---

async function getUsers() {
    return requestJson('/api/AdminGetUsers', { method: 'GET' });
}

async function searchUsers(email) {
    return requestJson(`/api/AdminSearchUsers?email=${email}`, { method: 'GET' });
}

async function getUserFlights(userId) {
    return requestJson(`/api/AdminGetUserFlights?userID=${userId}`, { method: 'GET' });
}

async function getUserFlightSeats(userId, flightId) {
    return requestJson(`/api/AdminGetUserFlightSeats?userID=${userId}&flightID=${flightId}`, { method: 'GET' });
}

async function getAdminFlights() {
    return requestJson('/api/AdminGetFlights', { method: 'GET' });
}

async function getAdminFlightCreateContext() {
    return requestJson('/api/AdminGetFlightCreateContext', { method: 'GET' });
}

async function cancelAdminFlight(flightId) {
    return requestJson('/api/AdminCancelFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flightID: flightId })
    });
}

async function createAdminFlight(payload) {
    return requestJson('/api/AdminCreateFlight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
}

// --- Mód váltás ---

function wireModeSwitch() {
    $('.admin-mode-btn').off('click').on('click', handleModeSwitchClick);
}

async function handleModeSwitchClick() {
    const mode = $(this).attr('data-admin-mode');
    await switchAdminMode(mode);
}

async function switchAdminMode(mode) {
    if (mode === 'users' || mode === 'flights') {
        renderModePanels(mode);
        if (mode === 'users') {
            const searchEmail = $('#user_email_search').val().trim();
            await loadUsers(searchEmail);
            renderIdleReservationsState();
            renderSelectedUserInfo();
        } else {
            await loadAdminFlightsMode();
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

async function loadUsers(searchEmail) {
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
    renderUsersTable(users);
}

function wireUserSearch() {
    $('#user_email_search').off('input').on('input', handleUserSearchInput);
    $('#user_email_search_clear').off('click').on('click', handleUserSearchClear);
}

function handleUserSearchInput() {
    const searchEmail = $(this).val().trim();
    clearTimeout($(this).data('searchTimeout'));
    $(this).data('searchTimeout', setTimeout(() => handleUserSearch(searchEmail), 250));
}

async function handleUserSearchClear() {
    const $input = $('#user_email_search');
    clearTimeout($input.data('searchTimeout'));
    $input.val('');
    await handleUserSearch('');
}

async function handleUserSearch(searchEmail) {
    try {
        await loadUsers(searchEmail);
        $('#tabla tbody tr.user-row').removeClass('selected-user');
        renderSelectedUserInfo();
        renderIdleReservationsState();
    } catch (error) {
        renderReservationError(error.message);
    }
}

function renderUsersTable(users) {
    const headers = ['Név', 'E-mail', 'Foglalások', 'Szint', 'Létrehozva'];
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
                $('<td></td>', { colspan: headers.length, text: 'Nincs megjeleníthető felhasználó.' })
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

function wireUserSelection() {
    $('#tabla').off('click', 'tbody tr.user-row').on('click', 'tbody tr.user-row', handleUserRowClick);
}

async function handleUserRowClick() {
    const $row = $(this);
    const userId = Number.parseInt($row.attr('data-user-id'), 10);
    try {
        if (!Number.isInteger(userId) || userId <= 0) {
            throw new Error('Érvénytelen felhasználó azonosító.');
        }
        $('#tabla tbody tr.user-row').removeClass('selected-user');
        $row.addClass('selected-user');
        renderSelectedUserInfo($row);
        renderLoadingFlightsState();
        const flightsResponse = await getUserFlights(userId);
        let flights = [];
        if (Array.isArray(flightsResponse.adat)) {
            flights = flightsResponse.adat;
        }
        renderFlightsTable(flights, userId);
    } catch (error) {
        renderReservationError(error.message);
    }
}

function renderSelectedUserInfo($row) {
    if (!$row) {
        $('#selected_user_info').text('Válassz ki egy felhasználót a bal oldali táblázatból.');
    } else {
        const userName = $row.attr('data-user-name');
        const userEmail = $row.attr('data-user-email');
        $('#selected_user_info').text(`${userName} | ${userEmail}`);
    }
}

function renderIdleReservationsState() {
    $('#reservation_area').html('<div class="empty-state">Válassz ki egy felhasználót a járatok megtekintéséhez.</div>');
}

function renderEmptyReservationsState() {
    $('#reservation_area').html('<div class="empty-state">A kiválasztott felhasználónak nincs foglalása.</div>');
}

function renderLoadingFlightsState() {
    $('#reservation_area').html('<div class="loading-state">Járatok betöltése...</div>');
}

function renderReservationError(message) {
    $('#reservation_area').empty().append(
        $('<div></div>', { class: 'error-state', text: message })
    );
}

// --- Foglalások táblázat ---

function renderFlightsTable(flights, userId) {
    let validFlights = [];
    if (Array.isArray(flights)) {
        validFlights = flights.filter(f => {
            const id = Number.parseInt(f.FlightID, 10);
            return Number.isInteger(id) && id > 0;
        });
    }

    if (!validFlights.length) {
        renderEmptyReservationsState();
    } else {
        const headers = ['Járat', 'Indulás / Érkezés', 'Foglalások', 'Összár', 'Státusz', 'Megnyitás'];
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
            const countLabel = `${reservationCount} db (Aktív: ${activeCount}, Törölt: ${cancelledCount})`;
            const status = getFlightStatus(flight, activeCount, cancelledCount, reservationCount);

            const $groupRow = $('<tr></tr>', {
                class: 'flight-group-row',
                'data-user-id': userId,
                'data-flight-id': flightId,
            });
            $groupRow.append($('<td></td>', { text: routeLabel, 'data-label': headers[0] }));
            $groupRow.append($('<td></td>', { text: timeLabel, 'data-label': headers[1] }));
            $groupRow.append($('<td></td>', { text: countLabel, class: 'flight-summary', 'data-label': headers[2] }));
            $groupRow.append($('<td></td>', { text: formatPrice(flight.TotalPrice), 'data-label': headers[3] }));
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
                $('<div></div>', { class: 'empty-state', text: 'Kattints a járatra az ülésrészletek betöltéséhez.' })
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

function wireFlightSelection() {
    $('#reservation_area')
        .off('click', '.flight-group-row')
        .on('click', '.flight-group-row', handleFlightToggle);
}

async function handleFlightToggle() {
    let $row = $(this)
    const userId = Number.parseInt($row.attr('data-user-id'), 10);
    const flightId = Number.parseInt($row.attr('data-flight-id'), 10);
    const $detailRow = $(`#reservation_area .flight-detail-row[data-user-id="${userId}"][data-flight-id="${flightId}"]`);
    const isValid = Number.isInteger(userId) && Number.isInteger(flightId) && $detailRow.length > 0;
    if (isValid) {
        if ($row.hasClass('expanded')) {
            collapseFlightRow($row, $detailRow);
        } else {
            await expandFlightRow($row, $detailRow, userId, flightId);
        }
    }
}

function collapseFlightRow($row, $detailRow) {
    $row.removeClass('expanded');
    $row.find('.toggle-indicator').text('+');
    $detailRow.addClass('d-none');
}

async function expandFlightRow($row, $detailRow, userId, flightId) {
    $row.addClass('expanded');
    $row.find('.toggle-indicator').text('-');
    $detailRow.removeClass('d-none');

    const $detailCell = $detailRow.find('td').first();
    $detailCell.html('<div class="loading-state loading-inline">Ülésrészletek betöltése...</div>');

    try {
        const seatsResponse = await getUserFlightSeats(userId, flightId);
        let seats = [];
        if (Array.isArray(seatsResponse.adat)) {
            seats = seatsResponse.adat;
        }
        $detailCell.empty().append(renderSeatsTable(seats));
    } catch (error) {
        console.error(error.message);
        $detailCell.empty().append(
            $('<div></div>', { class: 'error-state', text: error.message })
        );
    }
}

function getFlightStatus(flight, activeCount, cancelledCount, reservationCount) {
    let groupStatusRaw = '';
    if (flight.GroupStatus) {
        groupStatusRaw = String(flight.GroupStatus);
    }
    const groupStatus = groupStatusRaw.toLowerCase();
    const flightCancelled = toBool(flight.FlightIsCancelled);
    const cancelled = Number.parseInt(cancelledCount, 10);
    const active = Number.parseInt(activeCount, 10);
    const total = Number.parseInt(reservationCount, 10);

    let result = { label: 'Vegyes', className: 'status-mixed' };
    if (flightCancelled) {
        result = { label: 'Járat törölve', className: 'status-flight-cancelled' };
    } else {
        if (groupStatus === 'torolt' || (total > 0 && cancelled === total)) {
            result = { label: 'Törölt', className: 'status-cancelled' };
        } else {
            if (groupStatus === 'aktiv' || active === total) {
                result = { label: 'Aktív', className: 'status-active' };
            }
        }
    }
    return result;
}

function renderSeatsTable(seats) {
    let result;
    if (!Array.isArray(seats) || !seats.length) {
        result = $('<div></div>', { class: 'empty-state', text: 'Ehhez a járathoz nincs megjeleníthető ülőhely-foglalás.' });
    } else {
        const headers = ['Ülés', 'Tarifa', 'Ár', 'Státusz', 'Utas típus', 'Járat'];
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
            $row.append($('<td></td>', { text: formatPrice(seat.Price), 'data-label': headers[2] }));

            let statusClass = 'status-active';
            let statusText = 'Aktív';
            if (cancelled) {
                statusClass = 'status-cancelled';
                statusText = 'Törölt';
            }
            $row.append(
                $('<td></td>', { 'data-label': headers[3] }).append(
                    $('<span></span>', { class: `status-badge ${statusClass}`, text: statusText })
                )
            );

            let passengerType = 'Gyerek';
            if (adult) {
                passengerType = 'Felnőtt';
            }
            $row.append(
                $('<td></td>', { 'data-label': headers[4] }).append(
                    $('<span></span>', { class: 'type-badge', text: passengerType })
                )
            );

            let flightStatusClass = 'status-active-light';
            let flightStatusText = 'Rendben';
            if (flightCancelled) {
                flightStatusClass = 'status-flight-cancelled';
                flightStatusText = 'Járat törölve';
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

function wireAdminFlightActions() {
    $('#refresh_admin_flights').off('click').on('click', handleRefreshAdminFlights);
    $('#admin_flights_table').off('click', '.cancel-flight-btn').on('click', '.cancel-flight-btn', handleCancelFlightClick);
    $('#create_aircraft_id').off('change').on('change', applyAircraftConstraint);
    $('#create_departure_datetime').off('change').on('change', handleDepartureDateTimeChange);
    $('#create_flight_reset').off('click').on('click', resetCreateFlightForm);
    $('#create_flight_form').off('submit').on('submit', handleCreateFlightSubmit);
}

async function handleRefreshAdminFlights() {
    const currentMode = $('.admin-mode-btn.active').attr('data-admin-mode');
    if (currentMode === 'flights') {
        await loadAdminFlightsMode();
    }
}

async function handleCancelFlightClick() {
    const flightId = Number.parseInt($(this).attr('data-flight-id'), 10);
    const isValidFlight = Number.isInteger(flightId) && flightId > 0;
    const confirmed = isValidFlight && window.confirm('Biztosan törölni szeretnéd ezt a járatot?');
    if (confirmed) {
        try {
            const result = await cancelAdminFlight(flightId);
            await loadAdminFlightsMode();
            let successMessage = result.message;
            if (!successMessage) {
                successMessage = 'A járat törölve lett.';
            }
            renderAdminFeedback('#admin_flights_feedback', successMessage, 'success');
        } catch (error) {
            renderAdminFeedback('#admin_flights_feedback', error.message, 'error');
        }
    }
}

async function loadAdminFlightsMode() {
    renderAdminFlightsTableLoading();
    renderAdminFeedback('#admin_flights_feedback');
    renderAdminFeedback('#create_flight_feedback');

    try {
        const [flightsResponse, createContextResponse] = await Promise.all([
            getAdminFlights(),
            getAdminFlightCreateContext()
        ]);

        let flights = [];
        if (Array.isArray(flightsResponse.adat)) {
            flights = flightsResponse.adat;
        }
        renderAdminFlightsManagementTable(flights);

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
        populateCreateFlightOptions(airports, aircraft);
        resetCreateFlightForm();
    } catch (error) {
        $('#admin_flights_table').html('<div class="error-state">Nem sikerült betölteni a járatkezelő adatokat.</div>');
        renderAdminFeedback('#admin_flights_feedback', error.message, 'error');
    }
}

function renderAdminFlightsTableLoading() {
    $('#admin_flights_table').html('<div class="loading-state">Járatok betöltése...</div>');
}

function renderAdminFlightsManagementTable(validFlights) {
    if (!validFlights.length) {
        $('#admin_flights_table').html('<div class="empty-state">Nincs megjeleníthető járat.</div>');
    } else {
        const headers = ['FlightID', 'Repülő', 'Útvonal', 'Indulás', 'Érkezés', 'Alapár', 'Foglalások', 'Státusz', 'Művelet'];
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

            let statusLabel = 'Aktív';
            let statusClass = 'status-active';
            if (isCancelled) {
                statusLabel = 'Törölve';
                statusClass = 'status-flight-cancelled';
            }

            let cancelButtonText = 'Járat törlése';
            if (isCancelled) {
                cancelButtonText = 'Már törölve';
            }

            const routeText = `${flight.DepartureAirport} (${flight.DepartureCity}) → ${flight.ArrivalAirport} (${flight.ArrivalCity})`;

            const $row = $('<tr></tr>');
            $row.append($('<td></td>', { text: flightId, 'data-label': headers[0] }));
            $row.append($('<td></td>', { text: aircraftText, 'data-label': headers[1] }));
            $row.append($('<td></td>', { text: routeText, 'data-label': headers[2] }));
            $row.append($('<td></td>', { text: formatDateTime(flight.DepartureDateTime), 'data-label': headers[3] }));
            $row.append($('<td></td>', { text: formatDateTime(flight.ArrivalDateTime), 'data-label': headers[4] }));
            $row.append($('<td></td>', { text: formatPrice(flight.BasePriceInHUF), 'data-label': headers[5] }));
            $row.append($('<td></td>', { text: `${reservationCount} db (aktív: ${activeReservationCount})`, 'data-label': headers[6] }));
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

function populateCreateFlightOptions(airports, aircraft) {
    const $aircraftSelect = $('#create_aircraft_id');
    $aircraftSelect.empty().append($('<option></option>', { value: '', text: 'Válassz repülőt...' }));
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
    $departureSelect.empty().append($('<option></option>', { value: '', text: 'Válassz indulási repteret...' }));
    $arrivalSelect.empty().append($('<option></option>', { value: '', text: 'Válassz cél repteret...' }));

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

function applyAircraftConstraint() {
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
            $hint.text(`A repülő utolsó ismert érkezése: ${requiredAirport}, ${formatDateTime(selectedAircraft.LastArrivalDateTime)}. Az indulásnak legalább 30 perccel később kell lennie.`);
        } else {
            $departureAirport.prop('disabled', false);
            $departureDateTime.attr('min', '');
            $hint.text('Ennek a repülőnek még nincs előző járata, bármelyik repülőtérről indulhat.');
        }
    }
    $departureDateTime.trigger('change');
}

// --- Járat létrehozás validáció ---

function validateCreateFlightForm(aircraftID, departureAirport, arrivalAirport, departureDate, arrivalDate, basePriceInHUF) {
    let error = null;
    if (!Number.isInteger(aircraftID) || aircraftID <= 0) {
        error = 'Válassz érvényes repülőt.';
    } else if (!departureAirport || !arrivalAirport) {
        error = 'Válassz indulási és érkezési repteret.';
    } else if (departureAirport == arrivalAirport) {
        error = 'Az indulási és érkezési repülőtér nem lehet ugyanaz.';
    } else if (Number.isNaN(departureDate.getTime()) || Number.isNaN(arrivalDate.getTime())) {
        error = 'Adj meg érvényes dátumokat.';
    } else if (arrivalDate <= departureDate) {
        error = 'Az érkezés időpontja később kell legyen, mint az indulás.';
    } else if (!Number.isInteger(basePriceInHUF) || basePriceInHUF <= 0) {
        error = 'Az alapár csak pozitív egész szám lehet.';
    }
    return error;
}

function validateAircraftConstraint(selectedAircraft, departureAirport, departureDate) {
    let error = null;
    if (selectedAircraft && selectedAircraft.LastArrivalAirport) {
        const lastKnownAirport = String(selectedAircraft.LastArrivalAirport).toUpperCase();
        if (departureAirport != lastKnownAirport) {
            error = `A kiválasztott repülő innen indulhat: ${lastKnownAirport}.`;
        } else {
            const lastArrivalDate = new Date(selectedAircraft.LastArrivalDateTime);
            if (!Number.isNaN(lastArrivalDate.getTime())) {
                const minDepartureDate = new Date(lastArrivalDate.getTime() + 30 * 60 * 1000);
                if (departureDate < minDepartureDate) {
                    error = 'Az indulásnak legalább 30 perccel az utolsó érkezés után kell lennie.';
                }
            }
        }
    }
    return error;
}

async function handleCreateFlightSubmit(event) {
    event.preventDefault();
    renderAdminFeedback('#create_flight_feedback');

    const aircraftID = Number.parseInt($('#create_aircraft_id').val(), 10);
    const departureAirport = $('#create_departure_airport').val().trim().toUpperCase();
    console.log(departureAirport);
    const arrivalAirport = $('#create_arrival_airport').val().trim().toUpperCase();
    const departureDateTime = $('#create_departure_datetime').val();
    const arrivalDateTime = $('#create_arrival_datetime').val();
    const basePriceInHUF = Number.parseInt($('#create_base_price').val(), 10);
    const departureDate = new Date(departureDateTime);
    const arrivalDate = new Date(arrivalDateTime);
    const selectedAircraft = getSelectedAircraftContext();

    let validationError = validateCreateFlightForm(aircraftID, departureAirport, arrivalAirport, departureDate, arrivalDate, basePriceInHUF);
    if (validationError === null) {
        validationError = validateAircraftConstraint(selectedAircraft, departureAirport, departureDate);
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
            });
            await loadAdminFlightsMode();
            let successMessage = result.message;
            if (!successMessage) {
                successMessage = 'A járat létrehozva.';
            }
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

function formatPrice(value) {
    const numericValue = Number(value);
    let result = '';
    if (!Number.isNaN(numericValue)) {
        result = `${new Intl.NumberFormat('hu-HU').format(numericValue)} Ft`;
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
