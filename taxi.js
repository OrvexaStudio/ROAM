"use strict";

/*
 * TaxiPilot
 * Area TAXI
 *
 * Gestione:
 * - conducente
 * - saluto
 * - data
 * - corse salvate
 * - prossima corsa
 * - corse della giornata
 */

const DRIVER_STORAGE_KEY = "taxipilot_driver";
const RIDES_STORAGE_KEY = "taxipilot_taxi_rides";


document.addEventListener("DOMContentLoaded", function () {

    initializeTaxiHome();

});


/* ========================================
   AVVIO
======================================== */

function initializeTaxiHome() {

    const driver = getDriver();

    if (!driver) {

        window.location.href = "../index.html";

        return;

    }


    updateDriverInterface(driver);

    updateDate();

    renderTaxiHome();

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

        const driver =
            JSON.parse(saved);


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
            "Errore nella lettura del conducente:",
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
   NOME
======================================== */

function getFirstName(name) {

    if (!name) {

        return "Conducente";

    }


    const cleanName =
        name.trim();


    if (!cleanName) {

        return "Conducente";

    }


    return cleanName.split(/\s+/)[0];

}


/* ========================================
   INIZIALE
======================================== */

function getInitial(name) {

    if (!name) {

        return "C";

    }


    const cleanName =
        name.trim();


    if (!cleanName) {

        return "C";

    }


    return cleanName
        .charAt(0)
        .toUpperCase();

}


/* ========================================
   SALUTO
======================================== */

function updateGreeting() {

    const greetingElement =
        document.getElementById(
            "headerGreeting"
        );


    if (!greetingElement) {

        return;

    }


    const hour =
        new Date().getHours();


    let greeting;


    if (hour < 5) {

        greeting = "Buonanotte";

    } else if (hour < 13) {

        greeting = "Buongiorno";

    } else if (hour < 18) {

        greeting = "Buon pomeriggio";

    } else {

        greeting = "Buonasera";

    }


    greetingElement.textContent =
        greeting;

}


/* ========================================
   DATA
======================================== */

function updateDate() {

    const dateElement =
        document.getElementById(
            "currentDate"
        );


    if (!dateElement) {

        return;

    }


    const today =
        new Date();


    const formattedDate =
        today.toLocaleDateString(
            "it-IT",
            {
                weekday: "long",
                day: "numeric",
                month: "long"
            }
        );


    dateElement.textContent =
        capitalizeFirstLetter(
            formattedDate
        );

}


/* ========================================
   CORSE
======================================== */

function getRides() {

    const saved =
        localStorage.getItem(
            RIDES_STORAGE_KEY
        );


    if (!saved) {

        return [];

    }


    try {

        const rides =
            JSON.parse(saved);


        if (!Array.isArray(rides)) {

            return [];

        }


        return rides;

    } catch (error) {

        console.error(
            "Errore nella lettura delle corse:",
            error
        );

        return [];

    }

}


/* ========================================
   HOME CORSE
======================================== */

function renderTaxiHome() {

    const rides =
        getRides();


    const todayRides =
        getTodayRides(rides);


    const rideCount =
        document.getElementById(
            "rideCount"
        );


    if (rideCount) {

        rideCount.textContent =
            todayRides.length;

    }


    renderTodayRides(todayRides);

    renderNextRide(todayRides);

}


/* ========================================
   CORSE DI OGGI
======================================== */

function getTodayRides(rides) {

    const today =
        new Date();


    const year =
        today.getFullYear();

    const month =
        String(
            today.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            today.getDate()
        ).padStart(2, "0");


    const todayString =
        `${year}-${month}-${day}`;


    return rides
        .filter(function (ride) {

            return ride.date === todayString;

        })
        .sort(function (a, b) {

            return getRideTimeValue(a)
                - getRideTimeValue(b);

        });

}


/* ========================================
   ORDINAMENTO ORARIO
======================================== */

function getRideTimeValue(ride) {

    if (!ride.time) {

        return 999999;

    }


    const parts =
        ride.time.split(":");


    const hours =
        Number(parts[0]) || 0;

    const minutes =
        Number(parts[1]) || 0;


    return (
        hours * 60 +
        minutes
    );

}


/* ========================================
   PROSSIMA CORSA
======================================== */

function renderNextRide(rides) {

    const container =
        document.getElementById(
            "nextRide"
        );


    if (!container) {

        return;

    }


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    const nextRide =
        rides.find(function (ride) {

            return getRideTimeValue(ride)
                >= currentMinutes;

        });


    if (!nextRide) {

        container.innerHTML = `

            <div class="empty-ride">

                <div class="empty-ride-icon">
                    +
                </div>

                <div>

                    <strong>
                        Nessuna corsa in programma
                    </strong>

                    <span>
                        Puoi aggiungerne una nuova.
                    </span>

                </div>

            </div>

        `;

        return;

    }


    container.innerHTML =
        createRideCard(
            nextRide,
            true
        );

}


/* ========================================
   LISTA OGGI
======================================== */

function renderTodayRides(rides) {

    const container =
        document.getElementById(
            "todayRides"
        );


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

function createRideCard(
    ride,
    featured
) {

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


    const featuredClass =
        featured
            ? " ride-card-featured"
            : "";


    return `

        <article class="ride-card${featuredClass}">

            <div class="ride-card-top">

                <strong class="ride-time">
                    ${escapeHTML(time)}
                </strong>

                <span class="ride-passengers">
                    ${escapeHTML(String(passengers))}
                    ${passengers === 1 ? "pax" : "pax"}
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
   SICUREZZA HTML
======================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* ========================================
   UTILITÀ
======================================== */

function capitalizeFirstLetter(text) {

    if (!text) {

        return "";

    }


    return (
        text.charAt(0).toUpperCase() +
        text.slice(1)
    );

}
