const API_URL = "https://restcountries.com/v3.1";
let countries = [];
let favorites = JSON.parse(localStorage.getItem("favorites")) || [];
let displayedCountriesCount = 15;
const incrementCount = 15;

// Check if a country is in the favorites list
function isFavorite(countryCode) {
    return favorites.includes(countryCode);
}

window.onload = async () => {
    await fetchCountries();
    renderFavorites();
    renderCountryList(); // Ensure this is called after fetching countries
};

// Fetch all countries
async function fetchCountries() {
    try {
        const response = await fetch(`${API_URL}/all`);
        countries = await response.json(); // Assign directly to the global `countries` array
        console.log("Countries fetched:", countries);
        populateDropdowns(countries);
    } catch (error) {
        console.error("Error fetching countries:", error);
    }
}

// Populate region and language dropdown options
function populateDropdowns(countries) {
    const filterOptions = document.getElementById("filterOptions");
    const regionOptGroup = document.createElement("optgroup");
    regionOptGroup.label = "Regions";
    const languageOptGroup = document.createElement("optgroup");
    languageOptGroup.label = "Languages";

    const languagesSet = new Set();
    const regionsSet = new Set();

    countries.forEach(country => {
        if (country.region) regionsSet.add(country.region);
        if (country.languages) Object.values(country.languages).forEach(lang => languagesSet.add(lang));
    });

    regionsSet.forEach(region => {
        const option = document.createElement('option');
        option.value = region;
        option.textContent = region;
        regionOptGroup.appendChild(option);
    });

    languagesSet.forEach(language => {
        const option = document.createElement('option');
        option.value = language;
        option.textContent = language;
        languageOptGroup.appendChild(option);
    });

    filterOptions.innerHTML = '';
    filterOptions.appendChild(regionOptGroup);
    filterOptions.appendChild(languageOptGroup);
}

// Render the list of countries with "Show More" functionality
function renderCountryList(filteredCountries = countries) {
    const countryList = document.getElementById("countryList");
    if (!countryList) return;

    countryList.innerHTML = "";
    const visibleCountries = filteredCountries.slice(0, displayedCountriesCount);

    visibleCountries.forEach(country => {
        countryList.innerHTML += `
            <div class="country-card">
                <img src="${country.flags.png}" alt="Flag of ${country.name.common}">
                <p>${country.name.common}</p>
                <button onclick="showCountryDetails('${country.cca3}')">View Details</button>
                <span class="favorite-icon" onclick="toggleFavorite('${country.cca3}', this)">
                    <i class="${isFavorite(country.cca3) ? 'fas fa-heart' : 'far fa-heart'}"></i>
                </span>
            </div>
        `;
    });

    document.getElementById("viewMoreBtn").style.display = displayedCountriesCount < filteredCountries.length ? 'block' : 'none';
}


// Show more countries when "View More" is clicked
function showMoreCountries() {
    displayedCountriesCount += incrementCount;
    renderCountryList(countries);
}

// Render the favorites list
function renderFavorites() {
    const favoriteList = document.getElementById("favoritesList");
    favoriteList.innerHTML = favorites
        .map(code => {
            const country = countries.find(c => c.cca3 === code);
            return country ? `
                <li onclick="showCountryDetails('${country.cca3}')">
                    ${country.name.common}
                    <span class="remove-favorite" onclick="removeFavorite(event, '${country.cca3}')">
                        <i class="fa fa-trash"></i>
                    </span>
                </li>
            ` : "";
        })
        .join("");
}

function showCountryDetails(countryCode) {
    const country = countries.find(c => c.cca3 === countryCode);
    if (!country) return;

    const details = document.getElementById("countryInfo");
    details.innerHTML = `
        <h2>${country.name.common}</h2>
        <img src="${country.flags.png}" alt="Flag of ${country.name.common}" style="width: 200px; height: auto;">
        <p><strong>Capital:</strong> ${country.capital || 'N/A'}</p>
        <p><strong>Region:</strong> ${country.region || 'N/A'}</p>
        <p><strong>Population:</strong> ${country.population ? country.population.toLocaleString() : 'N/A'}</p>
        <p><strong>Area:</strong> ${country.area ? country.area.toLocaleString() + ' km²' : 'N/A'}</p>
        <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(", ") : 'N/A'}</p>
        <button id="favoriteButton" onclick="toggleFavorite('${country.cca3}', this)">
            <i class="${isFavorite(country.cca3) ? 'fas fa-heart' : 'far fa-heart'}"></i> 
            ${isFavorite(country.cca3) ? 'Added to Favorites' : 'Add to Favorites'}
        </button>
        <button onclick="goBackToHomePage()">Go Back</button>

    `;
    document.getElementById("countryDetails").style.display = "block";
}

function closeDetails() {
    document.getElementById("countryDetails").style.display = "none";
}
function goBackToHomePage() {
    document.getElementById("countryDetails").style.display = "none";
}


// Event listener for input changes in search box
document.getElementById("searchInput").addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    if (!query) {
        clearSuggestions();
        return;
    }

    const filteredCountries = countries.filter(country => 
        country.name.common.toLowerCase().includes(query)
    ).slice(0, 5); // Limit to 5 suggestions

    renderSuggestions(filteredCountries);
});

// Function to render suggestions dynamically
function renderSuggestions(suggestions) {
    const suggestionsBox = document.getElementById("suggestionsBox");
    suggestionsBox.innerHTML = suggestions
        .map(country => `<div class="suggestion-item" onclick="selectSuggestion('${country.cca3}')">${country.name.common}</div>`)
        .join("");
    suggestionsBox.style.display = "block"; // Show suggestions
}

// Function to handle selection of a suggestion
function selectSuggestion(countryCode) {
    const country = countries.find(c => c.cca3 === countryCode);
    if (country) {
        document.getElementById("searchInput").value = ""; // Clear search input
        showCountryDetails(country.cca3);
        clearSuggestions(); // Clear the suggestion box after selection
    }
}

// Function to clear suggestions from the box
function clearSuggestions() {
    const suggestionsBox = document.getElementById("suggestionsBox");
    suggestionsBox.innerHTML = "";
    suggestionsBox.style.display = "none"; // Hide the suggestions box
}


function toggleFavoritesModal() {
    const modal = document.getElementById("favoritesModal");
    modal.style.display = modal.style.display === "none" ? "block" : "none";
    renderFavorites(); // Render the favorites list every time the modal opens
}

// Render the favorites list
function renderFavorites() {
    const favoriteList = document.getElementById("favoritesList");
    favoriteList.innerHTML = favorites
        .map(code => {
            const country = countries.find(c => c.cca3 === code);
            return country ? `
                <li onclick="showCountryDetails('${country.cca3}')">
                    ${country.name.common}
                    <span class="remove-favorite" onclick="removeFavorite(event, '${country.cca3}')">
                        <i class="fa fa-trash"></i>
                    </span>
                </li>
            ` : "";
        })
        .join("");
}

// Toggle country in favorites with an 8-item limit
function toggleFavorite(countryCode, element) {
    if (isFavorite(countryCode)) {
        favorites = favorites.filter(code => code !== countryCode);
        element.innerHTML = `<i class="far fa-heart"></i> Add to Favorites`;
    } else {
        if (favorites.length < 8) {
            favorites.push(countryCode);
            element.innerHTML = `<i class="fas fa-heart"></i> Added to Favorites`;
        } else {
            alert("You can add a maximum of 8 countries to favorites.");
            return;
        }
    }
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
    renderCountryList(countries.slice(0, displayedCountriesCount));
}

// Remove a country from favorites
function removeFavorite(event, countryCode) {
    event.stopPropagation();
    favorites = favorites.filter(code => code !== countryCode);
    localStorage.setItem("favorites", JSON.stringify(favorites));
    renderFavorites();
}

function isFavorite(countryCode) {
    return favorites.includes(countryCode);
}

function openFavoritesList() {
    renderFavorites();
    document.getElementById("favoritesModal").style.display = "block";
}

function closeFavoritesList() {
    document.getElementById("favoritesModal").style.display = "none";
}

// Add an event listener for the filter options dropdown
document.getElementById("filterOptions").addEventListener("change", (event) => {
    const selectedValue = event.target.value;

    // Filter countries based on the selected value
    let filteredCountries;

    if (selectedValue === "") {
        // If no filter is selected, show all countries
        filteredCountries = countries;
    } else {
        // Filter countries by region or language
        filteredCountries = countries.filter(country => 
            country.region === selectedValue || 
            (country.languages && Object.values(country.languages).some(lang => lang === selectedValue))
        );
    }

    displayedCountriesCount = 15; // Reset displayed countries count
    renderCountryList(filteredCountries); // Render filtered countries
});

function goBackToHome() {
    document.getElementById('filteredPage').style.display = 'none'; // Hide filtered results page
    document.getElementById('mainContent').style.display = 'block'; // Show the main content page
    document.getElementById('filterOptions').value = ''; // Reset the filter dropdown
    document.getElementById('searchInput').value = ''; // Clear the search input field
    filteredCountries = countries; // Reset filtered countries to the original data
    displayCountries(); // Redisplay all countries
}

