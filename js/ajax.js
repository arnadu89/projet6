var my_headers = new Headers();

var myInit = {
    method: "GET",
    headers: my_headers,
}

// http://localhost:8000/api/v1/genres/?
// format=json
// page_size=10
const base_url_api = "http://localhost:8000/api/v1/genres/?"

function get_page_movies() {
    var get_parameters = new URLSearchParams({
        format: 'json',
        page_size: '4',
    })
    var url = base_url_api + get_parameters
    fetch(url, myInit)
    .then(
        response => response.json()
    )
    .then(
        json_response => console.log(json_response)
    )
}

(function() {
    get_page_movies()
})();