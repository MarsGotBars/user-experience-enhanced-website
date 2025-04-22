// Dialog moet global zijn zodat deze ook gebruikt kan worden in de submit
const dialog = document.querySelector("dialog");
const form = document.querySelector("form.dialog");
const isExercise = form.dataset.exercise === "true";

// Als er een dialog gemaakt wordt, toon ik de open button hiervoor met de if
const dropContainer = document.querySelector(".drop-container");

if (dropContainer) {
  dropContainer.style.display = "block";
}

// Als het element bestaat
if (dialog) {
  // Dedicated buttons voor dialog openen en sluiten
  const dialogOpen = document.querySelector(".opener");
  const dialogClose = document.querySelector(".close");
  dialogOpen.addEventListener("click", (e) => {
    dialog.showModal();
    e.preventDefault();
  });

  dialogClose.addEventListener("click", (e) => {
    dialog.close();
    e.preventDefault();
  });
}

// Als het geen exercise is en fetch en DOMParser beschikbaar zijn, gebruik ik fetch om de data te versturen.
if (!isExercise && "fetch" in window && "DOMParser" in window) {
  document.addEventListener("submit", async (e) => {
    form.classList.add("loading");
    const submitForm = e.target;
    const formData = new FormData(submitForm);

    if (e.submitter.value) {
      formData.append(e.submitter.name, e.submitter.value);
    }

    const formDataObject = new URLSearchParams(formData);
    e.preventDefault();
    try {
      const response = await fetch(form.action, {
        method: form.method,
        body: formDataObject,
      });
      if (!response.ok) {
        throw new Error("Response not ok!");
      }
      // Check of we geredirect worden naar de drops pagina of niet, zo weten we of we een nieuwe card moeten toevoegen of niet.
      if (response.url.includes("/drops")) {
        const responseText = await response.text();
        const parser = new DOMParser();
        const responseDOM = parser.parseFromString(responseText, "text/html");
        const newCard = responseDOM.querySelector("article");
        const main = document.querySelector("main");
        // Als er een nieuwe card is, voeg deze toe aan de main
        if (newCard) {
          console.log(newCard);
          
          newCard.classList.add("recent")
          // Als er geen dialog is en de form is in de main, voeg de nieuwe card toe aan de main
          if (!dialog && main.contains(form)) {
            form.insertAdjacentElement("afterend", newCard);
          } else {
            main.insertAdjacentElement("afterbegin", newCard);
          }
          const newForm = responseDOM.querySelector("form.dialog");
          setTimeout(() => {
            form.classList.remove("loading");
            form.classList.add("success");
            setTimeout(() => {
              form.classList.remove("success");
              form.innerHTML = newForm.innerHTML;
              if (dialog) {
                dialog.close();
              }
            }, 1200);
          }, 300);
        }
      } else {
        console.log("hoi");

        setTimeout(() => {
          form.classList.remove("loading");
          form.classList.add("success");
          setTimeout(() => {
            // Als er geredirect wordt, volg de redirect
            window.location.href = response.url;
          }, 1200);
        }, 300);

        return;
      }
    } catch (error) {
      // console.log(error);
      setTimeout(() => {
        form.classList.remove("loading");
        form.classList.add("error");
        setTimeout(() => {
          form.classList.remove("error");
          if (dialog) {
            dialog.close();
          }
        }, 1500);
      }, 300);
    }
  });
} else {
  console.log("Fetch or DOMParser is not supported");
}
