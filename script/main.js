var API_VERSION = "1";
var BASE_API_URL = "https://www.googleapis.com";
var ENTER_KEY = "Enter";
// pagination
var total = 0;
var limit = 20;
var offset = 0;
var currentQuery = "";
var scrollBlock = false;
$(function () {
    $("#btn-search").on("click", function () {
        search($("#txt-search").val());
    });
    // events
    $(window).on("scroll", function () {
        if (window.innerHeight + window.pageYOffset >=
            document.body.offsetHeight - 50) {
            if (!scrollBlock) {
                offset += limit;
                scrollBlock = true;
                search(currentQuery, offset);
            }
        }
    });
    $("#txt-search").on("keypress", function (e) {
        if (e.code == ENTER_KEY) {
            $("#txt-search").removeClass("is-invalid");
            var feedBack = $("#search-feedback");
            feedBack.removeClass("d-block");
            if ($("#txt-search").val() == "") {
                console.warn("Empty query");
                $("#txt-search").addClass("is-invalid");
                feedBack.addClass("d-block");
                return;
            }
            search($("#txt-search").val());
        }
    });
    function loading() {
        var loading_bottom = document.createElement("div");
        loading_bottom.id = "loading-bottom";
        loading_bottom.style.padding = "8px";
        loading_bottom.classList.add("text-center");
        var img = document.createElement("img");
        img.src = "img/loading.gif";
        loading_bottom.append(img);
        return loading_bottom;
    }
    function search(query, offset) {
        if (offset === void 0) { offset = 0; }
        // end result
        if (offset != 0 && offset + limit > total) {
            return;
        }
        var url = "".concat(BASE_API_URL, "/books/v").concat(API_VERSION, "/volumes?") +
            new URLSearchParams({
                q: query,
                startIndex: "".concat(offset),
                maxResults: "".concat(limit),
            });
        console.info("[URL] ", url);
        // loading
        if (offset == 0) {
            $("#loading").css("display", "block");
            $("#card-list").html("");
        }
        else {
            $("#loading").css("display", "none");
            // loading bottom
            $("#card-list").append(loading());
        }
        fetch(url, {
            headers: new Headers(),
            method: "GET",
        })
            .then(function (reponse) {
            return reponse.json();
        })
            .then(function (data) {
            var books = data["totalItems"] != 0 ? data["items"] : [];
            total = data["totalItems"];
            var oldList = $("#card-list");
            $("#loading").css("display", "none");
            $("#loading-bottom").remove();
            if (books.length == 0) {
                var emptyList = document.createElement("div");
                emptyList.id = "card-list";
                emptyList.className = "col mb-4 text-muted";
                emptyList.innerHTML = "No results found";
                oldList.replaceWith(emptyList);
            }
            else {
                if (offset == 0) {
                    oldList.replaceWith(buildListView(books));
                }
                else {
                    var newlist = $("#card-list");
                    for (var i = 0; i < books.length; i++) {
                        var oneCard = buildCard(books[i]);
                        newlist.append(oneCard);
                    }
                }
            }
            currentQuery = query;
            scrollBlock = false;
        })
            .catch(function (error) {
            console.log("Error: ", error);
        });
    }
    function buildListView(books) {
        var cardList = document.createElement("div");
        cardList.className = "col mb-4";
        cardList.id = "card-list";
        books.forEach(function (book) {
            var card = buildCard(book);
            cardList.appendChild(card);
        });
        return cardList;
    }
    function buildCard(book) {
        var card = document.createElement("div");
        card.className = "card shadow-sm mb-2";
        card.insertAdjacentHTML("afterbegin", "\n        <div class=\"card-header d-block d-sm-none\">\n            <h5 class=\"text-gray\">".concat(book["volumeInfo"]["title"], "</h5>\n        </div>\n        <div class=\"card-body d-flex\">\n            <div style=\"min-width: 128px;\">\n                <img  class=\"fluid-img\" alt=\"image not available\" src=").concat(book["volumeInfo"]["imageLinks"] != undefined
            ? book["volumeInfo"]["imageLinks"]["smallThumbnail"]
            : "img/thumbnail.png", ">\n            </div>\n            <div class=\"px-3 flex-grow-1\">\n                <h4 class=\"text-gray d-none d-sm-block\">").concat(book["volumeInfo"]["title"], "</h4>\n                <div class=\"d-flex flex-column\" >\n                    <p class=\"order-sm-2\">\n                        ").concat(book["searchInfo"] != undefined
            ? book["searchInfo"]["textSnippet"]
            : "", "\n                    </p>\n                    <p class=\"order-sm-1 text-gray text-muted\">\n                        ").concat(book["volumeInfo"]["authors"] != undefined
            ? book["volumeInfo"]["authors"]
                .map(function (item, i) {
                return item.trim();
            })
                .join("")
            : "author unknown", "\n                        ").concat(book["volumeInfo"]["publishedDate"] != undefined
            ? " | " +
                formatDate(book["volumeInfo"]["publishedDate"])
            : "", "\n                    </p>\n                </div>\n                <a href=").concat(book["volumeInfo"]["infoLink"] != undefined
            ? book["volumeInfo"]["infoLink"]
            : "", " class=\"btn btn-primary btn-sm text-white\" target=\"_blank\" >See more\n                </a>\n            </div>\n        </div>\n    "));
        return card;
    }
    function formatDate(date) {
        if (date == null) {
            return "";
        }
        var regex = new RegExp("^\\d{4}-\\d{2}-\\d{2}$");
        if (regex.test(date)) {
            return date.slice(0, 4);
        }
        return date;
    }
});
