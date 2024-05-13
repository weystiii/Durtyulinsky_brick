 const hederEl = document.getElementById("header")
 window.addEventListener("scroll", function(){
 	const scrollPos = window.scrollY

 	if(scrollPos > 10) {
 		hederEl.classList.add("wrapper_mini")
 	} else {
 		hederEl.classList.remove("wrapper_mini")
 	}
 })