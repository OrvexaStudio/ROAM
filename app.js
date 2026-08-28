```javascript
/*
    COOPERATIVA TAXI LECCE
    Applicazione locale
    Nessun server
    Nessuna API
*/

const STORAGE_KEY = "ctl_driver_config";

let selectedService = null;
let currentPage = "home";


/* =========================
   DOM
========================= */

const onboarding = document.getElementById("onboarding");
const driverSetup = document.getElementById("driverSetup");
const mainApp = document.getElementById("mainApp");

const driverForm = document.getElementById("driverForm");

const selectedServiceLabel =
    document.getElementById("selectedServiceLabel");

const headerService =
    document.getElementById("headerService");

const headerGreeting =
    document.getElementById("headerGreeting");

const profileInitial =
    document.getElementById("profileInitial");

const profileAvatar =
    document.getElementById("profileAvatar");

const profileName =
    document.getElementById("profileName");

const profileService =
    document.getElementById("profileService");

const profilePhone =
    document.getElementById("profilePhone");

const profileLicense =
    document.getElementById("profileLicense");

const listEyebrow =
    document.getElementById("listEyebrow");

const listTitle =
    document.getElementById("listTitle");

const listNavLabel =
    document.getElementById("listNavLabel");

const todayItemsTitle =
    document.getElementById("todayItemsTitle");

const homeDescription =
    document.getElementById("homeDescription");

const nextItemLabel =
    document.getElementById("nextItemLabel");

const modalEyebrow =
    document.getElementById("modalEyebrow");

const modalTitle =
    document.getElementById("modalTitle");

const newItemModal =
    document.getElementById("newItemModal");


/* =========================
   INITIALIZATION
========================= */

document.addEventListener("DOMContentLoaded", () => {

    const savedConfig =
        localStorage.getItem(STORAGE_KEY);

    if (savedConfig) {

        try {

            const config =
                JSON.parse(savedConfig);

            loadApplication(config);

        } catch (error) {

            localStorage.removeItem(STORAGE_KEY);

            showOnboarding();

        }

    } else {

        showOnboarding();

    }

    setupEvents();

});


/* =========================
   ONBOARDING
========================= */

function showOnboarding() {

    onboarding.classList.remove("hidden");
    driverSetup.classList.add("hidden");
    mainApp.classList.add("hidden");

}


function showDriverSetup(service) {

    selectedService = service;

    onboarding.classList.add("hidden");
    driverSetup.classList.remove("hidden");

    selectedServiceLabel.textContent =
        service === "taxi" ? "TAXI" : "NCC";

}


function showOnboardingAgain() {

    onboarding.classList.remove("hidden");
    driverSetup.classList.add("hidden");
    mainApp.classList.add("hidden");

    selectedService = null;

}


/* =========================
   SAVE CONFIG
========================= */

driverForm.addEventListener("submit", (event) => {

    event.preventDefault();

    if (!selectedService) {
        return;
    }

    const name =
        document.getElementById("driverName").value.trim();

    const phone =
        document.getElementById("driverPhone").value.trim();

    const license =
        document.getElementById("driverLicense").value.trim();


    const config = {

        service: selectedService,

        name: name,

        phone: phone,

        license: license,

        createdAt: new Date().toISOString()

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(config)
    );


    loadApplication(config);

});


/* =========================
   LOAD APPLICATION
========================= */

function loadApplication(config) {

    onboarding.classList.add("hidden");
    driverSetup.classList.add("hidden");
    mainApp.classList.remove("hidden");


    selectedService = config.service;


    updateInterface(config);


    navigateTo("home");

}


/* =========================
   UPDATE INTERFACE
========================= */

function updateInterface(config) {

    const isTaxi =
        config.service === "taxi";


    const serviceName =
        isTaxi ? "TAXI" : "NCC";


    headerService.textContent =
        serviceName;


    profileService.textContent =
        serviceName;


    listEyebrow.textContent =
        isTaxi ? "CORSE" : "SERVIZI";


    listTitle.textContent =
        isTaxi
            ? "Le tue corse"
            : "I tuoi servizi";


    listNavLabel.textContent =
        isTaxi ? "Corse" : "Servizi";


    todayItemsTitle.textContent =
        isTaxi
            ? "Le tue corse"
            : "I tuoi servizi";


    homeDescription.textContent =
        isTaxi
            ? "Ecco il riepilogo delle tue corse."
            : "Ecco il riepilogo dei tuoi servizi.";


    nextItemLabel.textContent =
        isTaxi
            ? "PROSSIMA CORSA"
            : "PROSSIMO SERVIZIO";


    profileName.textContent =
        config.name || "Conducente";


    profilePhone.textContent =
        config.phone || "—";


    profileLicense.textContent =
        config.license || "—";


    const initial =
        getInitial(config.name);


    profileInitial.textContent =
        initial;


    profileAvatar.textContent =
        initial;


    updateGreeting();

}


/* =========================
   GREETING
========================= */

function updateGreeting() {

    const hour =
        new Date().getHours();


    let greeting = "Buongiorno";


    if (hour >= 13 && hour < 18) {

        greeting = "Buon pomeriggio";

    } else if (hour >= 18) {

        greeting = "Buonasera";

    }


    headerGreeting.textContent =
        greeting;

}


/* =========================
   INITIAL
========================= */

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


/* =========================
   NAVIGATION
========================= */

function navigateTo(page) {

    currentPage = page;


    document
        .querySelectorAll(".app-page")
        .forEach(section => {

            section.classList.remove("active");

        });


    const targetPage =
        document.getElementById(
            `${page}Page`
        );


    if (targetPage) {

        targetPage.classList.add("active");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.classList.remove("active");

        });


    const activeButton =
        document.querySelector(
            `.nav-item[data-page="${page}"]`
        );


    if (activeButton) {

        activeButton.classList.add("active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================
   EVENTS
========================= */

function setupEvents() {


    /* SERVICE SELECTION */

    document
        .querySelectorAll(".service-card")
        .forEach(button => {

            button.addEventListener("click", () => {

                const service =
                    button.dataset.service;

                showDriverSetup(service);

            });

        });


    /* BACK */

    document
        .getElementById("backToService")
        .addEventListener("click", () => {

            showOnboarding();

        });


    /* NAVIGATION */

    document
        .querySelectorAll(".nav-item")
        .forEach(button => {

            button.addEventListener("click", () => {

                navigateTo(
                    button.dataset.page
                );

            });

        });


    /* PROFILE BUTTON */

    document
        .querySelector(".profile-button")
        .addEventListener("click", () => {

            navigateTo("profile");

        });


    /* ADD BUTTON */

    document
        .getElementById("addButton")
        .addEventListener("click", () => {

            openNewItemModal();

        });


    /* CLOSE MODAL */

    document
        .getElementById("closeModal")
        .addEventListener("click", () => {

            closeNewItemModal();

        });


    document
        .querySelector(".modal-backdrop")
        .addEventListener("click", () => {

            closeNewItemModal();

        });


    /* RESET */

    document
        .getElementById("resetApp")
        .addEventListener("click", () => {

            const confirmed =
                confirm(
                    "Vuoi davvero reimpostare la configurazione?"
                );


            if (!confirmed) {
                return;
            }


            localStorage.removeItem(STORAGE_KEY);

            location.reload();

        });

}


/* =========================
   NEW ITEM MODAL
========================= */

function openNewItemModal() {

    const isTaxi =
        selectedService === "taxi";


    modalEyebrow.textContent =
        isTaxi
            ? "NUOVA CORSA"
            : "NUOVO SERVIZIO";


    modalTitle.textContent =
        isTaxi
            ? "Come vuoi inserire la corsa?"
            : "Come vuoi inserire il servizio?";


    newItemModal.classList.remove("hidden");

}


function closeNewItemModal() {

    newItemModal.classList.add("hidden");

}
```
