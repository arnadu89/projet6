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

function set_parameters_for_movie_request(page_size, page_number=1) {
    let get_parameters = new URLSearchParams({
            format: 'json',
            page_size: page_size,
            sort_by: '-imdb_score',
            page: page_number,
            })
    return get_parameters
}

function set_parameters_for_movie_request_with_genre(page_size, page_number=1, genre) {
    let get_parameters = set_parameters_for_movie_request(page_size, page_number)
    get_parameters.append("genre", genre)
    return get_parameters
}

async function get_simple_json_response_movies(page_size, page_number=1) {
    let get_parameters = set_parameters_for_movie_request(page_size, page_number)
    let url = base_url_api + get_parameters
    let response_json = await request_api(url)
    return response_json
}

async function get_genre_json_response_movies(genre, page_size, page_number=1) {
    let get_parameters = set_parameters_for_movie_request_with_genre(page_size, page_number, genre)
    let url = base_url_api + get_parameters
    let response_json = await request_api(url)
    return response_json
}

async function get_json_response_movie_from_id(movie_id) {
    let url = base_url_api.slice(0, -1) + movie_id
    let response_json = await request_api(url)
    return response_json
}

// Dom manipulation
function change_child_image(dom_element, image_src, image_alt) {
    if (dom_element.hasChildNodes()) {
        dom_element.removeChild(dom_element.firstChild)
    }
    let img_dom_element = document.createElement('img')
    img_dom_element.src = image_src
    img_dom_element.alt = image_alt
    dom_element.appendChild(img_dom_element)
}

// Best movie
async function get_best_movie() {
    let response_json = await get_simple_json_response_movies(1)
    let best_movie_id = response_json.results[0].id
    let best_movie = await get_json_response_movie_from_id(best_movie_id)
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
    title_dom_element.textContent = best_movie.original_title
    // load best movie description
    let description_dom_element = best_movie_dom.querySelector(".best-movie-description")
    description_dom_element.textContent = best_movie.long_description
    // load best movie image
    let best_movie_div_image_dom = best_movie_dom.querySelector(".best-movie-div-image")
    change_child_image(
        best_movie_div_image_dom,
        best_movie.image_url,
        best_movie.original_title
    )

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
    let genre = slider_dom.dataset.genre
    let page_number = slider_dom.dataset.page
    let page_size = slider_dom.querySelectorAll(".slides-movies div").length
    let response_json

    if (genre !== undefined) {
        response_json = await get_genre_json_response_movies(genre, page_size, page_number)
    } else {
        response_json = await get_simple_json_response_movies(page_size, page_number)
    }

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

        change_child_image(
            slide_movie_dom,
            movie.image_url,
            movie.original_title
        )

        slide_movie_dom.dataset.movieId = movie.id
    });
}

// Modal
function init_modal() {
    // Get the modal
    let modal = document.querySelector(".movie-modal");

    // Get the <span> element that closes the modal
    let span = document.querySelector(".modal-close");

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
    // display title
    let modal_title_dom = movie_modal_dom.querySelector(".modal-header h2")
    modal_title_dom.textContent = movie.original_title
    // display image
    let movie_div_image_dom = movie_modal_dom.querySelector(".modal-movie-image")

    change_child_image(
        movie_div_image_dom,
        movie.image_url,
        movie.original_title
    )
    // display others infos
    let movie_infos_dom = movie_modal_dom.querySelectorAll(".modal-movie-infos li")
    movie_infos_dom.forEach(function (li){
        let li_data = li.dataset.value
        li.querySelector("span").textContent = movie[li_data]
    })
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
