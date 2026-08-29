"use strict";

const STORAGE_KEY = "taxipilot_driver";

let selectedService = null;


/* ========================================
   AUTORIZZAZIONI
======================================== */

const AUTHORIZED_DRIVERS = {

    cristian: {
        service: "taxi",
        password: "Taxilecce18!"
    },

    manuela: {
        service: "ncc",
        password: "NCClecce18!"
    }

};


/* ========================================
   AVVIO
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const serviceStep =
        document.getElementById("serviceStep");

    const driverStep =
        document.getElementById("driverStep");

    const passwordStep =
        document.getElementById("passwordStep");

    const serviceButtons =
        document.querySelectorAll(".service-option");

    const backButton =
        document.getElementById("backButton");

    const passwordBackButton =
        document.getElementById("passwordBackButton");

    const driverForm =
        document.getElementById("driverForm");

    const passwordForm =
        document.getElementById("passwordForm");


    /* ========================================
       CONDUCENTE GIÀ CONFIGURATO
    ======================================== */

    const savedDriver =
        getSavedDriver();


    if (savedDriver) {

        showPasswordStep(
            savedDriver.service,
            savedDriver.name
        );

        return;

    }


    /* ========================================
       SCELTA SERVIZIO
    ======================================== */

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


    /* ========================================
       INDIETRO
    ======================================== */

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


    /* ========================================
       DATI CONDUCENTE
    ======================================== */

    if (driverForm) {

        driverForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const service =
                    window.selectedTaxiPilotService;


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


                const errorElement =
                    document.getElementById(
                        "loginError"
                    );


                if (errorElement) {
                    errorElement.textContent = "";
                }


                if (!name || !phone) {

                    if (errorElement) {

                        errorElement.textContent =
                            "Inserisci tutti i dati richiesti.";

                    }

                    return;

                }


                const normalizedName =
                    name
                        .trim()
                        .toLowerCase();


                const authorizedDriver =
                    AUTHORIZED_DRIVERS[
                        normalizedName
                    ];


                /* ========================================
                   NOME NON AUTORIZZATO
                ======================================== */

                if (!authorizedDriver) {

                    if (errorElement) {

                        errorElement.textContent =
                            "Accesso non autorizzato. Il nominativo inserito non risulta associato alla Cooperativa Taxi Lecce.";

                    }

                    return;

                }


                /* ========================================
                   SERVIZIO NON AUTORIZZATO
                ======================================== */

                if (
                    authorizedDriver.service !==
                    service
                ) {

                    if (errorElement) {

                        errorElement.textContent =
                            "Accesso negato. Non disponi dell'autorizzazione per accedere a questo servizio.";

                    }

                    return;

                }


                /* ========================================
                   PASSA ALLA PASSWORD
                ======================================== */

                const driver = {

                    service: service,

                    name: name,

                    phone: phone,

                    code: code,

                    createdAt:
                        new Date().toISOString()

                };


                window.pendingTaxiPilotDriver =
                    driver;


                showPasswordStep(
                    service,
                    name
                );

            }
        );

    }


    /* ========================================
       TORNA AI DATI
    ======================================== */

    if (passwordBackButton) {

        passwordBackButton.addEventListener(
            "click",
            function () {

                const passwordStep =
                    document.getElementById(
                        "passwordStep"
                    );


                if (passwordStep) {

                    passwordStep.classList.add(
                        "is-hidden"
                    );

                }


                if (driverStep) {

                    driverStep.classList.remove(
                        "is-hidden"
                    );

                }


                const passwordInput =
                    document.getElementById(
                        "driverPassword"
                    );


                if (passwordInput) {

                    passwordInput.value = "";

                }

            }
        );

    }


    /* ========================================
       PASSWORD
    ======================================== */

    if (passwordForm) {

        passwordForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();


                const passwordInput =
                    document.getElementById(
                        "driverPassword"
                    );


                const errorElement =
                    document.getElementById(
                        "passwordError"
                    );


                const password =
                    passwordInput
                        ? passwordInput.value
                        : "";


                if (errorElement) {
                    errorElement.textContent = "";
                }


                const driver =
                    window.pendingTaxiPilotDriver;


                if (!driver) {

                    return;

                }


                const normalizedName =
                    driver.name
                        .trim()
                        .toLowerCase();


                const authorizedDriver =
                    AUTHORIZED_DRIVERS[
                        normalizedName
                    ];


                if (!authorizedDriver) {

                    return;

                }


                if (
                    password !==
                    authorizedDriver.password
                ) {

                    if (errorElement) {

                        errorElement.textContent =
                            "Password non valida. La password inserita non è corretta.";

                    }

                    return;

                }


                /* ========================================
                   ACCESSO RIUSCITO
                ======================================== */

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
                    driver.service
                );

            }
        );

    }

});


/* ========================================
   MOSTRA PASSWORD
======================================== */

function showPasswordStep(
    service,
    name
) {

    const serviceStep =
        document.getElementById(
            "serviceStep"
        );

    const driverStep =
        document.getElementById(
            "driverStep"
        );

    const passwordStep =
        document.getElementById(
            "passwordStep"
        );


    if (serviceStep) {

        serviceStep.classList.add(
            "is-hidden"
        );

    }


    if (driverStep) {

        driverStep.classList.add(
            "is-hidden"
        );

    }


    if (passwordStep) {

        passwordStep.classList.remove(
            "is-hidden"
        );

    }


    const serviceLabel =
        document.getElementById(
            "passwordService"
        );


    if (serviceLabel) {

        serviceLabel.textContent =
            service === "taxi"
                ? "TAXI"
                : "NCC";

    }


    const passwordInput =
        document.getElementById(
            "driverPassword"
        );


    if (passwordInput) {

        setTimeout(
            function () {

                passwordInput.focus();

            },
            100
        );

    }

}


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

        label.textContent =
            "TAXI";

        return;

    }


    if (service === "ncc") {

        label.textContent =
            "NCC";

        return;

    }


    label.textContent =
        "TAXI";

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
