import express from "express";
import { Liquid } from "liquidjs";
import 'dotenv/config'

// Init de app
const app = express();

const loggedUser = "Marcin"

let taskData = [];
let exerciseData = [];
const fetchThemedTask = async () => {
  const taskList = await fetch(
    "https://fdnd-agency.directus.app/items/dropandheal_task"
  );
  // Skip hiermee het benoemen van 'data'
  const { data: taskListJson } = await taskList.json();
  taskData = taskListJson;
};

const fetchThemedExercise = async () => {
  const exerciseList = await fetch(
    "https://fdnd-agency.directus.app/items/dropandheal_exercise?fields=*,image.width,image.height,image.id"
  );
  // Skip hiermee het benoemen van 'data'
  const { data: exerciseListJson } = await exerciseList.json();
  // Refresh de data voor de check
  exerciseData = exerciseListJson;
};

const fetchExerciseDrops = async (givenExercise) => {
  const messageList = await fetch(
    `https://fdnd-agency.directus.app/items/dropandheal_messages${
      givenExercise && `?filter[exercise][_eq]=${givenExercise}&filter[concept][_eq]=false`
    }`
  );
  // Skip hiermee het benoemen van 'data'
  const { data: messageListJson } = await messageList.json();
  // Refresh de data voor de check
  return messageListJson;
};

const fetchExerciseConcept = async (exerciseId, user) => {
  const userConceptJSON = await fetch(
    `https://fdnd-agency.directus.app/items/dropandheal_messages?filter[exercise][_eq]=${exerciseId}&filter[from][_eq]=${user}&filter[concept][_eq]=true&sort=-date_created&limit=1`
  );
  const {data: userConcept } = await userConceptJSON.json();
  // return het meest recente concept (kunnen er niet meer zijn dan 1)
  return userConcept[0];
};

const findData = (theme, pageId) => {
  const foundData = taskData.find((data) => data.theme === theme);

  if (pageId === null) {
    console.log("no pageId found");

    return { foundData };
  }
  // - 1 omdat we door een array lopend die start op 0
  const exercise = exerciseData.find(
    (exercise) => exercise.id === foundData.exercise[pageId - 1]
  );
  return { exercise, foundData };
};

const temporaryErrors = new Map();
const createError = (error, path) => {
  const errorKey = `${path}`;
  temporaryErrors.set(errorKey, error);
};

(async () => {
  try {
    await fetchThemedExercise();
    await fetchThemedTask();
  } catch (err) {
    console.log(err, "no connection");
  }
})();

// Middleware om errors te genereren
app.use((req, res, next) => {
  // Pad om te vergelijken
  const errorKey = `${req.path}`;
  // Als er op dit pad een error is, voeg die toe aan de response locals
  if (temporaryErrors.has(errorKey)) {
    res.locals.error = temporaryErrors.get(errorKey);
    // Verwijder de error nadat deze is gebruikt, zodat temporaryErrors leeg is
    temporaryErrors.delete(errorKey);
  }
  next();
});

app.use(express.static("public"));

const engine = new Liquid();
app.engine("liquid", engine.express());
app.use(express.urlencoded({ extended: true }));
app.set("views", "./views");

app.get("/", async function (request, response) {
  response.render("index.liquid");
});

// Dynamische parameter om te gebruiken bij het vinden van de correcte taskData
app.get("/:theme", async function (request, response) {
  
  // Custom lijst met alle task titles en pathNames
  const tasks = taskData.map((task) => ({
    title: task.title,
    pathName: task.theme,
    id: task.id,
  }));

  // Sla deze op voor leesbaarheid
  const requestedTheme = request.params.theme;

  // Zoek taskData dmv de gevraagde :theme
  const { foundData } = findData(requestedTheme);

  // Destructureer om props makkelijk door te
  const { pathName, theme, title, id, exercise: exerciseList } = foundData;

  const exercises = exerciseList.map(async (exerciseId, i) => {
    const givenExercise = exerciseData.find((e) => e.id === exerciseId);
  
    return givenExercise
  });
  
  
  // respond met de gevraagde pagina & het behorende thema
  response.render(`task.liquid`, {
    theme,
    title,
    id,
    tasks,
    exercises,
    styles: ["decor/decor.css", "header/header.css", "card/exercise-card.css"]
  });
});

app.get("/:theme/:pageId", async function (request, response) {
  const { theme, pageId } = request.params;
  const { foundData, exercise } = findData(theme, pageId);
  const { title, description, image, id: exerciseId } = exercise;
  const { theme: foundTheme, id } = foundData;
  const isExercise = true;

  const foundConcept = await fetchExerciseConcept(exerciseId, loggedUser);
  const conceptText = foundConcept ? foundConcept.text : '';

  response.render(`exercise.liquid`, {
    foundTheme,
    title,
    description,
    id,
    pageId,
    image,
    conceptText,
    isExercise,
    scripts: ["dialogFunctionality.js"],
    styles: ["decor/decor.css", "dialog/dialog.css"]
  });
});

app.get("/:theme/:pageId/comment", async function (request, response) {
  const { theme, pageId } = request.params;
  const { foundData, exercise } = findData(theme, pageId);
  const { title, description, image, type } = exercise;
  const { theme: foundTheme, id } = foundData;
  const foundConcept = await fetchExerciseConcept(exercise.id, loggedUser);
  const conceptText = foundConcept ? foundConcept.text : '';
  const open = true;
  const isExercise = true;

  // alle props die we willen meegeven aan de template
  const renderData = {
    foundTheme,
    title,
    description,
    id,
    image,
    pageId,
    open,
    conceptText,
    isExercise,
    scripts: ["dialogFunctionality.js"],
    styles: ["decor/decor.css", "dialog/dialog.css"]
  };

  // Als res.locals.error bestaat, gebruik die (komt van middleware)
  if (response.locals.error) {
    renderData.error = response.locals.error;
  }

  response.render(`exercise.liquid`, renderData);
});

app.get("/:theme/:pageId/drops", async function (request, response) {
  const { theme, pageId } = request.params;
  const { exercise } = findData(theme, pageId);
  const foundConcept = await fetchExerciseConcept(exercise.id, loggedUser);
  const conceptText = foundConcept ? foundConcept.text : '';
  // Voer de fetch uit wanneer we de pagina bezoeken, deze staat hier met de aanname dat er vaak comments geplaatst worden
  const drops = await fetchExerciseDrops(exercise.id);
  console.log('conceptText', conceptText);
  
  response.render("drops.liquid", {
    drops,
    foundTheme: theme,
    pageId,
    conceptText,
    styles: ["card/drop-card.css", "dialog/dialog.css" ],
    scripts: ["dialogFunctionality.js"]
  });
});

app.get("/:theme/:pageId/drops/comment", async function (request, response) {
  const { theme, pageId } = request.params;
  const { exercise } = findData(theme, pageId);
  const foundConcept = await fetchExerciseConcept(exercise.id, loggedUser);
  const conceptText = foundConcept ? foundConcept.text : '';
  // Voer de fetch uit wanneer we de pagina bezoeken, deze staat hier met de aanname dat er vaak comments geplaatst worden
  const drops = await fetchExerciseDrops(exercise.id);
  const open = true;
  console.log('testing! on comment route');
  
  response.render("drops.liquid", {
    drops,
    foundTheme: theme,
    pageId,
    open,
    conceptText,
    styles: ["card/drop-card.css", "dialog/dialog.css" ],
    scripts: ["dialogFunctionality.js"]
  });
});

app.post("/:theme/:pageId/drops", async function (request, response) {
  const { theme, pageId } = request.params;
  const { person, message, anonymous, concept } = request.body;

  // Default fallback path
  let errorRedirect = `/${theme}/${pageId}/comment`;
  
  // Pas redirect aan in het geval van geen client side code
  try {
    const referer = request.headers.referer || "";
    const path = new URL(referer).pathname;
    const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    // In het geval dat referer werkt, gebruik deze path
    errorRedirect = cleanPath.endsWith('/comment') 
      ? cleanPath 
      : `${cleanPath}/comment`;
  } catch (e) {
    console.log('Using fallback redirect path');
  }
  
  const { exercise } = findData(theme, pageId);

  // Als de gebruiker required weghaalt & het bericht is emtpy
  if (message.length < 1) {
    createError('Je bericht mag niet leeg zijn. Schrijf iets om te kunnen delen.', errorRedirect);
    return response.redirect(303, errorRedirect);
  }
  const foundConcept = await fetchExerciseConcept(exercise.id, loggedUser);

  if(foundConcept) {
    try {
      // Met een patch passen we het concept bericht aan
      const patchResponse = await fetch(
        `https://fdnd-agency.directus.app/items/dropandheal_messages/${foundConcept.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            text: message,
            from: (anonymous && concept !== "true") ? "anoniem" : person,
            date_created: new Date().toISOString(),
            concept: concept
          })
        }
      );
      
      if (!patchResponse.ok) {
        throw new Error(patchResponse.status);
      }
      // Als het concept false is, ga naar de drops pagina
      if(concept !== 'true'	) {
        return response.redirect(303, `/${theme}/${pageId}/drops`);
      }
      // Als het concept true is, ga naar de home pagina
      return response.redirect(303, `/${theme}`);
    } catch (error) {
      createError('Er is een fout opgetreden bij het versturen/updaten van je bericht. Probeer het nogmaals.', errorRedirect);
      return response.redirect(errorRedirect);
    }
  }
  try {
    const data = await fetch(
      "https://fdnd-agency.directus.app/items/dropandheal_messages",
      {
        method: "POST",
        body: JSON.stringify({
          exercise: exercise.id,
          text: message,
          // Als concept true is, gebruik de persoon die is ingelogd, als concept false is, kiest de gebruiker zelf
          // concept is een string value, dus we moeten deze checken met !== "true"
          from: (anonymous && concept !== "true") ? "anoniem" : person,
          concept: concept,
        }),
        headers: {
          "Content-Type": "application/json;charset=UTF-8",
        },
      }
    );

    // Controleer of de data response OK is (status 200-299)
    if (!data.ok) {
      // Hier kan ik zien welke error voorkwam op de foutieve data
      throw new Error(data.status);
    }

    // Als de gebruiker een bericht stuurt, wil ik deze in-faden
    // Hier gebruik ik locals voor, en maak ik een custom variabele aan die ik later kan clearen
    response.locals.newComment = ""

    // Door naar drops als alles goed is verlopen
    return response.redirect(303, `/${theme}/${pageId}/drops`);
  } catch (error) {
    createError('Er is een fout opgetreden bij het versturen van je bericht. Probeer het nogmaals.', errorRedirect);
    return response.redirect(errorRedirect);
  }
});


app.post("/clean", async function (request, response) {
  try {
    // Get all concept messages for the user
    const messageList = await fetch(
      `https://fdnd-agency.directus.app/items/dropandheal_messages?filter[exercise][_eq]=5&filter[from][_eq]=Marcin&filter[concept][_eq]=true`
    );
    const { data } = await messageList.json();
    
    // Delete each message
    for (const message of data) {
      const deleteResponse = await fetch(
        `https://fdnd-agency.directus.app/items/dropandheal_messages/${message.id}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!deleteResponse.ok) {
        throw new Error(`Failed to delete message ${message.id}`);
      }
    }
    
    response.redirect(303, "/");
  } catch (error) {
    console.error('Error cleaning messages:', error);
    response.status(500).json({ error: 'Failed to clean messages' });
  }
});

app.set("port", process.env.PORT || 8000);

app.listen(app.get("port"), function () {
  console.log(`Application started on http://localhost:${app.get("port")}`);
});

// Stuk AI suggestie voor het catchen van errors (production only)
// Hiermee kan ik mijn error pagina renderen in het geval dat er een verkeerd pad opgevraagd wordt
app.use((err, request, response, next) => {
  
  // Hiermee zorg ik ervoor dat er voor gebruikers een 404 weergeven wordt ipv de code-error
  // Dit werkt alleen in de dev env omdat ik een .env heb met SHOW_DETAILED_ERRORS=true
  if (process.env.SHOW_DETAILED_ERRORS === "true") {
    // Weergeef alle error details
    response.status(500).send({
      error: err.message,
      stack: err.stack,
    });
  } else {
    // Redirect naar mijn error pagina
    response.status(404).render("err.liquid", {error: "Er ging iets mis"});
  }
});

// Catch all in het geval dat er iets mis gaat | Zelf zie ik niet precies in waarom deze nodig is
app.use((request, response) => {
  console.log("error hier");
  
  response.status(404).render("err.liquid", {error: "Fallback ding"});
});
