var imageIndex = -1;
var headerImages = ["img/slideshow/slide-01.jpg", "img/slideshow/slide-02.jpg","img/slideshow/slide-03.jpg","img/slideshow/slide-04.jpg","img/slideshow/slide-05.jpg"];

function rotateBackground()
{
        imageIndex+=1;
        if(imageIndex>=headerImages.length){
                imageIndex=0;
        }
        document.getElementById("header").style.backgroundImage  = "url('" + headerImages[imageIndex] + "')";
}

window.setInterval(function(){rotateBackground();}, 10000);