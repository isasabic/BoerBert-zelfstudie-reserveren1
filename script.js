document.addEventListener("DOMContentLoaded", function () {
  // Verkrijg de huidige datum
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1; // Maanden zijn 0-gebaseerd
  const currentDay = today.getDate();

  // Het minimumjaar voor een leeftijd van 16 jaar (16 jaar geleden)
  const minYear = currentYear - 16;

  const daySelect = document.querySelector("#day");
  const monthSelect = document.querySelector("#month");
  const yearSelect = document.querySelector("#year");

  // Functie om te controleren of een jaar een schrikkeljaar is
  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  // Populeer de maanden
  const months = [
    "Januari",
    "Februari",
    "Maart",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Augustus",
    "September",
    "Oktober",
    "November",
    "December",
  ];
  months.forEach((month, index) => {
    const option = document.createElement("option");
    option.value = index + 1; // Maanden beginnen vanaf 1
    option.textContent = month;
    monthSelect.appendChild(option);
  });

  // Populeer de jaren van 2007 naar 1950
  for (let i = minYear; i >= 1950; i--) {
    const option = document.createElement("option");
    option.value = i;
    option.textContent = i;
    yearSelect.appendChild(option);
  }

  // Functie om de dagen te updaten op basis van het geselecteerde jaar en maand
  function updateDays() {
    const selectedMonth = monthSelect.value;
    const selectedYear = yearSelect.value;

    // Verwijder de huidige dagopties
    daySelect.innerHTML = "";

    // Aantal dagen in de geselecteerde maand
    let daysInMonth = 31;
    if (selectedMonth == 2) {
      daysInMonth = isLeapYear(selectedYear) ? 29 : 28; // Februari (schrikkeljaar of niet)
    } else if (
      selectedMonth == 4 ||
      selectedMonth == 6 ||
      selectedMonth == 9 ||
      selectedMonth == 11
    ) {
      daysInMonth = 30;
    }

    // Populeer de dagen
    for (let i = 1; i <= daysInMonth; i++) {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = i;
      daySelect.appendChild(option);
    }
  }

  // Trigger update van dagen wanneer maand of jaar wordt geselecteerd
  monthSelect.addEventListener("change", updateDays);
  yearSelect.addEventListener("change", updateDays);

  // Initieel de dagen bijwerken
  updateDays();

  // Validatie van de geboortedatum: controleren of de geselecteerde datum resulteert in een leeftijd van 16 jaar of ouder
  const validator = new JustValidate("#bookingForm");

  validator
    .addField("#firstName", [
      {
        rule: "required",
        errorMessage: "Vul je voornaam in",
      },
    ])
    .addField("#lastName", [
      {
        rule: "required",
        errorMessage: "Vul je achternaam in.",
      },
    ])
    .addField("#email", [
      {
        rule: "email",
        errorMessage: "Vul een geldig e-mailadres in.",
      },
      {
        rule: "required",
        errorMessage: "Vul een e-mail adres in.",
      },
    ])
    .addField("#day", [
      {
        rule: "required",
        errorMessage: "Kies een dag",
      },
    ])
    .addField("#month", [
      {
        rule: "required",
        errorMessage: "Kies een maand",
      },
    ])
    .addField("#year", [
      {
        rule: "required",
        errorMessage: "Kies een jaar",
      },
    ])
    .addField("#date", [
      {
        validator: function () {
          const selectedDay = parseInt(daySelect.value);
          const selectedMonth = parseInt(monthSelect.value);
          const selectedYear = parseInt(yearSelect.value);

          // Bereken het verschil in jaren
          let age = currentYear - selectedYear;
          if (
            currentMonth < selectedMonth ||
            (currentMonth === selectedMonth && currentDay < selectedDay)
          ) {
            age--;
          }

          // Controleer of de gebruiker minimaal 16 jaar oud is
          if (age < 16) {
            return false; // Foutmelding als de leeftijd minder dan 16 is
          }
          return true; // Geldig als de leeftijd 16 of ouder is
        },
        errorMessage:
          "Je moet minimaal 16 jaar oud zijn om je in te schrijven.",
      },
    ]);
});

const input = document.querySelector("#phoneNumber");
const button = document.querySelector(".nextButton");
const errorMsg = document.querySelector("#error-msg");
const validMsg = document.querySelector("#valid-msg");

// here, the index maps to the error code returned from getValidationError - see readme
const errorMap = [
  "Invalid number",
  "Invalid country code",
  "Too short",
  "Too long",
  "Invalid number",
];

// initialise plugin
const iti = window.intlTelInput(input, {
  initialCountry: "us",
  utilsScript: "/intl-tel-input/js/utils.js?1730730622316",
  separateDialCode: true,
});

const reset = () => {
  input.classList.remove("error");
  errorMsg.innerHTML = "";
  errorMsg.classList.add("hide");
  validMsg.classList.add("hide");
};

const showError = (msg) => {
  input.classList.add("error-phone-input");
  errorMsg.innerHTML = msg;
  errorMsg.classList.add("error-phone-label");
  errorMsg.classList.remove("hide");
};

// on click button: validate
button.addEventListener("click", () => {
  reset();
  if (!input.value.trim()) {
    showError("Required");
  } else if (iti.isValidNumber()) {
    validMsg.classList.remove("hide");
  } else {
    const errorCode = iti.getValidationError();
    const msg = errorMap[errorCode] || "Voer een geldig nummer in.";
    showError(msg);
  }
});

// on keyup / change flag: reset
input.addEventListener("change", reset);
input.addEventListener("keyup", reset);
