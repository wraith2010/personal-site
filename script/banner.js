var imageIndex = -1;
var images = ["img/slideshow/SlideShow01.png",
        "img/slideshow/SlideShow02.png",
        "img/slideshow/SlideShow03.png"]
var del = 0.01;

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

function changeOpacity() {

        console.log(Object.keys(document.getElementById("rotating-images").style.filter));

        document.getElementById("rotating-images").style.filter = "brightness(0)";

        if (document.getElementById("rotating-images").style.opacity < 0) {
                advanceBackground();
                del = -1 * del;
        }
        else if (document.getElementById("rotating-images").style.opacity > 1) {
                del = -1 * del;
        }
}


function sethtml() {
        document.getElementById("rotating-images").style.backgroundImage = 'url(' + images[imageIndex] + ')';
        document.getElementById("rotating-images").style.backgroundPosition = '50% 50%';
}


window.setInterval(function () { advanceBackground(); }, 10000);