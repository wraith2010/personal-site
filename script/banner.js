var imageIndex = -1;
var images = ["img/slideshow/slide-01.jpg",
        "img/slideshow/slide-02.jpg",
        "img/slideshow/slide-03.jpg",
        "img/slideshow/slide-04.jpg",
        "img/slideshow/slide-05.jpg"];
var captions = ["Me standing infront of \"Big Ben\" in london. The joke writes its self.",
        "Long horns outside our cabin in Virgina",
        "Teaching light painting to our Youth Group",
        "Riding the Tom Sawyer in Saint louis while visiting for the total eclipse.",
        "Enjoying a drink in the Piazza San Marco in Venice"]


function advanceBackground() {
        imageIndex += 1;
        if (imageIndex >= images.length) {
                imageIndex = 0;
        }
        sethtml();
}

function rewindBackground() {
        imageIndex += -1;
        if (imageIndex < 0) {
                imageIndex = images.length - 1;
        }
        sethtml();
}

function sethtml() {
        document.getElementById("rotating-images").style.background = 'linear-gradient(rgba(0, 0, 0, 0.40),rgba(0, 0, 0, 0.40)), url(' + images[imageIndex] + ')';
        document.getElementById("caption").innerText = captions[imageIndex];
}

window.setInterval(function () { advanceBackground(); }, 10000);