
const STORAGE_KEY = "ctl_driver_config";

let selectedService = null;


/* =========================
   ELEMENTI
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

const newItemModal =
    document.getElementById("newItemModal");

const modalEyebrow =
    document.getElementById("modalEyebrow");

const modalTitle =
    document.getElementById("modalTitle");


/* =========================
   AVVIO
========================= */

document.addEventListener("DOMContentLoaded", function () {

    setupEvents();

    const savedConfig =
        localStorage.getItem(STORAGE_KEY);


    if (!savedConfig) {

        showOnboarding();

        return;

    }


    try {

        const config =
            JSON.parse(savedConfig);


        if (
            !config ||
            !config.service ||
            !config.name ||
            !config.phone
        ) {

            localStorage.removeItem(STORAGE_KEY);

            showOnboarding();

            return;

        }


        loadApplication(config);


    } catch (error) {

        console.error(
            "Errore configurazione:",
            error
        );

        localStorage.removeItem(STORAGE_KEY);

        showOnboarding();

    }

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

    mainApp.classList.add("hidden");


    if (service === "taxi") {

        selectedServiceLabel.textContent = "TAXI";

    } else {

        selectedServiceLabel.textContent = "NCC";

    }

}


function returnToServiceSelection() {

    selectedService = null;

    showOnboarding();

}


/* =========================
   SALVATAGGIO DATI
========================= */

function saveDriverConfiguration(event) {

    event.preventDefault();


    if (!selectedService) {

        return;

    }


    const nameInput =
        document.getElementById("driverName");

    const phoneInput =
        document.getElementById("driverPhone");

    const licenseInput =
        document.getElementById("driverLicense");


    const name =
        nameInput.value.trim();

    const phone =
        phoneInput.value.trim();

    const license =
        licenseInput.value.trim();


    if (!name || !phone) {

        return;

    }


    const config = {

        service: selectedService,

        name: name,

        phone: phone,

        license: license

    };


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(config)
    );


    loadApplication(config);

}


/* =========================
   CARICAMENTO APP
========================= */

function loadApplication(config) {

    onboarding.classList.add("hidden");

    driverSetup.classList.add("hidden");

    mainApp.classList.remove("hidden");


    selectedService =
        config.service;


    updateInterface(config);

    navigateTo("home");

}


/* =========================
   AGGIORNA INTERFACCIA
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
        isTaxi
            ? "Corse"
            : "Servizi";


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
        config.name;


    profilePhone.textContent =
        config.phone;


    profileLicense.textContent =
        config.license || "Non inserita";


    const initial =
        getInitial(config.name);


    profileInitial.textContent =
        initial;


    profileAvatar.textContent =
        initial;


    updateGreeting();

}


/* =========================
   SALUTO
========================= */

function updateGreeting() {

    const hour =
        new Date().getHours();


    let greeting =
        "Buongiorno";


    if (hour >= 13 && hour < 18) {

        greeting =
            "Buon pomeriggio";

    }


    if (hour >= 18) {

        greeting =
            "Buonasera";

    }


    headerGreeting.textContent =
        greeting;

}


/* =========================
   INIZIALE
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
   NAVIGAZIONE
========================= */

function navigateTo(page) {

    const pages =
        document.querySelectorAll(".app-page");


    pages.forEach(function (pageElement) {

        pageElement.classList.remove("active");

    });


    const target =
        document.getElementById(page + "Page");


    if (target) {

        target.classList.add("active");

    }


    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(function (item) {

        item.classList.remove("active");

    });


    const activeItem =
        document.querySelector(
            '.nav-item[data-page="' + page + '"]'
        );


    if (activeItem) {

        activeItem.classList.add("active");

    }


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================
   MODALE
========================= */

function openNewItemModal() {

    const isTaxi =
        selectedService === "taxi";


    if (isTaxi) {

        modalEyebrow.textContent =
            "NUOVA CORSA";

        modalTitle.textContent =
            "Come vuoi inserire la corsa?";

    } else {

        modalEyebrow.textContent =
            "NUOVO SERVIZIO";

        modalTitle.textContent =
            "Come vuoi inserire il servizio?";

    }


    newItemModal.classList.remove("hidden");

}


function closeNewItemModal() {

    newItemModal.classList.add("hidden");

}


/* =========================
   EVENTI
========================= */

function setupEvents() {


    /* TAXI / NCC */

    const serviceCards =
        document.querySelectorAll(".service-card");


    serviceCards.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                showDriverSetup(
                    button.dataset.service
                );

            }
        );

    });


    /* INDIETRO */

    const backButton =
        document.getElementById("backToService");


    if (backButton) {

        backButton.addEventListener(
            "click",
            function () {

                returnToServiceSelection();

            }
        );

    }


    /* FORM */

    if (driverForm) {

        driverForm.addEventListener(
            "submit",
            saveDriverConfiguration
        );

    }


    /* NAVIGAZIONE */

    const navItems =
        document.querySelectorAll(".nav-item");


    navItems.forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                navigateTo(
                    button.dataset.page
                );

            }
        );

    });


    /* PROFILO */

    const profileButton =
        document.getElementById("profileButton");


    if (profileButton) {

        profileButton.addEventListener(
            "click",
            function () {

                navigateTo("profile");

            }
        );

    }


    /* + */

    const addButton =
        document.getElementById("addButton");


    if (addButton) {

        addButton.addEventListener(
            "click",
            function () {

                openNewItemModal();

            }
        );

    }


    /* CHIUDI MODALE */

    const closeModal =
        document.getElementById("closeModal");


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            function () {

                closeNewItemModal();

            }
        );

    }


    const modalBackdrop =
        document.querySelector(".modal-backdrop");


    if (modalBackdrop) {

        modalBackdrop.addEventListener(
            "click",
            function () {

                closeNewItemModal();

            }
        );

    }


    /* RESET */

    const resetButton =
        document.getElementById("resetApp");


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function () {

                const confirmed =
                    window.confirm(
                        "Vuoi davvero reimpostare la configurazione?"
                    );


                if (!confirmed) {

                    return;

                }


                localStorage.removeItem(
                    STORAGE_KEY
                );


                window.location.reload();

            }
        );

    }

}
