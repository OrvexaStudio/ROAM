"use strict";

const STORAGE_KEY = "taxipilot_driver";

let selectedService = null;


/* ========================================
   AVVIO
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const serviceStep =
        document.getElementById("serviceStep");

    const driverStep =
        document.getElementById("driverStep");

    const serviceButtons =
        document.querySelectorAll(".service-option");

    const backButton =
        document.getElementById("backButton");

    const driverForm =
        document.getElementById("driverForm");

    const selectedService =
        document.getElementById("selectedService");


    /*
     * Se il conducente è già stato configurato,
     * entra direttamente nella dashboard.
     */

    const savedDriver =
        getSavedDriver();


    if (savedDriver) {

        redirectToDashboard(
            savedDriver.service
        );

        return;

    }


    /*
     * Scelta TAXI / NCC
     */

    serviceButtons.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const service =
                    button.dataset.service;


                if (
                    service !== "taxi" &&
                    service !== "ncc"
                ) {

                    return;

                }


                window.selectedTaxiPilotService =
                    service;


                selectedServiceValue(service);

                serviceStep.classList.add(
                    "is-hidden"
                );

                driverStep.classList.remove(
                    "is-hidden"
                );


                const nameInput =
                    document.getElementById(
                        "driverName"
                    );


                if (nameInput) {

                    setTimeout(
                        function () {

                            nameInput.focus();

                        },
                        100
                    );

                }

            }
        );

    });


    /*
     * Torna alla scelta TAXI / NCC
     */

    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                selectedServiceValue(null);

                driverStep.classList.add(
                    "is-hidden"
                );

                serviceStep.classList.remove(
                    "is-hidden"
                );

            }
        );

    }


    /*
     * Salvataggio dati conducente
     */

    if (driverForm) {

        driverForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const service =
                    window.selectedTaxiPilotService;


                if (
                    service !== "taxi" &&
                    service !== "ncc"
                ) {

                    return;

                }


                const nameInput =
                    document.getElementById(
                        "driverName"
                    );

                const phoneInput =
                    document.getElementById(
                        "driverPhone"
                    );

                const codeInput =
                    document.getElementById(
                        "driverCode"
                    );


                const name =
                    nameInput
                        ? nameInput.value.trim()
                        : "";


                const phone =
                    phoneInput
                        ? phoneInput.value.trim()
                        : "";


                const code =
                    codeInput
                        ? codeInput.value.trim()
                        : "";


                if (!name || !phone) {

                    return;

                }


                const driver = {

                    service: service,

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
                        "Errore nel salvataggio:",
                        error
                    );

                    return;

                }


                redirectToDashboard(
                    service
                );

            }
        );

    }

});


/* ========================================
   SERVIZIO SELEZIONATO
======================================== */

function selectedServiceValue(service) {

    selectedService =
        service;


    const label =
        document.getElementById(
            "selectedService"
        );


    if (!label) {

        return;

    }


    if (service === "taxi") {

        label.textContent = "TAXI";

        return;

    }


    if (service === "ncc") {

        label.textContent = "NCC";

        return;

    }


    label.textContent = "TAXI";

}


/* ========================================
   DATI SALVATI
======================================== */

function getSavedDriver() {

    const saved =
        localStorage.getItem(
            STORAGE_KEY
        );


    if (!saved) {

        return null;

    }


    try {

        const driver =
            JSON.parse(saved);


        if (
            !driver ||
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
   DASHBOARD
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
   RESET
======================================== */

function resetTaxiPilot() {

    localStorage.removeItem(
        STORAGE_KEY
    );


    window.location.href =
        "index.html";

}
