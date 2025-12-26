// zeit formatieren
function timeformatted(time){
    const hours = Math.floor(time / 60);
    const restMin = time % 60;
    let text = '';
    if(hours > 0) text += `${hours} Stunde${hours > 1 ? 'n' : ''} `;
    if(restMin > 0 || hours === 0) text += `${restMin} Minute${restMin > 1 ? 'n' : ''}`;
    return text.trim();
}

// ersten Buchstaben capitalizen
function capitalizeFirstLetter(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Vor Doppelpunkt fett machen
function boldBeforeColon(text) {
    if (!text) return "";
    
    const parts = text.split(":");

    if (parts.length > 1) {
        return `<strong>${parts[0]}:</strong>${parts.slice(1).join(":")}`;
    } else {
        return `<strong>${text}</strong>`;
    }
}


const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// JSON laden
fetch("rezepte.json")
  .then(res => res.json())
  .then(data => {
    const recipe = data.find(r => r.id === id);
    showDetail(recipe);
  });

function showDetail(recipe) {

  // Titel nach Rezept namen
  document.title = recipe.name

  // Bild als favicon
  document.querySelector("link[rel~='icon']").href = `${recipe.image}`;

  //Rezept displayen
  document.getElementById("detailContainer").innerHTML = `

    <title>${recipe.name}</title>
    <h1 id="myDetailHeading">${recipe.name}</h1>
    <div id="myDetailContainer">

        <a href="index.html">
          <img src="Images/Home.png" id="homeImg">
        </a>

      <img src="${recipe.image}" id="detailImg">
      <div id="detailLevelTimePortionsContainer"> 
        <p class="detailAngaben"><strong>Level:</strong> ${capitalizeFirstLetter(recipe.level)}</p>
        <p class="detailAngaben"><strong>Zeit:</strong> ${timeformatted(recipe.prepTime)}</p>
        <p class="detailAngaben"><strong>Portionen: </strong>${recipe.portions}</p>
      </div>

      <h2 id="myDetailH2">Zutaten</h2>
      <ul id="detailZutaten">
        ${recipe.ingredients
          .map(i => `<li>${boldBeforeColon(i)}</li>`)
          .join("")}
      </ul>


      <h2 id="myDetailH2">Zubereitung</h2>
      <p id="detailInstructions">${recipe.instructions.replace(/\n/g, "<br><br>")}</p>

      <a href="${recipe.appLink}" target="_blank">
        <img src="Images/kochen.png" id="hrefImg">
      </a>

    </div>

  `;
}