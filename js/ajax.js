var my_headers = new Headers();

//var myInit = {
//    method: "GET",
//    headers: my_headers,
//}

// http://localhost:8000/api/v1/titles/?
// format=json
// page_size=10
//const base_url_api = "http://localhost:8000/api/v1/"
//const genre_url_api = "genres/?"
//const movies_url_api = "titles/?"

const base_url_api = "http://localhost:8000/api/v1/titles/?"

async function request_api(url) {
    // Request api oc movies
    let response = await fetch(url)
    if (response.ok) {
        json_file = await response.json();
        return json_file
    } else {
        console.log("HTTP-error : " + response.status);
    }
}

//async function get_json_response_movies(api_method, page_size, page_number=1) {
async function get_json_response_movies(page_size, page_number=1, category=undefined) {
    if (category === undefined) {
        var get_parameters = new URLSearchParams({
        format: 'json',
        page_size: page_size,
        sort_by: '-imdb_score',
        page: page_number,
        })
    } else {
        var get_parameters = new URLSearchParams({
        format: 'json',
        page_size: page_size,
        sort_by: '-imdb_score',
        page: page_number,
        genre: category,
        })
    }

//    var url = base_url_api + api_method + get_parameters
    var url = base_url_api + get_parameters
    let response_json = await request_api(url)
    return response_json

}

async function get_json_response_movie_from_id(movie_id) {
    var url = base_url_api.slice(0, -1) + movie_id
    let response_json = await request_api(url)
    return response_json
}

// Best movie
async function get_best_movie() {
    let response_json = await get_json_response_movies(1)
    let best_movie = response_json.results[0]
    display_best_movie(best_movie)

    // link modal to best movie
    let btn = document.querySelector(".best-movie button")
    btn.addEventListener("click", function() {
        let modal = document.querySelector(".movie-modal");
        modal.style.display = "block"
        let best_movie = document.querySelector(".best-movie")
        let movie_id = best_movie.dataset.movieId
        load_movie_data_in_modal(movie_id)
    })
}

function display_best_movie(best_movie) {
    let best_movie_dom = document.querySelector(".best-movie")
    // load best movie title
    let title_dom_element = best_movie_dom.querySelector(".best-movie-title")
    title_dom_element.innerHTML = best_movie.title
    // load best movie image
    let img_dom_element = best_movie_dom.querySelector("img")
    img_dom_element.src = best_movie.image_url
    // load best movie id data
    best_movie_dom.dataset.movieId = best_movie.id

}

// Sliders
function init_slider(slider_dom) {
    // Set slider default page
    slider_dom.dataset.page = "1"

    // Init slider arrows
    update_slider_arrows(slider_dom)
    let prev_arrow_dom = slider_dom.querySelector(".slider-arrow-prev")
    prev_arrow_dom.addEventListener("click", function(elm){
        let target_page = elm.target.dataset.page
        let slider_dom = elm.target.parentNode.closest(".slider")
        slider_dom.dataset.page = target_page
        update_slider_movies(slider_dom)
    })

    let next_arrow_dom = slider_dom.querySelector(".slider-arrow-next")
    next_arrow_dom.addEventListener("click", function(elm){
        let target_page = elm.target.dataset.page
        let slider_dom = elm.target.parentNode.closest(".slider")
        slider_dom.dataset.page = target_page
        update_slider_movies(slider_dom)
    })

    // Init modal on movie slides
    let movie_slides_dom = slider_dom.querySelectorAll(".slides-movies div")
    console.log(movie_slides_dom)
    movie_slides_dom.forEach(function (slide_movie) {
        slide_movie.addEventListener("click", function() {
            let modal = document.querySelector(".movie-modal");
            modal.style.display = "block"
            let movie_id = slide_movie.dataset.movieId
            load_movie_data_in_modal(movie_id)
        })
    })

    update_slider_movies(slider_dom)
}

function update_slider_arrows(slider_dom) {
    let slider_page = slider_dom.dataset.page
    let prev_arrow_dom = slider_dom.querySelector(".slider-arrow-prev")
    let next_arrow_dom = slider_dom.querySelector(".slider-arrow-next")
    if (slider_page == "1") {
        prev_arrow_dom.style.display = "none";
    } else {
        prev_arrow_dom.style.display = "block";
        prev_arrow_dom.dataset.page = parseInt(slider_page, 10) - 1
    }

    next_arrow_dom.dataset.page = parseInt(slider_page, 10) + 1
}

async function update_slider_movies(slider_dom) {
    let category = slider_dom.dataset.category
    let page_number = slider_dom.dataset.page
    let page_size = 4

    let response_json = await get_json_response_movies(page_size, page_number, category)
    let movies = response_json.results
    display_movies_in_slider(slider_dom, movies)
    update_slider_arrows(slider_dom)
}

function display_movies_in_slider(slider_dom, movies) {
    // load movies images in slider
    movies.forEach(function (movie, i) {
        let slide_movie_dom = slider_dom.querySelector(
            ".slides-movies div:nth-child("+ (i+1).toString() +")"
        )
        let movie_img_dom = slide_movie_dom.querySelector("img")
        let movie_image = movie.image_url
        movie_img_dom.src = movie_image

        slide_movie_dom.dataset.movieId = movie.id
    });
}

// Modal
function init_modal() {
    // Get the modal
    let modal = document.querySelector(".movie-modal");

    // Get the <span> element that closes the modal
    let span = document.getElementsByClassName("close")[0];

    // When the user clicks on <span> (x), close the modal
    span.onclick = function() {
      modal.style.display = "none";
    }

    // When the user clicks anywhere outside of the modal, close it
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    }
}

async function load_movie_data_in_modal(movie_id) {
    // Get movie from api
    let movie = await get_json_response_movie_from_id(movie_id)

    // display movie datas in modal
    let movie_modal_dom = document.querySelector(".movie-modal")
    let modal_title_dom = movie_modal_dom.querySelector(".modal-header h2")
    modal_title_dom.innerHTML = movie.title
}


// Main function
(function() {
    get_best_movie()

    // init sliders
    let sliders = document.querySelectorAll(".slider")
    sliders.forEach(function (slider) {
        init_slider(slider)
    })

    init_modal()
})();

