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

    const original = text.trim();

    const normalized = original
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();


    /* ========================================
       TELEFONO
    ======================================== */

    const phoneRegex =
        /(?:\+39[\s.-]?)?(?:3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|0\d{1,3}[\s.-]?\d{5,8})/;

    const phoneMatch =
        normalized.match(phoneRegex);

    if (phoneMatch) {

        result.passengerPhone =
            phoneMatch[0]
                .replace(/\s+/g, " ")
                .trim();

    }


    /* ========================================
       PASSEGGERI
    ======================================== */

    const passengerCountPatterns = [

        /\b(\d{1,2})\s*(?:pax)\b/i,

        /\b(\d{1,2})\s*(?:passegger[oi])\b/i,

        /\b(\d{1,2})\s*(?:persone)\b/i,

        /\b(?:per|con)\s*(\d{1,2})\s*(?:persone|passegger[oi]|pax)\b/i

    ];


    for (const pattern of passengerCountPatterns) {

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

    const timePatterns = [

        /\b(?:alle|ore|h)\s*(\d{1,2})[:.](\d{2})\b/i,

        /\b(\d{1,2})[:.](\d{2})\b/,

        /\b(?:alle|ore|h)\s*(\d{1,2})\s*(?:e\s*)?(?:mezza|30)\b/i,

        /\b(\d{1,2})\s*e\s*mezza\b/i

    ];


    for (const pattern of timePatterns) {

        const match =
            normalized.match(pattern);

        if (!match) {
            continue;
        }


        let hour =
            Number(match[1]);

        let minute =
            match[2]
                ? Number(match[2])
                : 30;


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

            break;

        }

    }


    /* ========================================
       ORARIO PARLATO
       "otto e trenta"
    ======================================== */

    if (!result.time) {

        const spokenTime =
            normalized.match(
                /\b(?:alle|ore)?\s*(uno|due|tre|quattro|cinque|sei|sette|otto|nove|dieci|undici|dodici|tredici|quattordici|quindici|sedici|diciassette|diciotto|diciannove|venti|ventuno|ventidue|ventitré|ventitre)\s*(?:e\s*(trenta|mezza))?\b/i
            );


        if (spokenTime) {

            const numbers = {

                uno: 1,
                due: 2,
                tre: 3,
                quattro: 4,
                cinque: 5,
                sei: 6,
                sette: 7,
                otto: 8,
                nove: 9,
                dieci: 10,
                undici: 11,
                dodici: 12,
                tredici: 13,
                quattordici: 14,
                quindici: 15,
                sedici: 16,
                diciassette: 17,
                diciotto: 18,
                diciannove: 19,
                venti: 20,
                ventuno: 21,
                ventidue: 22,
                ventitre: 23,
                "ventitré": 23

            };


            const hour =
                numbers[
                    spokenTime[1].toLowerCase()
                ];


            const minute =
                spokenTime[2]
                    ? 30
                    : 0;


            if (hour !== undefined) {

                result.time =
                    pad(hour) +
                    ":" +
                    pad(minute);

            }

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

        const dateMatch =
            normalized.match(
                /\b(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?\b/
            );


        if (dateMatch) {

            let year =
                dateMatch[3]
                    ? Number(dateMatch[3])
                    : new Date().getFullYear();


            if (year < 100) {
                year += 2000;
            }


            result.date =
                year +
                "-" +
                pad(dateMatch[2]) +
                "-" +
                pad(dateMatch[1]);

        }

    }


    /* ========================================
       PARTENZA
    ======================================== */

    const pickupPatterns = [

        /(?:partenza|ritiro|pickup)\s*[:\-]?\s*(.+?)(?=\s+(?:destinazione|arrivo|a|verso|per|alle|ore|h)\b|$)/i,

        /(?:prendi|prendere|passa a prendere|ritira|ritirare)\s+(?:il cliente|la persona|il passeggero)?\s*(?:a|in|da)?\s*(.+?)(?=\s+(?:e poi|poi|destinazione|arrivo|a|verso|per|alle|ore|h)\b|$)/i,

        /\bda\s+(.+?)\s+(?=\ba\b|\bverso\b|\bfino a\b|\bper\b)/i

    ];


    for (const pattern of pickupPatterns) {

        const match =
            normalized.match(pattern);

        if (match) {

            const location =
                cleanLocationAdvanced(
                    match[1]
                );

            if (location) {

                result.pickup =
                    location;

                break;

            }

        }

    }


    /* ========================================
       DESTINAZIONE
    ======================================== */

    const destinationPatterns = [

        /(?:destinazione|arrivo)\s*[:\-]?\s*(.+?)(?=\s+(?:alle|ore|h|domani|oggi|dopodomani|cliente|passeggero|telefono|tel|note|nota)\b|$)/i,

        /(?:a|verso|fino a|per)\s+(.+?)(?=\s+(?:alle|ore|h|domani|oggi|dopodomani|cliente|passeggero|telefono|tel|note|nota)\b|$)/i

    ];


    for (const pattern of destinationPatterns) {

        const match =
            normalized.match(pattern);

        if (match) {

            const location =
                cleanLocationAdvanced(
                    match[1]
                );

            if (location) {

                result.destination =
                    location;

                break;

            }

        }

    }


    /* ========================================
       ROUTE "DA X A Y"
    ======================================== */

    if (
        !result.pickup ||
        !result.destination
    ) {

        const routeMatch =
            normalized.match(
                /\bda\s+(.+?)\s+\ba\s+(.+?)(?=\s+(?:alle|ore|h|domani|oggi|dopodomani)\b|$)/i
            );


        if (routeMatch) {

            if (!result.pickup) {

                result.pickup =
                    cleanLocationAdvanced(
                        routeMatch[1]
                    );

            }


            if (!result.destination) {

                result.destination =
                    cleanLocationAdvanced(
                        routeMatch[2]
                    );

            }

        }

    }


    /* ========================================
       NOME PASSEGGERO
    ======================================== */

    const namePatterns = [

        /(?:cliente|passeggero|passeggera|signor|signora|sig\.|sig\.ra)\s*[:\-]?\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,3})/i,

        /(?:a nome di|nome)\s*[:\-]?\s*([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,3})/i

    ];


    for (const pattern of namePatterns) {

        const match =
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
     * Se il nome non ha una parola chiave,
     * cerchiamo una sequenza di 2-3 parole
     * che assomigli a nome + cognome.
     */

    if (!result.passenger) {

        const withoutPhone =
            normalized.replace(
                phoneRegex,
                ""
            );


        const possibleName =
            withoutPhone.match(
                /\b([A-ZÀ-Ý][a-zà-ÿ]+)\s+([A-ZÀ-Ý][a-zà-ÿ]+)\b/
            );


        if (possibleName) {

            const candidate =
                possibleName[0];


            const forbiddenWords = [

                "Aeroporto",
                "Stazione",
                "Via",
                "Viale",
                "Piazza",
                "Partenza",
                "Destinazione",
                "Domani",
                "Oggi",
                "Buongiorno",
                "Buonasera"

            ];


            if (
                !forbiddenWords.some(
                    function (word) {

                        return candidate
                            .toLowerCase()
                            .includes(
                                word.toLowerCase()
                            );

                    }
                )
            ) {

                result.passenger =
                    candidate;

            }

        }

    }


    /* ========================================
       NOTE
    ======================================== */

    const notesMatch =
        normalized.match(
            /(?:note|nota|attenzione)\s*[:\-]?\s*(.+)$/i
        );


    if (notesMatch) {

        result.notes =
            notesMatch[1]
                .trim();

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
