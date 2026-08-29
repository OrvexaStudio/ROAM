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

function initializePage(driver) {

    updateDriverInterface(driver);

    if (document.getElementById("rideForm")) {
        initializeNewRidePage();
    }

    if (document.getElementById("todayRides")) {
        initializeHomePage();
    }

}
