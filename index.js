const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIE_PER_PAGE = 12;

const dataPanel = document.querySelector("#data-panel");
const serchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const paginator = document.querySelector("#paginator");
const icon = document.querySelector("#icon");
const movies = [];
let filterMovies = [];
let cardModel = true;
let page = 1;

function renderMovieList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    if (cardModel) {
      rawHTML += `<div class="grid col-sm-3">
    <div class="card mb-2">
        <img src="${POSTER_URL + item.image}" class="card-img-top" alt="..." />
          <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
          <button class="btn btn-primary btn-show-movie" data-toggle="modal" 
          data-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${
            item.id
          }">+</button>
        </div>
      </div>
  </div>`;
    } else {
      rawHTML += `  <div class="list col-12 justify-content-between">
      <div class="row align-items-center" style="border-top: 1px #D0D0D0 solid">
        <div class="card-body col-9" >
          <h5>${item.title}</h5>
        </div>
      <div class="card-buttons col-3">
        <button class="btn btn-primary btn-show-movie" data-toggle="modal" data-target="#show-movie-modal" data-id="${item.id}">More</button>
        <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
     </div>
    </div>
  </div>`;
    }
  });
  dataPanel.innerHTML = rawHTML;
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDescription = document.querySelector("#movie-modal-description");

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;

    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${
      POSTER_URL + data.image
    }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  const favoriteList = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (favoriteList.some((movie) => movie.id === id)) {
    return alert(`${movie.name}此電影已經在收藏清單中！`);
  }
  favoriteList.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(favoriteList));
}

function getMoviesByPage(page) {
  const startIndex = (page - 1) * MOVIE_PER_PAGE;
  const data = filterMovies.length ? filterMovies : movies;
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

dataPanel.addEventListener("click", function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(Number(event.target.dataset.id));
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
});

serchForm.addEventListener("submit", function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filterMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );

  if (filterMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }
  renderPaginator(filterMovies.length);
  renderMovieList(getMoviesByPage(1));
});

paginator.addEventListener("click", function onPaginatorClicked(event) {
  if (event.target.tagName !== "A") return;
  page = Number(event.target.dataset.page);
  renderMovieList(getMoviesByPage(page));
});

icon.addEventListener("click", function onIconClicked(event) {
  cardModel = event.target.matches(".render-card");
  renderMovieList(getMoviesByPage(page));
});

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => {
    console.log(err);
  });
