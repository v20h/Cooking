let recipes = [];
let activeList = [];

let currentPage = 1;
const itemsPerPage = 9;


// Daten laden
fetch("rezepte.json")
  .then(res => res.json())
  .then(data => {
      recipes = data.filter(r => r.id !== "");
      activeList = recipes;
      displayRecipes(activeList);
  });



// Zeit brechnen
function timeformatted(time){
    const hours = Math.floor(time / 60);
    const restMin = time % 60;
    let text = '';
    if(hours > 0) text += `${hours} Stunde${hours > 1 ? 'n' : ''} `;
    if(restMin > 0 || hours === 0) text += `${restMin} Minute${restMin > 1 ? 'n' : ''}`;
    return text.trim();
}



// Rezepte anzeigen (mit Pagination!)
function displayRecipes(list){

    const container = document.getElementById("imgHolder");
    container.innerHTML = "";

    // Pagination berechnen
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    const pageItems = list.slice(start, end);

    // Wenn keine Rezepte mehr da sind → zurück auf Seite 1
    if(pageItems.length === 0 && currentPage > 1){
        currentPage = 1;
        return displayRecipes(list);
    }

    // Karten anzeigen
    pageItems.forEach(recipe => {
        container.innerHTML += `
          <div class="card" onclick="openDetail(${recipe.id})">
            <img src="${recipe.image}" class="previewImg">

            <div class="recipeInfo">
              <h3>${recipe.name}</h3>
              <p class="recipeCategory">${recipe.category}</p>
              <p class="recipeTime">⏱ ${timeformatted(recipe.prepTime)}</p>
            </div>
          </div>
        `;
    });

    renderPagination(list.length);
}



// Rezeptseite öffnen
function openDetail(id) {
    window.open(`detail.html?id=${id}`, "_blank");
}


// Filter
function showAll(){
    setActiveButton(document.querySelector(".typeButtons:nth-child(1)"));  
    currentPage = 1;
    activeList = recipes;
    displayRecipes(activeList);
    randomFilterContainer.style.display = 'none'

}

function showNormal(){
    setActiveButton(document.querySelector(".typeButtons:nth-child(2)"));  
    currentPage = 1;
    activeList = recipes.filter(r => r.category === "normal");
    displayRecipes(activeList);
    randomFilterContainer.style.display = 'none'

}

function showThermomix(){
    setActiveButton(document.querySelector(".typeButtons:nth-child(3)"));  
    currentPage = 1;
    activeList = recipes.filter(r => r.category === "Thermomix");
    displayRecipes(activeList);
    randomFilterContainer.style.display = 'none'

}

function showAirfryer(){
    setActiveButton(document.querySelector(".typeButtons:nth-child(4)"));  
    currentPage = 1;
    activeList = recipes.filter(r => r.category === "Airfryer");
    displayRecipes(activeList);
    randomFilterContainer.style.display = 'none'
}

function showRandom(){
    setActiveButton(document.querySelector(".typeButtons:nth-child(5)"));  
    if(filterContainer.style.display === 'block') {
        filterContainer.style.display = 'none'
    }
    randomFilterContainer.style.display = 'block';
    showPagination.style.display = 'none';

    document.getElementById("imgHolder").innerHTML = "";
}

function setActiveButton(btn){
    document.querySelectorAll(".typeButtons").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}


// Pagination Navigation
function renderPagination(totalItems){

    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const nav = document.getElementById("pagination");

    nav.innerHTML = `
    <div id="showPagination">
       <button class="paginationButtons" onclick="prevPage()" ${currentPage === 1 ? "disabled":""}>← </button>
       <span>Seite ${currentPage} / ${totalPages}</span>
       <button class="paginationButtons" onclick="nextPage()" ${currentPage === totalPages ? "disabled":""}> →</button>
    </div>
    `;
}


// Seitenwechsel
function nextPage(){
    currentPage++;
    displayRecipes(activeList);

    // Nach oben springen
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function prevPage(){
    currentPage--;
    displayRecipes(activeList);
    
    // Nach oben springen
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Searchbar
function searchFunction(){
    const query = document.getElementById('mySearchbar').value.toLowerCase();
    const filtered = recipes.filter(r => r.name.toLowerCase().includes(query));
    displayRecipes(filtered)
}

// Filter anzeigen
const filterContainer = document.getElementById("filterContainer");
const filterImg = document.getElementById("toggleFilters");

filterImg.addEventListener("click", () => {

  if (filterContainer.style.display === "none") {
    filterContainer.style.display = "block";
  } else {
    filterContainer.style.display = "none";
  }

});

// Filter auswerten
function getCheckedValues(className) {
  return [...document.querySelectorAll(`.${className}:checked`)]
    .map(cb => cb.value);
}

// rezepte Filtern
function filterRecipes() {

document.querySelectorAll(".typeButtons").forEach(b => b.classList.remove("active"));

  const activeTypes = getCheckedValues("filterType");
  const activeCountries = getCheckedValues("filterCountry");
  const activeCategorys = getCheckedValues("filterCategory");
  const activeMain = document.getElementById("filterMain").checked;
  const activeSide = document.getElementById("filterSide").checked;
  const activeMittwochsklassiker = document.getElementById("filterMittwochsklassiker").checked;

  const gefiltert = recipes.filter(r => {

    const typeMatch =
        activeTypes.length === 0 || activeTypes.includes(r.type);

    const countryMatch =
        activeCountries.length === 0 || activeCountries.includes(r.country);

    const categoryMatch =
        activeCategorys.length === 0 || activeCategorys.includes(r.category);
    
    const mainMatch =
        !activeMain || r.mainDish === true;

    const sideMatch =
        !activeSide || r.sideDish === true;

    const mittwochsklassikerMatch =
        !activeMittwochsklassiker || r.mittwochsklassiker === true;

    return typeMatch && countryMatch && categoryMatch && mainMatch && sideMatch && mittwochsklassikerMatch;
  });

  activeList = gefiltert;  
  currentPage = 1;
  displayRecipes(activeList);
}


const allFilterInputs = document.querySelectorAll(
  ".filterType, .filterCountry, .filterCategory, #filterMain, #filterSide, #filterMittwochsklassiker"
);

allFilterInputs.forEach(input => {
  input.addEventListener("change", filterRecipes);
});


// random recipe anzeigen
function displayRandom(){
    const activeType = getCheckedValues("randomFilterType");
    const activeCountry = getCheckedValues("randomFilterCountry");
    const activeLevel = getCheckedValues("randomFilterLevel");
    const activeCategory = getCheckedValues("randomFilterCategory");
    const activeMain = document.getElementById("randomFilterMain").checked;
    const activeSide = document.getElementById("randomFilterSide").checked;
    const activeMittwochsklassiker = document.getElementById("randomFilterMittwochsklassiker").checked;
    const displayMistake = document.getElementById("randomButtonFalseMessage");

    if(activeType.length === 0 
          && activeCountry.length === 0 
          && activeLevel.length === 0 
          && activeCategory.length === 0
          && !activeMain 
          && !activeSide 
          && !activeMittwochsklassiker){

        displayMistake.textContent = "Bitte wähle mindestens einen Filter"; 
        return; 
    }

    displayMistake.textContent = "";

    const filteredRecipes = recipes.filter(r => {
        const typeMatch = activeType.length === 0 || activeType.includes(r.type);
        const countryMatch = activeCountry.length === 0 || activeCountry.includes(r.country);
        const levelMatch = activeLevel.length === 0 || activeLevel.includes(r.level);
        const categoryMatch = activeCategory.length === 0 || activeCategory.includes(r.category);
        
        const mainMatch =
            !activeMain || r.mainDish === true;  

        const sideMatch =
            !activeSide || r.sideDish === true;
            
        const mittwochsklassikerMatch =
            !activeMittwochsklassiker || r.mittwochsklassiker === true;

        return typeMatch && countryMatch && levelMatch && categoryMatch && mainMatch && sideMatch && mittwochsklassikerMatch;
    });

    if(filteredRecipes.length === 0){
        displayMistake.textContent = "Es wurden keine Rezepte gefunden"; 
        return; 
    }

    displayMistake.textContent = "";

    const threeRandom = getRandomItems(filteredRecipes, 3);
    displayRecipes(threeRandom);

    showPagination.style.display = 'none'
}

function getRandomItems(arr, count){
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// dark mode 
document.addEventListener("DOMContentLoaded", () => {
    const darkModeToggle = document.getElementById("darkModeImg");
    const body = document.body;

    if(localStorage.getItem("darkMode") === "true"){
        body.classList.add("dark-mode");
        darkModeToggle.src = "Images/sun.png";
    }

    darkModeToggle.addEventListener("click", () => {
        body.classList.toggle("dark-mode");
        const isDark = body.classList.contains("dark-mode");
        localStorage.setItem("darkMode", isDark);
        darkModeToggle.src = isDark ? "Images/sun.png" : "Images/darkmode.png";
    });
});

// Filter schoen einblenden
const filterContainer1 = document.getElementById("filterContainer");
const filterImg1 = document.getElementById("toggleFilters");

filterImg1.addEventListener("click", () => {
  filterContainer1.classList.toggle("open");
});



