//gallery javascript

function galleryBlur(event, element){

    console.log(event + " : " + Object.keys(event));
	console.log(" activeElement : " + document.activeElement);

	if(isDescendant(document.activeElement, element))
	{
		console.log("parent");
		element.open = false;
		return;
	}
	
	console.log("Descendant");
	element.focus();
}


function isDescendant(parent, child) {
     var node = child.parentNode;
     while (node != null) {
         if (node == parent) {
             return true;
         }
         node = node.parentNode;
     }
     return false;
}