
"use strict";

/*
 * TaxiPilot
 * Cooperativa Taxi Lecce
 *
 * Primo accesso:
 * 1. scelta TAXI / NCC
 * 2. dati conducente
 * 3. salvataggio locale
 * 4. apertura dashboard corretta
 */

const STORAGE_KEY = "taxipilot_driver";

let selectedService = null;


/* ========================================
   ELEMENTI DOM
======================================== */

const serviceStep = document.getElementById("serviceStep");
const driverStep = document.getElementById("driverStep");

const serviceButtons =
    document.querySelectorAll(".service-option");

const backButton =
    document.getElementById("backButton");

const driverForm =
    document.getElementById("driverForm");

const selectedServiceLabel =
    document.getElementById("selectedService");


/* ========================================
   AVVIO
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    initializeLogin();

});


function initializeLogin() {

    const savedDriver =
        getSavedDriver();

    if (savedDriver) {

        redirectToDashboard(
            savedDriver.service
        );

        return;
    }


    showServiceStep();

    setupEvents();

}


/* ========================================
   EVENTI
======================================== */

function setupEvents() {


    serviceButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const service =
                    button.dataset.service;

                selectService(service);

            }
        );

    });


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                showServiceStep();

            }
        );

    }


    if (driverForm) {

        driverForm.addEventListener(
            "submit",
            handleDriverSubmit
        );

    }

}


/* ========================================
   SCELTA TAXI / NCC
======================================== */

function selectService(service) {

    if (
        service !== "taxi" &&
        service !== "ncc"
    ) {

        return;

    }


    selectedService = service;


    if (selectedServiceLabel) {

        selectedServiceLabel.textContent =
            service === "taxi"
                ? "TAXI"
                : "NCC";

    }


    showDriverStep();

}


function showServiceStep() {

    selectedService = null;


    if (serviceStep) {

        serviceStep.classList.remove(
            "is-hidden"
        );

    }


    if (driverStep) {

        driverStep.classList.add(
            "is-hidden"
        );

    }

}


function showDriverStep() {

    if (serviceStep) {

        serviceStep.classList.add(
            "is-hidden"
        );

    }


    if (driverStep) {

        driverStep.classList.remove(
            "is-hidden"
        );

    }


    const nameInput =
        document.getElementById("driverName");


    if (nameInput) {

        setTimeout(function () {

            nameInput.focus();

        }, 100);

    }

}


/* ========================================
   SALVATAGGIO CONDUCENTE
======================================== */

function handleDriverSubmit(event) {

    event.preventDefault();


    if (!selectedService) {

        return;

    }


    const nameInput =
        document.getElementById("driverName");

    const phoneInput =
        document.getElementById("driverPhone");

    const codeInput =
        document.getElementById("driverCode");


    if (
        !nameInput ||
        !phoneInput ||
        !codeInput
    ) {

        return;

    }


    const name =
        nameInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const code =
        codeInput.value.trim();


    if (!name || !phone) {

        return;

    }


    const driver = {

        service: selectedService,

        name: name,

        phone: phone,

        code: code,

        createdAt:
            new Date().toISOString()

    };


    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(driver)
        );

    } catch (error) {

        console.error(
            "Impossibile salvare i dati:",
            error
        );

        return;

    }


    redirectToDashboard(
        selectedService
    );

}


/* ========================================
   DATI SALVATI
======================================== */

function getSavedDriver() {

    const raw =
        localStorage.getItem(STORAGE_KEY);


    if (!raw) {

        return null;

    }


    try {

        const driver =
            JSON.parse(raw);


        if (
            !driver ||
            !driver.service ||
            !driver.name ||
            !driver.phone
        ) {

            localStorage.removeItem(
                STORAGE_KEY
            );

            return null;

        }


        if (
            driver.service !== "taxi" &&
            driver.service !== "ncc"
        ) {

            localStorage.removeItem(
                STORAGE_KEY
            );

            return null;

        }


        return driver;

    } catch (error) {

        console.error(
            "Configurazione non valida:",
            error
        );

        localStorage.removeItem(
            STORAGE_KEY
        );

        return null;

    }

}


/* ========================================
   REDIRECT DASHBOARD
======================================== */

function redirectToDashboard(service) {

    if (service === "taxi") {

        window.location.href =
            "taxi/home.html";

        return;

    }


    if (service === "ncc") {

        window.location.href =
            "ncc/home.html";

    }

}


/* ========================================
   FUNZIONE UTILE
======================================== */

function resetTaxiPilot() {

    localStorage.removeItem(
        STORAGE_KEY
    );

    window.location.href =
        "index.html";

}
```
