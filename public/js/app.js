$.getJSON("/articles", function (articles) {
    articles.forEach(article => {
        console.log(article._id)
        let articleRow = `
        <div  class="card">
                <div class="card-header">
                    <h3>
                        <a class="article-link font-effect-shadow-multiple" target="_blank" rel="noopener noreferrer" href="${article.link}">${article.label}</a>
                        <a data-_id="${article._id}" data-toggle="modal" data-target="#myModal" class="btn btn-success save">Save Article</a>
                    </h3>
                </div>
            <div class="card-body">${article.summary}</div>
        </div>
        <br><br>`
        $("#attach").append(articleRow)

    })
})

//this will grab our favorited artilcles from the database

$.getJSON("/favorites", function (articles) {
    console.log("here are my articles: ", articles)
})

//route for grabbing a specific article by the id
$(document).on("click", ".save", function () {

    var thisId = $(this).attr("data-_id");
    console.log("this is the id ", thisId);
    // Now make an ajax call for the Article
    $.ajax({
        method: "PUT",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);


        })
});






$("#clear-all").on("click", function () {
    // Make an AJAX GET request to delete the articles from the db
    $.ajax({
        type: "DELETE",
        dataType: "json",
        url: "/clearall",
        // On a successful call, clear the #attach section
        success: function (response) {
            $("#attach").empty();
        }
    });
});


// Route for grabbing a specific Article by id, populate it with it's note


$(document).on("click", ".delete", function () {

    var thisId = $(this).attr("data-_id");
    console.log("this is the id ", thisId);
    // Now make an ajax call for the Article
    $.ajax({
        method: "DELETE",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
        })

})
//this will delete a saved article from the database
$(document).on("click", ".deleteFav", function () {

    var thisId = $(this).attr("data-_id");
    console.log("this is the id ", thisId);
    // Now make an ajax call for the Article
    $.ajax({
        method: "PUT",
        url: "/favorites/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);

            $(`#${thisId}`).remove();


        })

})

$(document).on("click", ".noteDelete", function () {

    var thisId = $(this).attr("data-_id");
    console.log("this is the id ", thisId);
    $(`.row${thisId}`).remove()
    // Now make an ajax call for the Article
    $.ajax({
        method: "DELETE",
        url: "/notes/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);


        })

})


$(document).on("click", ".add", function () {
    console.log("clicked")
    $(".modal-header").empty()
    $(".modal-footer").empty()
    var thisId = $(this).attr("data-_id");
    $.getJSON('/articles/' + thisId, function (res) {
        console.log("this is my article: ", res)


        let modalHeader = `
        <h5 class="modal-title" id="exampleModalLabel">${res.label}</h5>`


        let modalFooter = `<button type="button" class="btn btn-secondary close" data-dismiss="modal">Close</button>
        <button id="save-note" data-_id="${res._id}" type="button" class="btn btn-primary">Save changes</button>`

        if (res.notes) {
            $('#notes-container').empty();
            console.log("##### new note, ", res.notes)
            res.notes.forEach(note => {
                console.log("!!!", note)
                $.getJSON(`/notes/${note._id}`, function (res) {
                    let savedNote = `<div class="row${res._id} notes">
                                        <p><strong>Title:</strong> ${res.title}   <strong>Note:</strong> ${res.body}
                                        <button data-_id="${res._id}" type="button" class="btn btn-danger noteDelete">X</button>
                                        </p>
                                 </div>`
                    $('#notes-container').prepend(savedNote);
                })
            })

        }

        $(".modal-header").append(modalHeader)
        $(".modal-footer").append(modalFooter)

    })
})

$(document).on('click', '#save-note', function () {
    thisId = $(this).attr("data-_id");
    let title = $("#exampleModal .modal-body #title").val().trim()
    let body = $("#exampleModal .modal-body #body").val().trim()
    console.log("TRYing tot get title", title, body, thisId)
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
        method: "POST",
        url: `/articles/${thisId}`,
        data: {
            // Value taken from title input
            title: title,
            // Value taken from note textarea
            body: body
        }
    })
        // With that done
        .then(function (data) {
            // Log the response
            console.log(data);
            // Empty the notes section
            $("#exampleModal .modal-body #title").val('')
            $("#exampleModal .modal-body #body").val('')
        });
})



