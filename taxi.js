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


    const cleanText =
        normalizeText(text);


    /*
     * TELEFONO
     */

    const phoneMatch =
        cleanText.match(
            /(?:\+39[\s.-]?)?(?:3\d{2}[\s.-]?\d{3}[\s.-]?\d{4}|0\d{1,3}[\s.-]?\d{5,8})/
        );


    if (phoneMatch) {

        result.passengerPhone =
            phoneMatch[0].trim();

    }


    /*
     * PASSEGGERI
     */

    const passengerMatch =
        cleanText.match(
            /(?:^|\s)(\d{1,2})\s*(?:pax|passegger[io]|persone)(?:\s|$)/i
        );


    if (passengerMatch) {

        result.passengers =
            passengerMatch[1];

    }


    /*
     * ORARIO
     */

    const timeMatch =
        cleanText.match(
            /(?:alle|ore|h)?\s*(\d{1,2})[:.](\d{2})/i
        );


    if (timeMatch) {

        result.time =
            pad(timeMatch[1]) +
            ":" +
            pad(timeMatch[2]);

    } else {

        const simpleTime =
            cleanText.match(
                /(?:alle|ore|h)\s*(\d{1,2})(?:\s|$)/i
            );

        if (simpleTime) {

            result.time =
                pad(simpleTime[1]) +
                ":00";

        }

    }


    /*
     * DATA
     */

    if (
        /\bdomani\b/i.test(cleanText)
    ) {

        result.date =
            addDays(
                new Date(),
                1
            );

    } else if (
        /\bdopodomani\b/i.test(cleanText)
    ) {

        result.date =
            addDays(
                new Date(),
                2
            );

    } else {

        const dateMatch =
            cleanText.match(
                /(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/
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


    /*
     * NOME
     */

    const namePatterns = [

        /(?:cliente|passeggero|signor|signora|sig\.|sig\.ra)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,3})/i,

        /(?:per|a nome di)\s+([A-Za-zÀ-ÿ]+(?:\s+[A-Za-zÀ-ÿ]+){0,3})/i

    ];


    for (
        let i = 0;
        i < namePatterns.length;
        i++
    ) {

        const match =
            cleanText.match(
                namePatterns[i]
            );


        if (match) {

            result.passenger =
                cleanExtractedName(
                    match[1]
                );

            break;

        }

    }


    /*
     * PARTENZA
     */

    const pickupPatterns = [

        /(?:partenza|ritiro|pickup|prendere|prendiamo|da)\s*[:\-]?\s*(.+?)(?=\s+(?:destinazione|arrivo|a|fino a|per)\s+)/i,

        /(?:da)\s+(.+?)\s+(?:a|fino a|per)\s+/i

    ];


    for (
        let i = 0;
        i < pickupPatterns.length;
        i++
    ) {

        const match =
            cleanText.match(
                pickupPatterns[i]
            );


        if (match) {

            result.pickup =
                cleanLocation(
                    match[1]
                );

            break;

        }

    }


    /*
     * DESTINAZIONE
     */

    const destinationPatterns = [

        /(?:destinazione|arrivo|fino a|a)\s*[:\-]?\s*(.+?)(?=\s+(?:alle|ore|h|\d{1,2}\s*(?:pax|passegger[io]|persone)|telefono|tel|cliente|passeggero|partenza|da)\b|[,.]?$)/i,

        /(?:verso|per)\s+(.+?)(?=\s+(?:alle|ore|h)\b|[,.]?$)/i

    ];


    for (
        let i = 0;
        i < destinationPatterns.length;
        i++
    ) {

        const match =
            cleanText.match(
                destinationPatterns[i]
            );


        if (match) {

            result.destination =
                cleanLocation(
                    match[1]
                );

            break;

        }

    }


    /*
     * Se abbiamo "da X a Y"
     */

    if (
        !result.pickup ||
        !result.destination
    ) {

        const routeMatch =
            cleanText.match(
                /(?:da)\s+(.+?)\s+(?:a|verso)\s+(.+?)(?=\s+(?:alle|ore|h)\b|[,.]?$)/i
            );


        if (routeMatch) {

            if (!result.pickup) {

                result.pickup =
                    cleanLocation(
                        routeMatch[1]
                    );

            }

            if (!result.destination) {

                result.destination =
                    cleanLocation(
                        routeMatch[2]
                    );

            }

        }

    }


    /*
     * NOTE
     */

    const noteMatch =
        cleanText.match(
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
                event.results[0][0].transcript;


            const textInput =
                document.getElementById(
                    "rideTextInput"
                );


            if (textInput) {

                textInput.value =
                    transcript;

            }


            const result =
                parseRideText(
                    transcript
                );


            fillRideForm(result);


            setVoiceStatus(
                getAnalysisMessage(result)
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
