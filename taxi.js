"use strict";

const DRIVER_STORAGE_KEY = "taxipilot_driver";
const RIDES_STORAGE_KEY = "taxipilot_taxi_rides";

let recognition = null;
let isListening = false;


/* ========================================
   AVVIO
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const driver = getDriver();

    if (!driver) {
        window.location.href = "../index.html";
        return;
    }

    initializePage(driver);

});


/* ========================================
   PAGINA
======================================== */

function initializePage(driver) {

    updateDriverInterface(driver);


    if (document.getElementById("rideForm")) {

        initializeNewRidePage();

    }


    if (document.getElementById("todayRides")) {

        initializeHomePage();

    }


if (document.getElementById("agendaRides")) {
    initializeAgendaPage();
    initializeCalendar();
}


    if (document.getElementById("ridesList")) {

        initializeRidesPage();

    }

}


/* ========================================
   CONDUCENTE
======================================== */

function getDriver() {

    const saved =
        localStorage.getItem(DRIVER_STORAGE_KEY);

    if (!saved) {
        return null;
    }

    try {

        const driver = JSON.parse(saved);

        if (
            !driver ||
            !driver.name ||
            !driver.phone ||
            driver.service !== "taxi"
        ) {
            return null;
        }

        return driver;

    } catch (error) {

        console.error(
            "Errore configurazione conducente:",
            error
        );

        return null;
    }

}


/* ========================================
   INTERFACCIA CONDUCENTE
======================================== */

function updateDriverInterface(driver) {

    const nameElement =
        document.getElementById("driverName");

    const initialElement =
        document.getElementById("profileInitial");

    if (nameElement) {

        nameElement.textContent =
            getFirstName(driver.name);

    }

    if (initialElement) {

        initialElement.textContent =
            getInitial(driver.name);

    }

    updateGreeting();

}


/* ========================================
   SALUTO
======================================== */

function updateGreeting() {

    const element =
        document.getElementById("headerGreeting");

    if (!element) {
        return;
    }

    const hour =
        new Date().getHours();

    if (hour < 5) {

        element.textContent = "Buonanotte";

    } else if (hour < 13) {

        element.textContent = "Buongiorno";

    } else if (hour < 18) {

        element.textContent = "Buon pomeriggio";

    } else {

        element.textContent = "Buonasera";

    }

}


/* ========================================
   HOME
======================================== */

function initializeHomePage() {

    updateCurrentDate();

    renderTaxiHome();

}


/* ========================================
   DATA
======================================== */

function updateCurrentDate() {

    const element =
        document.getElementById("currentDate");

    if (!element) {
        return;
    }

    const date =
        new Date();

    const text =
        date.toLocaleDateString(
            "it-IT",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );

    element.textContent =
        capitalize(text);

}


/* ========================================
   CORSE
======================================== */

function getRides() {

    const saved =
        localStorage.getItem(RIDES_STORAGE_KEY);

    if (!saved) {
        return [];
    }

    try {

        const rides =
            JSON.parse(saved);

        return Array.isArray(rides)
            ? rides
            : [];

    } catch (error) {

        console.error(
            "Errore lettura corse:",
            error
        );

        return [];

    }

}


/* ========================================
   SALVA CORSE
======================================== */

function saveRides(rides) {

    localStorage.setItem(
        RIDES_STORAGE_KEY,
        JSON.stringify(rides)
    );

}


/* ========================================
   HOME CORSE
======================================== */

function renderTaxiHome() {

    const rides =
        getRides();

    const today =
        getTodayString();

    const todayRides =
        rides
            .filter(function (ride) {
                return ride.date === today;
            })
            .sort(compareRides);


    const count =
        document.getElementById("rideCount");

    if (count) {

        count.textContent =
            todayRides.length;

    }


    renderNextRide(todayRides);

    renderTodayRides(todayRides);

}


/* ========================================
   PROSSIMA CORSA
======================================== */

function renderNextRide(rides) {

    const container =
        document.getElementById("nextRide");

    if (!container) {
        return;
    }

    const now =
        new Date();

    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const upcoming =
        rides.find(function (ride) {

            return getTimeMinutes(ride.time)
                >= currentMinutes;

        });


    if (!upcoming) {

        container.innerHTML = `

            <div class="empty-ride">

                <div class="empty-ride-icon">
                    +
                </div>

                <div>

                    <strong>
                        Nessuna corsa programmata
                    </strong>

                    <span>
                        Aggiungi una nuova corsa
                    </span>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        createRideCard(
            upcoming,
            true
        );

}


/* ========================================
   CORSE DI OGGI
======================================== */

function renderTodayRides(rides) {

    const container =
        document.getElementById("todayRides");

    if (!container) {
        return;
    }


    if (rides.length === 0) {

        container.innerHTML = `

            <div class="empty-list">

                <span>
                    Nessuna corsa per oggi
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        rides
            .map(function (ride) {

                return createRideCard(
                    ride,
                    false
                );

            })
            .join("");

}


/* ========================================
   CARD CORSA
======================================== */

function createRideCard(ride, featured) {

    const passenger =
        ride.passenger ||
        "Passeggero";

    const pickup =
        ride.pickup ||
        "Partenza non indicata";

    const destination =
        ride.destination ||
        "Destinazione non indicata";

    const time =
        ride.time ||
        "--:--";

    const passengers =
        ride.passengers ||
        1;

    const className =
        featured
            ? " ride-card-featured"
            : "";


    return `

        <article class="ride-card${className}">

            <div class="ride-card-top">

                <strong class="ride-time">
                    ${escapeHTML(time)}
                </strong>

                <span class="ride-passengers">
                    ${escapeHTML(
                        String(passengers)
                    )} pax
                </span>

            </div>


            <div class="ride-passenger">
                ${escapeHTML(passenger)}
            </div>


            <div class="ride-route">

                <div class="route-point">

                    <span class="route-dot"></span>

                    <span>
                        ${escapeHTML(pickup)}
                    </span>

                </div>


                <div class="route-line"></div>


                <div class="route-point">

                    <span class="route-dot route-dot-end"></span>

                    <span>
                        ${escapeHTML(destination)}
                    </span>

                </div>

            </div>

        </article>

    `;

}


/* ========================================
   NUOVA CORSA
======================================== */

function initializeNewRidePage() {

    setDefaultDate();

    initializeTextAnalyzer();

    initializeVoiceRecognition();

    initializeRideForm();

}


/* ========================================
   DATA PREDEFINITA
======================================== */

function setDefaultDate() {

    const input =
        document.getElementById("rideDate");

    if (!input) {
        return;
    }

    input.value =
        getTodayString();

}


/* ========================================
   ANALISI TESTO
======================================== */

function initializeTextAnalyzer() {

    const button =
        document.getElementById(
            "analyzeTextButton"
        );

    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const input =
                document.getElementById(
                    "rideTextInput"
                );

            if (!input) {
                return;
            }


            const text =
                input.value.trim();


            if (!text) {

                showSmartResult(
                    "Inserisci prima un messaggio."
                );

                return;

            }


            const result =
                parseRideText(text);


            fillRideForm(result);


            showSmartResult(
                getAnalysisMessage(result)
            );

        }
    );

}


/* ========================================
   PARSER INTELLIGENTE
======================================== */

function parseRideText(text) {

    const result = {
        passenger: "",
        passengerPhone: "",
        date: "",
        time: "",
        pickup: "",
        destination: "",
        passengers: "",
        notes: ""
    };

    if (!text) {
        return result;
    }

    const normalized = text
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();


/* ========================================
   TELEFONO
======================================== */

const phonePatterns = [

    /(?:\+39[\s.-]?)?3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}/,

    /\b3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}\b/,

    /\b\d{10}\b/

];


for (const pattern of phonePatterns) {

    const match = normalized.match(pattern);

    if (!match) {
        continue;
    }

    const digits =
        match[0].replace(/\D/g, "");

    if (digits.length === 10) {

        result.passengerPhone = digits;

        break;

    }

}


/* ========================================
   TELEFONO DETTATO A VOCE
======================================== */

if (!result.passengerPhone) {

    const numberWords = {

        zero: "0",
        uno: "1",
        due: "2",
        tre: "3",
        quattro: "4",
        cinque: "5",
        sei: "6",
        sette: "7",
        otto: "8",
        nove: "9"

    };


    const words =
        normalized
            .toLowerCase()
            .replace(/[,.!?]/g, " ")
            .split(/\s+/);


    let spokenNumber = "";


    for (const word of words) {

        if (
            numberWords[word] !== undefined
        ) {

            spokenNumber +=
                numberWords[word];

        }

    }


    /*
     * Un numero di cellulare italiano
     * normalmente inizia con 3.
     */

    if (
        spokenNumber.length === 10 &&
        spokenNumber.startsWith("3")
    ) {

        result.passengerPhone =
            spokenNumber;

    }

}

    /* ========================================
       PASSEGGERI
    ======================================== */

    const passengerPatterns = [

        /\b(\d{1,2})\s*(?:pax)\b/i,

        /\b(\d{1,2})\s*(?:persone)\b/i,

        /\b(\d{1,2})\s*(?:passeggeri)\b/i,

        /\b(?:per|con)\s+(\d{1,2})\s*(?:persone|passeggeri|pax)\b/i

    ];


    for (const pattern of passengerPatterns) {

        const match =
            normalized.match(pattern);

        if (match) {

            result.passengers =
                match[1];

            break;

        }

    }


    /* ========================================
       ORARIO
    ======================================== */

    let match =
        normalized.match(
            /\b(?:alle|ore|h)?\s*(\d{1,2})[:.](\d{2})\b/i
        );


    if (match) {

        const hour =
            Number(match[1]);

        const minute =
            Number(match[2]);


        if (
            hour >= 0 &&
            hour <= 23 &&
            minute >= 0 &&
            minute <= 59
        ) {

            result.time =
                pad(hour) +
                ":" +
                pad(minute);

        }

    }


    /* ========================================
       ORARIO "8 E MEZZA"
    ======================================== */

    if (!result.time) {

        match =
            normalized.match(
                /\b(?:alle|ore)?\s*(\d{1,2})\s+e\s+mezza\b/i
            );


        if (match) {

            result.time =
                pad(Number(match[1])) +
                ":30";

        }

    }


    /* ========================================
       DATA
    ======================================== */

    if (/\bdopodomani\b/i.test(normalized)) {

        result.date =
            addDays(
                new Date(),
                2
            );

    } else if (/\bdomani\b/i.test(normalized)) {

        result.date =
            addDays(
                new Date(),
                1
            );

    } else if (/\boggi\b/i.test(normalized)) {

        result.date =
            getTodayString();

    } else {

        match =
            normalized.match(
                /\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})\b/
            );


        if (match) {

            let year =
                Number(match[3]);


            if (year < 100) {
                year += 2000;
            }


            result.date =
                year +
                "-" +
                pad(Number(match[2])) +
                "-" +
                pad(Number(match[1]));

        }

    }


    /* ========================================
       NOME PASSEGGERO
    ======================================== */

    const namePatterns = [

        /(?:cliente|passeggero|passeggera|signor|signora|sig\.|sig\.ra|nome)\s*[:\-]?\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/i,

        /(?:a nome di)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,2})/i

    ];


    for (const pattern of namePatterns) {

        match =
            normalized.match(pattern);

        if (match) {

            result.passenger =
                cleanPassengerName(
                    match[1]
                );

            break;

        }

    }


    /*
     * Cerca "Nome Cognome" solo se non
     * abbiamo già trovato il passeggero.
     */

    if (!result.passenger) {

        const nameMatch =
            normalized.match(
                /\b([A-ZÀ-Ý][a-zà-ÿ]+)\s+([A-ZÀ-Ý][a-zà-ÿ]+)\b/
            );


        if (nameMatch) {

            const candidate =
                nameMatch[1] +
                " " +
                nameMatch[2];


            const forbidden = [

                "Lecce",
                "Brindisi",
                "Bari",
                "Aeroporto",
                "Stazione",
                "Via",
                "Viale",
                "Piazza"

            ];


            const invalid =
                forbidden.some(
                    word =>
                        candidate
                            .toLowerCase()
                            .includes(
                                word.toLowerCase()
                            )
                );


            if (!invalid) {

                result.passenger =
                    candidate;

            }

        }

    }


    /* ========================================
       PARTENZA + DESTINAZIONE
    ======================================== */

    /*
     * Cerchiamo prima strutture esplicite:
     *
     * partenza X destinazione Y
     * da X a Y
     * da X fino a Y
     */

    const explicitRoutePatterns = [

        /(?:partenza|ritiro|pickup)\s*[:\-]?\s*(.+?)\s+(?:destinazione|arrivo)\s*[:\-]?\s*(.+?)(?=\s+(?:alle|ore|h|domani|oggi|dopodomani|cliente|passeggero|passeggera|telefono|tel|note|nota)\b|$)/i,

        /\bda\s+(.+?)\s+(?:a|verso|fino a)\s+(.+?)(?=\s+(?:alle|ore|h|domani|oggi|dopodomani|cliente|passeggero|passeggera|telefono|tel|note|nota)\b|$)/i

    ];


    for (
        const pattern of explicitRoutePatterns
    ) {

        match =
            normalized.match(pattern);

        if (match) {

            result.pickup =
                cleanLocationAdvanced(
                    match[1]
                );

            result.destination =
                cleanLocationAdvanced(
                    match[2]
                );

            break;

        }

    }


    /* ========================================
       PARTENZA ESPLICITA
    ======================================== */

    if (!result.pickup) {

        const pickupMatch =
            normalized.match(
                /(?:partenza|ritiro|pickup)\s*[:\-]?\s*(.+?)(?=\s+(?:destinazione|arrivo|alle|ore|h|domani|oggi|dopodomani|cliente|passeggero|telefono|tel|note|nota)\b|$)/i
            );


        if (pickupMatch) {

            result.pickup =
                cleanLocationAdvanced(
                    pickupMatch[1]
                );

        }

    }


    /* ========================================
       DESTINAZIONE ESPLICITA
    ======================================== */

    if (!result.destination) {

        const destinationMatch =
            normalized.match(
                /(?:destinazione|arrivo)\s*[:\-]?\s*(.+?)(?=\s+(?:alle|ore|h|domani|oggi|dopodomani|cliente|passeggero|telefono|tel|note|nota)\b|$)/i
            );


        if (destinationMatch) {

            result.destination =
                cleanLocationAdvanced(
                    destinationMatch[1]
                );

        }

    }


    /* ========================================
       NOTE
    ======================================== */

    const noteMatch =
        normalized.match(
            /(?:note|nota|attenzione)\s*[:\-]?\s*(.+)$/i
        );


    if (noteMatch) {

        result.notes =
            noteMatch[1].trim();

    }


    return result;

}
/* ========================================
   RIEMPI MODULO
======================================== */

function fillRideForm(result) {

    setInput(
        "passenger",
        result.passenger
    );

    setInput(
        "passengerPhone",
        result.passengerPhone
    );

    setInput(
        "rideDate",
        result.date
    );

    setInput(
        "rideTime",
        result.time
    );

    setInput(
        "pickup",
        result.pickup
    );

    setInput(
        "destination",
        result.destination
    );

    setInput(
        "passengers",
        result.passengers
    );

    setInput(
        "rideNotes",
        result.notes
    );

}


/* ========================================
   MESSAGGIO ANALISI
======================================== */

function getAnalysisMessage(result) {

    const fields = [

        result.passenger,
        result.passengerPhone,
        result.date,
        result.time,
        result.pickup,
        result.destination,
        result.passengers

    ];


    const found =
        fields.filter(Boolean).length;


    if (found === 0) {

        return "Non ho riconosciuto dati sufficienti. Puoi completarli manualmente.";

    }


    return (
        "Ho riconosciuto " +
        found +
        " informazioni. Controlla i campi prima di salvare."
    );

}


/* ========================================
   VOCE
======================================== */

function initializeVoiceRecognition() {

    const button =
        document.getElementById(
            "voiceButton"
        );

    if (!button) {
        return;
    }


    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        button.addEventListener(
            "click",
            function () {

                setVoiceStatus(
                    "Il riconoscimento vocale non è supportato da questo browser."
                );

            }
        );

        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.lang =
        "it-IT";


    recognition.continuous =
        false;


    recognition.interimResults =
        false;


    recognition.maxAlternatives =
        1;


    recognition.onstart =
        function () {

            isListening = true;

            button.classList.add(
                "voice-listening"
            );

            setVoiceStatus(
                "Sto ascoltando..."
            );

        };


recognition.onresult =
    function (event) {

        const transcript =
            event.results[0][0].transcript.trim();


        if (!transcript) {

            setVoiceStatus(
                "Non ho ricevuto nessun testo."
            );

            return;

        }


        // Il testo della voce NON viene
        // inserito nella textarea.
        // Viene direttamente analizzato.

        const result =
            parseRideText(transcript);


        // Riempie direttamente
        // i campi della corsa.

        fillRideForm(result);


        const message =
            getAnalysisMessage(result);


        setVoiceStatus(
            message
        );

    };


    recognition.onerror =
        function (event) {

            console.error(
                "Errore riconoscimento vocale:",
                event.error
            );


            setVoiceStatus(
                "Non sono riuscito a riconoscere la voce. Riprova."
            );

        };


    recognition.onend =
        function () {

            isListening = false;

            button.classList.remove(
                "voice-listening"
            );

        };


    button.addEventListener(
        "click",
        function () {

            if (isListening) {

                recognition.stop();

                return;

            }


            try {

                recognition.start();

            } catch (error) {

                console.error(error);

            }

        }
    );

}


/* ========================================
   STATO VOCE
======================================== */

function setVoiceStatus(message) {

    const element =
        document.getElementById(
            "voiceStatus"
        );


    if (element) {

        element.textContent =
            message;

    }

}


/* ========================================
   SALVATAGGIO CORSA
======================================== */

function initializeRideForm() {

    const form =
        document.getElementById(
            "rideForm"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const ride =
                getRideFromForm();


            if (!ride.passenger) {

                alert(
                    "Inserisci il nome del passeggero."
                );

                return;

            }


            if (!ride.date) {

                alert(
                    "Inserisci la data della corsa."
                );

                return;

            }


            if (!ride.time) {

                alert(
                    "Inserisci l'orario della corsa."
                );

                return;

            }


            const rides =
                getRides();


            rides.push(ride);


            saveRides(rides);


            window.location.href =
                "home.html";

        }
    );

}


/* ========================================
   DATI DAL MODULO
======================================== */

function getRideFromForm() {

    return {

        id:
            Date.now().toString(),

        passenger:
            getValue("passenger"),

        passengerPhone:
            getValue("passengerPhone"),

        date:
            getValue("rideDate"),

        time:
            getValue("rideTime"),

        pickup:
            getValue("pickup"),

        destination:
            getValue("destination"),

        passengers:
            Number(
                getValue("passengers")
            ) || 1,

        notes:
            getValue("rideNotes"),

        createdAt:
            new Date().toISOString()

    };

}


/* ========================================
   UTILITÀ
======================================== */

function getValue(id) {

    const element =
        document.getElementById(id);

    return element
        ? element.value.trim()
        : "";

}


function setInput(id, value) {

    const element =
        document.getElementById(id);

    if (
        element &&
        value !== undefined &&
        value !== null &&
        value !== ""
    ) {

        element.value =
            value;

    }

}


function getTodayString() {

    const date =
        new Date();

    const year =
        date.getFullYear();

    const month =
        pad(date.getMonth() + 1);

    const day =
        pad(date.getDate());


    return (
        year +
        "-" +
        month +
        "-" +
        day
    );

}


function addDays(date, days) {

    const result =
        new Date(date);

    result.setDate(
        result.getDate() + days
    );


    return (
        result.getFullYear() +
        "-" +
        pad(result.getMonth() + 1) +
        "-" +
        pad(result.getDate())
    );

}


function getTimeMinutes(time) {

    if (!time) {
        return 999999;
    }


    const parts =
        time.split(":");


    return (
        Number(parts[0]) * 60 +
        Number(parts[1])
    );

}


function compareRides(a, b) {

    return (
        getTimeMinutes(a.time) -
        getTimeMinutes(b.time)
    );

}


function pad(value) {

    return String(value)
        .padStart(2, "0");

}


function getFirstName(name) {

    if (!name) {
        return "Conducente";
    }


    return name
        .trim()
        .split(/\s+/)[0];

}


function getInitial(name) {

    if (!name) {
        return "C";
    }


    return name
        .trim()
        .charAt(0)
        .toUpperCase();

}


function capitalize(text) {

    if (!text) {
        return "";
    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}


function normalizeText(text) {

    return text
        .replace(/\s+/g, " ")
        .replace(/\n+/g, " ")
        .trim();

}


function cleanExtractedName(name) {

    return name
        .replace(
            /\b(?:domani|oggi|alle|ore|partenza|destinazione|arrivo)\b.*$/i,
            ""
        )
        .replace(
            /[,.]+$/,
            ""
        )
        .trim();

}


function cleanLocation(location) {

    return location
        .replace(
            /^(?:in|presso|da|a)\s+/i,
            ""
        )
        .replace(
            /[,.]+$/,
            ""
        )
        .trim();

}


function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}

function cleanLocationAdvanced(location) {

    if (!location) {
        return "";
    }

    return location
        .replace(
            /^(?:in|a|da|presso|verso|fino a|per)\s+/i,
            ""
        )
        .replace(
            /^(?:il|la|lo|l')\s+/i,
            ""
        )
        .replace(
            /\s+(?:domani|oggi|dopodomani)$/i,
            ""
        )
        .replace(
            /[,.]+$/,
            ""
        )
        .trim();

}


function cleanPassengerName(name) {

    if (!name) {
        return "";
    }

    return name
        .replace(
            /\b(?:domani|oggi|dopodomani|alle|ore)\b.*$/i,
            ""
        )
        .replace(
            /[,.]+$/,
            ""
        )
        .trim();

}

/* ========================================
   PAGINA CORSE
======================================== */

let currentRideFilter = "all";
let selectedRideId = null;


function initializeRidesPage() {

    initializeRideSearch();

    initializeRideFilters();

    initializeRideDetail();

    renderRidesPage();

}


/* ========================================
   RENDER CORSE
======================================== */

function renderRidesPage() {

    const container =
        document.getElementById("ridesList");

    const empty =
        document.getElementById("ridesEmpty");


    if (!container || !empty) {
        return;
    }


    const searchInput =
        document.getElementById("rideSearch");


    const search =
        searchInput
            ? searchInput.value
                .trim()
                .toLowerCase()
            : "";


    let rides =
        getRides();


    rides =
        rides.sort(function (a, b) {

            const dateA =
                new Date(
                    a.date + "T" + (a.time || "00:00")
                );

            const dateB =
                new Date(
                    b.date + "T" + (b.time || "00:00")
                );

            return dateA - dateB;

        });


    rides =
        rides.filter(function (ride) {

            if (
                currentRideFilter === "today"
            ) {

                return ride.date ===
                    getTodayString();

            }


            if (
                currentRideFilter === "upcoming"
            ) {

                return isRideUpcoming(ride);

            }


            return true;

        });


    if (search) {

        rides =
            rides.filter(function (ride) {

                const searchable = [

                    ride.passenger,
                    ride.passengerPhone,
                    ride.pickup,
                    ride.destination,
                    ride.notes,
                    ride.date,
                    ride.time

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return searchable.includes(
                    search
                );

            });

    }


    if (rides.length === 0) {

        container.innerHTML = "";

        empty.classList.remove("hidden");

        return;

    }


    empty.classList.add("hidden");


    const groups = {};


    rides.forEach(function (ride) {

        if (!groups[ride.date]) {

            groups[ride.date] = [];

        }

        groups[ride.date].push(ride);

    });


    container.innerHTML =
        Object.keys(groups)
            .map(function (date) {

                return createRideDateGroup(
                    date,
                    groups[date]
                );

            })
            .join("");


    container
        .querySelectorAll("[data-ride-id]")
        .forEach(function (element) {

            element.addEventListener(
                "click",
                function () {

                    openRideDetail(
                        element.dataset.rideId
                    );

                }
            );

        });

}


/* ========================================
   GRUPPO DATA
======================================== */

function createRideDateGroup(date, rides) {

    const title =
        getRideDateLabel(date);


    return `

        <section class="ride-date-group">

            <div class="ride-date-heading">

                <span class="section-eyebrow">
                    ${escapeHTML(title)}
                </span>

                <span>
                    ${rides.length}
                </span>

            </div>


            <div class="ride-date-list">

                ${rides
                    .map(function (ride) {

                        return createListRideCard(
                            ride
                        );

                    })
                    .join("")}

            </div>

        </section>

    `;

}


/* ========================================
   CARD LISTA
======================================== */

function createListRideCard(ride) {

    return `

        <article
            class="ride-list-card"
            data-ride-id="${escapeHTML(
                String(ride.id)
            )}"
        >

            <div class="ride-list-time">

                <strong>
                    ${escapeHTML(
                        ride.time || "--:--"
                    )}
                </strong>

            </div>


            <div class="ride-list-main">

                <strong>
                    ${escapeHTML(
                        ride.passenger ||
                        "Passeggero"
                    )}
                </strong>


                <span>

                    ${escapeHTML(
                        ride.pickup ||
                        "Partenza non indicata"
                    )}

                    →

                    ${escapeHTML(
                        ride.destination ||
                        "Destinazione non indicata"
                    )}

                </span>

            </div>


            <div class="ride-list-passengers">

                ${escapeHTML(
                    String(
                        ride.passengers || 1
                    )
                )}

            </div>

        </article>

    `;

}


/* ========================================
   LABEL DATA
======================================== */

function getRideDateLabel(date) {

    const today =
        getTodayString();


    const tomorrow =
        addDays(
            new Date(),
            1
        );


    if (date === today) {

        return "Oggi";

    }


    if (date === tomorrow) {

        return "Domani";

    }


    const parsed =
        new Date(
            date + "T00:00:00"
        );


    if (Number.isNaN(parsed.getTime())) {

        return date;

    }


    return capitalize(
        parsed.toLocaleDateString(
            "it-IT",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        )
    );

}


/* ========================================
   CORSA FUTURA
======================================== */

function isRideUpcoming(ride) {

    if (!ride.date) {
        return false;
    }


    const now =
        new Date();


    const rideDate =
        new Date(
            ride.date +
            "T" +
            (ride.time || "23:59")
        );


    return rideDate >= now;

}


/* ========================================
   RICERCA
======================================== */

function initializeRideSearch() {

    const input =
        document.getElementById(
            "rideSearch"
        );


    if (!input) {
        return;
    }


    input.addEventListener(
        "input",
        function () {

            renderRidesPage();

        }
    );

}


/* ========================================
   FILTRI
======================================== */

function initializeRideFilters() {

    document
        .querySelectorAll(".ride-filter")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    document
                        .querySelectorAll(
                            ".ride-filter"
                        )
                        .forEach(function (item) {

                            item.classList.remove(
                                "active"
                            );

                        });


                    button.classList.add(
                        "active"
                    );


                    currentRideFilter =
                        button.dataset.filter;


                    renderRidesPage();

                }
            );

        });

}


/* ========================================
   DETTAGLIO CORSA
======================================== */

function initializeRideDetail() {

    const closeButton =
        document.getElementById(
            "closeRideDetail"
        );


    const backdrop =
        document.querySelector(
            "#rideDetailModal .modal-backdrop"
        );


    const deleteButton =
        document.getElementById(
            "deleteRideButton"
        );


    if (closeButton) {

        closeButton.addEventListener(
            "click",
            closeRideDetail
        );

    }


    if (backdrop) {

        backdrop.addEventListener(
            "click",
            closeRideDetail
        );

    }


    if (deleteButton) {

        deleteButton.addEventListener(
            "click",
            deleteSelectedRide
        );

    }

}


/* ========================================
   APRI DETTAGLIO
======================================== */

function openRideDetail(id) {

    const rides =
        getRides();


    const ride =
        rides.find(function (item) {

            return String(item.id) ===
                String(id);

        });


    if (!ride) {
        return;
    }


    selectedRideId =
        ride.id;


    const modal =
        document.getElementById(
            "rideDetailModal"
        );


    const passenger =
        document.getElementById(
            "detailPassenger"
        );


    const content =
        document.getElementById(
            "rideDetailContent"
        );


    if (!modal || !passenger || !content) {
        return;
    }


    passenger.textContent =
        ride.passenger ||
        "Passeggero";


    content.innerHTML = `

        <div class="ride-detail-row">

            <span>
                Data
            </span>

            <strong>
                ${escapeHTML(
                    getRideDateLabel(
                        ride.date
                    )
                )}
            </strong>

        </div>


        <div class="ride-detail-row">

            <span>
                Ora
            </span>

            <strong>
                ${escapeHTML(
                    ride.time || "--:--"
                )}
            </strong>

        </div>


        <div class="ride-detail-row">

            <span>
                Partenza
            </span>

            <strong>
                ${escapeHTML(
                    ride.pickup ||
                    "Non indicata"
                )}
            </strong>

        </div>


        <div class="ride-detail-row">

            <span>
                Destinazione
            </span>

            <strong>
                ${escapeHTML(
                    ride.destination ||
                    "Non indicata"
                )}
            </strong>

        </div>


        <div class="ride-detail-row">

            <span>
                Passeggeri
            </span>

            <strong>
                ${escapeHTML(
                    String(
                        ride.passengers || 1
                    )
                )}
            </strong>

        </div>


        <div class="ride-detail-row">

            <span>
                Telefono
            </span>

            <strong>
                ${escapeHTML(
                    ride.passengerPhone ||
                    "Non disponibile"
                )}
            </strong>

        </div>


        <div class="ride-detail-row">

            <span>
                Note
            </span>

            <strong>
                ${escapeHTML(
                    ride.notes ||
                    "Nessuna"
                )}
            </strong>

        </div>

    `;


    modal.classList.remove(
        "hidden"
    );

}


/* ========================================
   CHIUDI DETTAGLIO
======================================== */

function closeRideDetail() {

    const modal =
        document.getElementById(
            "rideDetailModal"
        );


    if (modal) {

        modal.classList.add(
            "hidden"
        );

    }


    selectedRideId =
        null;

}


/* ========================================
   ELIMINA CORSA
======================================== */

function deleteSelectedRide() {

    if (!selectedRideId) {
        return;
    }


    const confirmed =
        window.confirm(
            "Vuoi davvero eliminare questa corsa?"
        );


    if (!confirmed) {
        return;
    }


    const rides =
        getRides();


    const updated =
        rides.filter(function (ride) {

            return String(ride.id) !==
                String(selectedRideId);

        });


    saveRides(updated);


    closeRideDetail();

    renderRidesPage();

}

/* ========================================
   AGENDA
======================================== */

let agendaSelectedDate = new Date();


function initializeAgendaPage() {

    agendaSelectedDate =
        new Date();

    renderAgenda();

    const previousButton =
        document.getElementById("previousDay");

    const nextButton =
        document.getElementById("nextDay");


    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function () {

                agendaSelectedDate.setDate(
                    agendaSelectedDate.getDate() - 1
                );

                renderAgenda();

            }
        );

    }


    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function () {

                agendaSelectedDate.setDate(
                    agendaSelectedDate.getDate() + 1
                );

                renderAgenda();

            }
        );

    }

}


function renderAgenda() {

    const dateString =
        formatAgendaDate(agendaSelectedDate);

    const rides =
        getRides()
            .filter(function (ride) {

                return ride.date === dateString;

            })
            .sort(compareRides);


    const dateElement =
        document.getElementById("agendaDate");

    const labelElement =
        document.getElementById("agendaDayLabel");

    const countElement =
        document.getElementById("agendaRideCount");

    const container =
        document.getElementById("agendaRides");


    if (dateElement) {

        dateElement.textContent =
            agendaSelectedDate.toLocaleDateString(
                "it-IT",
                {
                    weekday: "long",
                    day: "numeric",
                    month: "long"
                }
            );

    }


    if (labelElement) {

        labelElement.textContent =
            isAgendaToday()
                ? "OGGI"
                : "PROGRAMMATO";

    }


    if (countElement) {

        countElement.textContent =
            rides.length;

    }


    if (!container) {
        return;
    }


    if (rides.length === 0) {

        container.innerHTML = `

            <div class="agenda-empty">

                <div class="agenda-empty-icon">
                    +
                </div>

                <strong>
                    Nessuna corsa
                </strong>

                <span>
                    Non ci sono corse programmate
                    per questa giornata.
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        rides
            .map(function (ride) {

                return createAgendaRideCard(ride);

            })
            .join("");

}


function createAgendaRideCard(ride) {

    const passenger =
        ride.passenger ||
        "Passeggero";

    const pickup =
        ride.pickup ||
        "Partenza non indicata";

    const destination =
        ride.destination ||
        "Destinazione non indicata";

    const time =
        ride.time ||
        "--:--";

    const passengers =
        ride.passengers ||
        1;


    let notesHTML = "";


    if (ride.notes) {

        notesHTML = `

            <div class="agenda-ride-notes">
                ${escapeHTML(ride.notes)}
            </div>

        `;

    }


    return `

        <article class="agenda-ride-card">

            <div class="agenda-ride-top">

                <strong class="agenda-ride-time">
                    ${escapeHTML(time)}
                </strong>

                <span class="ride-passengers">
                    ${escapeHTML(
                        String(passengers)
                    )} pax
                </span>

            </div>


            <div class="agenda-ride-passenger">

                ${escapeHTML(passenger)}

            </div>


            <div class="agenda-ride-route">

                <div class="agenda-route-point">

                    <span class="agenda-route-dot"></span>

                    <span>
                        ${escapeHTML(pickup)}
                    </span>

                </div>


                <div class="agenda-route-line"></div>


                <div class="agenda-route-point">

                    <span class="agenda-route-dot agenda-route-dot-end"></span>

                    <span>
                        ${escapeHTML(destination)}
                    </span>

                </div>

            </div>


            ${notesHTML}

        </article>

    `;

}


function formatAgendaDate(date) {

    return (
        date.getFullYear() +
        "-" +
        pad(date.getMonth() + 1) +
        "-" +
        pad(date.getDate())
    );

}


function isAgendaToday() {

    return (
        formatAgendaDate(agendaSelectedDate) ===
        getTodayString()
    );

}

/* ========================================
   AGENDA — CALENDARIO
======================================== */

/* ========================================
   CALENDARIO
======================================== */

let calendarDate = new Date();


function initializeCalendar() {

    const openButton =
        document.getElementById("openCalendar");

    const previousButton =
        document.getElementById("calendarPrevious");

    const nextButton =
        document.getElementById("calendarNext");

    const panel =
        document.getElementById("calendarPanel");


    if (!openButton || !panel) {
        return;
    }


    /* APERTURA / CHIUSURA */

    openButton.addEventListener(
        "click",
        function () {

            const isHidden =
                panel.classList.contains("hidden");


            if (isHidden) {

                /*
                 * Quando apro il calendario,
                 * parto sempre dal mese attuale.
                 */

                calendarDate = new Date();

                panel.classList.remove("hidden");

                renderCalendar();

            } else {

                panel.classList.add("hidden");

            }

        }
    );


    /* MESE PRECEDENTE */

    if (previousButton) {

        previousButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                calendarDate =
                    new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth() - 1,
                        1
                    );

                renderCalendar();

            }
        );

    }


    /* MESE SUCCESSIVO */

    if (nextButton) {

        nextButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                calendarDate =
                    new Date(
                        calendarDate.getFullYear(),
                        calendarDate.getMonth() + 1,
                        1
                    );

                renderCalendar();

            }
        );

    }


    /*
     * Render iniziale.
     * Così la griglia viene preparata
     * anche prima di cambiare mese.
     */

    renderCalendar();

}


/* ========================================
   RENDER CALENDARIO
======================================== */

function renderCalendar() {

    const grid =
        document.getElementById("calendarGrid");

    const monthLabel =
        document.getElementById("calendarMonth");


    if (!grid || !monthLabel) {
        return;
    }


    const year =
        calendarDate.getFullYear();

    const month =
        calendarDate.getMonth();


    monthLabel.textContent =
        capitalize(
            calendarDate.toLocaleDateString(
                "it-IT",
                {
                    month: "long",
                    year: "numeric"
                }
            )
        );


    const firstDay =
        new Date(
            year,
            month,
            1
        );


    const daysInMonth =
        new Date(
            year,
            month + 1,
            0
        ).getDate();


    /*
     * JavaScript:
     * domenica = 0
     *
     * Calendario:
     * lunedì = 0
     */

    let startDay =
        firstDay.getDay() - 1;


    if (startDay < 0) {
        startDay = 6;
    }


    const rides =
        getRides();

    const today =
        getTodayString();


    grid.innerHTML = "";


    /* CELLE VUOTE */

    for (
        let i = 0;
        i < startDay;
        i++
    ) {

        const empty =
            document.createElement("div");

        empty.className =
            "calendar-day calendar-day-empty";

        grid.appendChild(empty);

    }


    /* GIORNI DEL MESE */

    for (
        let day = 1;
        day <= daysInMonth;
        day++
    ) {

        const dateString =
            year +
            "-" +
            pad(month + 1) +
            "-" +
            pad(day);


        const dayRides =
            rides.filter(
                function (ride) {

                    return ride.date === dateString;

                }
            );


        const dayButton =
            document.createElement("button");


        dayButton.type =
            "button";


        dayButton.className =
            "calendar-day";


        /* OGGI */

        if (dateString === today) {

            dayButton.classList.add(
                "calendar-day-today"
            );

        }


        /* CONTENUTO */

        dayButton.innerHTML = `

            <span class="calendar-day-number">
                ${day}
            </span>

            ${
                dayRides.length > 0
                    ? `
                        <span class="calendar-day-rides">
                            ${dayRides.length}
                        </span>
                    `
                    : ""
            }

        `;


        /* CLICK SUL GIORNO */

        dayButton.addEventListener(
            "click",
            function () {

                selectCalendarDay(
                    dateString
                );

            }
        );


        grid.appendChild(
            dayButton
        );

    }

}


/* ========================================
   SELEZIONE GIORNO
======================================== */

function selectCalendarDay(dateString) {

    const panel =
        document.getElementById(
            "calendarPanel"
        );


    if (panel) {

        panel.classList.add(
            "hidden"
        );

    }


    updateAgendaDate(
        dateString
    );

}


/* ========================================
   AGGIORNA DATA AGENDA
======================================== */

function updateAgendaDate(dateString) {

    const dateParts =
        dateString.split("-");


    if (dateParts.length !== 3) {
        return;
    }


    const date =
        new Date(
            Number(dateParts[0]),
            Number(dateParts[1]) - 1,
            Number(dateParts[2])
        );


    const label =
        document.getElementById(
            "agendaDayLabel"
        );


    const dateElement =
        document.getElementById(
            "agendaDate"
        );


    if (label) {

        if (
            dateString ===
            getTodayString()
        ) {

            label.textContent =
                "OGGI";

        } else {

            label.textContent =
                date
                    .toLocaleDateString(
                        "it-IT",
                        {
                            weekday: "long"
                        }
                    )
                    .toUpperCase();

        }

    }


    if (dateElement) {

        dateElement.textContent =
            date.toLocaleDateString(
                "it-IT",
                {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                }
            );

    }


    renderAgendaRides(
        dateString
    );

}


/* ========================================
   CORSE AGENDA
======================================== */

function renderAgendaRides(dateString) {

    const container =
        document.getElementById(
            "agendaRides"
        );

    const countElement =
        document.getElementById(
            "agendaRideCount"
        );


    if (!container) {
        return;
    }


    const rides =
        getRides()
            .filter(
                function (ride) {

                    return ride.date === dateString;

                }
            )
            .sort(compareRides);


    if (countElement) {

        countElement.textContent =
            rides.length;

    }


    if (rides.length === 0) {

        container.innerHTML = `

            <div class="empty-list">

                <span>
                    Nessuna corsa programmata
                </span>

            </div>

        `;

        return;

    }


    container.innerHTML =
        rides
            .map(
                function (ride) {

                    return createRideCard(
                        ride,
                        false
                    );

                }
            )
            .join("");

}

/* ========================================
   PROFILO CONDUCENTE
======================================== */

function initializeProfilePage() {

    const driver = getSavedDriver();

    if (!driver) {
        window.location.href = "../index.html";
        return;
    }


    /* DATI CONDUCENTE */

    const nameElement =
        document.getElementById("profileName");

    const phoneElement =
        document.getElementById("profilePhone");

    const codeElement =
        document.getElementById("profileCode");

    const serviceElement =
        document.getElementById("profileService");


    if (nameElement) {
        nameElement.textContent =
            driver.name || "—";
    }

    if (phoneElement) {
        phoneElement.textContent =
            driver.phone || "—";
    }

    if (codeElement) {
        codeElement.textContent =
            driver.code || "—";
    }

    if (serviceElement) {
        serviceElement.textContent =
            driver.service === "taxi"
                ? "TAXI"
                : "NCC";
    }


    /* INIZIALE PROFILO */

    const initial =
        document.getElementById("profileInitial");

    if (initial && driver.name) {

        initial.textContent =
            driver.name
                .trim()
                .charAt(0)
                .toUpperCase();

    }


    /* MODIFICA PROFILO */

    const editButton =
        document.getElementById(
            "editProfileButton"
        );

    const editForm =
        document.getElementById(
            "editProfileForm"
        );

    const cancelButton =
        document.getElementById(
            "cancelEditButton"
        );


    if (editButton && editForm) {

        editButton.addEventListener(
            "click",
            function () {

                document.getElementById(
                    "editName"
                ).value = driver.name || "";

                document.getElementById(
                    "editPhone"
                ).value = driver.phone || "";

                document.getElementById(
                    "editCode"
                ).value = driver.code || "";


                editForm.classList.remove(
                    "hidden"
                );

                editButton.classList.add(
                    "hidden"
                );

            }
        );

    }


    /* SALVA MODIFICHE */

    if (editForm) {

        editForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const newName =
                    document.getElementById(
                        "editName"
                    ).value.trim();

                const newPhone =
                    document.getElementById(
                        "editPhone"
                    ).value.trim();

                const newCode =
                    document.getElementById(
                        "editCode"
                    ).value.trim();


                if (!newName || !newPhone) {
                    return;
                }


                driver.name =
                    newName;

                driver.phone =
                    newPhone;

                driver.code =
                    newCode;


                localStorage.setItem(
                    STORAGE_KEY,
                    JSON.stringify(driver)
                );


                initializeProfilePage();

            }
        );

    }


    /* ANNULLA */

    if (cancelButton && editForm) {

        cancelButton.addEventListener(
            "click",
            function () {

                editForm.classList.add(
                    "hidden"
                );

                if (editButton) {

                    editButton.classList.remove(
                        "hidden"
                    );

                }

            }
        );

    }


    /* ========================================
       STATISTICHE
    ======================================== */

    const rides =
        typeof getRides === "function"
            ? getRides()
            : [];


    const today =
        typeof getTodayString === "function"
            ? getTodayString()
            : "";


    const now =
        new Date();

    const currentYear =
        now.getFullYear();

    const currentMonth =
        now.getMonth();


    const todayRides =
        rides.filter(function (ride) {

            return ride.date === today;

        });


    const monthRides =
        rides.filter(function (ride) {

            if (!ride.date) {
                return false;
            }

            const parts =
                ride.date.split("-");

            return (
                Number(parts[0]) === currentYear &&
                Number(parts[1]) === currentMonth + 1
            );

        });


    const totalElement =
        document.getElementById(
            "totalRides"
        );

    const todayElement =
        document.getElementById(
            "todayRidesCount"
        );

    const monthElement =
        document.getElementById(
            "monthRidesCount"
        );


    if (totalElement) {
        totalElement.textContent =
            rides.length;
    }

    if (todayElement) {
        todayElement.textContent =
            todayRides.length;
    }

    if (monthElement) {
        monthElement.textContent =
            monthRides.length;
    }


    /* ========================================
       AREA SVILUPPATORE
    ======================================== */

    const developerSection =
        document.getElementById(
            "developerServiceSection"
        );


    if (
        developerSection &&
        driver.role === "developer"
    ) {

        developerSection.classList.remove(
            "hidden"
        );

    }


    const switchTaxiButton =
        document.getElementById(
            "switchTaxiButton"
        );

    const switchNccButton =
        document.getElementById(
            "switchNccButton"
        );


    if (switchTaxiButton) {

        switchTaxiButton.addEventListener(
            "click",
            function () {

                switchDeveloperService(
                    "taxi"
                );

            }
        );

    }


    if (switchNccButton) {

        switchNccButton.addEventListener(
            "click",
            function () {

                switchDeveloperService(
                    "ncc"
                );

            }
        );

    }


    /* ========================================
       LOGOUT
    ======================================== */

    const logoutButton =
        document.getElementById(
            "logoutButton"
        );


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function () {

                localStorage.removeItem(
                    STORAGE_KEY
                );

                window.location.href =
                    "../index.html";

            }
        );

    }

}


/* ========================================
   CAMBIO SERVIZIO SVILUPPATORE
======================================== */

function switchDeveloperService(service) {

    const driver =
        getSavedDriver();


    if (
        !driver ||
        driver.role !== "developer"
    ) {

        return;

    }


    if (
        service !== "taxi" &&
        service !== "ncc"
    ) {

        return;

    }


    driver.service =
        service;


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(driver)
    );


    window.location.href =
        service === "taxi"
            ? "home.html"
            : "../ncc/home.html";

}
