# Titel
<!-- Geef je project een titel en schrijf in één zin wat het is -->

## Inhoudsopgave

  * [Beschrijving](#beschrijving)
  * [Gebruik](#gebruik)
  * [Kenmerken](#kenmerken)
  * [Installatie](#installatie)
  * [Bronnen](#bronnen)
  * [Licentie](#licentie)

## Beschrijving
<!-- In de Beschrijving staat kort beschreven wat voor project het is en wat je hebt gemaakt -->
<!-- Voeg een mooie poster visual toe 📸 -->
<!-- Voeg een link toe naar Github Pages 🌐-->
### Drop & Heal
![image](https://github.com/user-attachments/assets/5f05d007-05fb-4777-bd0f-25a3d53f26f7)

Dit is een project wat te maken heeft met rouw(-processen) met betrekking tot jongeren begeleiden hierin.

## Gebruik
<!--Bij Gebruik staat hoe je project er uit ziet, hoe het werkt en wat je er mee kan. -->
Dit project heeft nog geen gebouwde index pagina, er is namelijk vooral veel focus gelegd op de taken, oefeningen & drops (comment pagina's)
Zo kun je dus comments plaatsen op de oefeningen of op de comment pagina's _van_ de oefeningen.
_elke oefening heeft een __eigen__ comment pagina_

<details><summary>User stories</summary>
 
![image](https://github.com/user-attachments/assets/f0f0c3bf-2165-40b2-b6c5-66c985b98102)


![image](https://github.com/user-attachments/assets/8b238063-520c-4812-a2de-7bcd88d161d9)


</details>

## Kenmerken
<!-- Bij Kenmerken staat welke technieken zijn gebruikt en hoe. Wat is de HTML structuur? Wat zijn de belangrijkste dingen in CSS? Wat is er met Javascript gedaan en hoe? Misschien heb je een framwork of library gebruikt? -->
Voor dit project is er gebruik gemaakt van de volgende technieken:
### LiquidJS (HTML Templating)
Voornamelijk opsplitsing van componenten dmv partials en forloops om arrays aan data correct te renderen.
Zoals bijvoorbeeld:
<details><summary>Partials</summary>

```liquid
{% render './partials/head.liquid' , open: open , themeColor: foundTheme \%}
<main>
  {% render './partials/dialog/comment-dialog.liquid' , link: dropsLink , closeLink: dropsLink , error: error , text: "Plaats bericht" , conceptText: conceptText , conceptId: conceptId , exerciseId: exerciseId \%}
  {% for drop in drops reversed \%}
    {% render "./partials/card/drop-card.liquid" , drop: drop \%}
  {% else \%}
    <p>Er zijn nog geen berichten gepost.</p>
  {% endfor \%}
  <div class="drop-container">
    {% render './partials/btn/regular-btn.liquid' , text: "Klaar" , classes: "opener drop-btn" , link: commentLink \%}
  </div>
</main>
{% render './partials/footer.liquid' \%}
```

</details>

<details><summary>Forloop</summary>

```liquid
{% for exercise in exercises %}
  {% assign link = "/" | append: theme | append: "/" | append: forloop.index %}
  <li class="card-item">
    {% render './partials/card/exercise-card.liquid'
      , pageType: id
      , exercise: exercise
      , link: link
    %}
  </li>
{% endfor %}
```

</details>

### CSS
Het algemene thema per pagina bepaal ik dmv [`Theme.css`](https://github.com/MarsGotBars/the-web-is-for-everyone-interactive-functionality/blob/main/public/styles/theme.css)
Hiernaast heb ik net zoals voor mijn componenten/partials, folders per component styling om alles netjes te ordenen
Allerlaatst heb ik ook een [`general.css`](https://github.com/MarsGotBars/the-web-is-for-everyone-interactive-functionality/blob/main/public/styles/general.css) waar ik util classes maak of algemene styling aanpas

Ook maak ik gebruik van `@supports`:
```css
@supports (display: grid) {
  input[type="checkbox"] {
    appearance: none;
    position: absolute;

    &:focus {
      outline: none;
    }
  }
}
```

### JavaScript
Redelijk weinig JS gebruikt, grotendeels voor __Progressive enhancements__ zoals [client side fetching](https://github.com/MarsGotBars/the-web-is-for-everyone-interactive-functionality/blob/61a5707e2350f933faa5f2c15e12c3cc55b59316/public/scripts/dialogFunctionality.js#L34-L113) en het [aanmaken van een dialog element](https://github.com/MarsGotBars/the-web-is-for-everyone-interactive-functionality/blob/61a5707e2350f933faa5f2c15e12c3cc55b59316/public/scripts/dialogFunctionality.js#L1-L32)

### Node.JS & Express
Server opzet, hierin bepaal ik mijn routes, haal ik data op uit directus en doe ik mijn [posts](https://github.com/MarsGotBars/the-web-is-for-everyone-interactive-functionality/blob/61a5707e2350f933faa5f2c15e12c3cc55b59316/server.js#L252C1-L350C4)

### Directus
API om te communiceren met de PostgresQL database

## Installatie
<!-- Bij Instalatie staat hoe een andere developer aan jouw repo kan werken -->

### Scripts
#### `npm i` of `npm install`
Hiermee installeer je de benodigde packages zoals express en andere dergelijke packages.

#### `npm start`
Hiermee start je het project lokaal.
Open vervolgens [http://localhost:8000](http://localhost:8000) om het project te zien in de browser.

Om edits te zien moet je de pagina refreshen omdat het geen hot-reload bevat.

#### `npm run dev`
Hiermee start je het project op en run je de Nodemon & browser-sync packages, deze helpen met het refreshen van je server wanneer je verandering maakt.
Open vervolgens [http://localhost:3000](http://localhost:3000) om het project te zien in de browser als dit niet automatisch gebeurt.

Deze versie bevat wel hot-reloads voor de server

> [!TIP]
> `console.log`'s in de `server.js` worden in de editor console weergeven, niet de browser.

## Bronnen
[FDND](https://github.com/fdnd-task/the-web-is-for-everyone-interactive-functionality)
## Licentie

This project is licensed under the terms of the [MIT license](./LICENSE).
