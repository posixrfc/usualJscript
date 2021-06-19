document.addEventListener("DOMContentLoaded",()=>{
	let bar=document.body.appendChild(document.createElement("header"));
	let body=document.getElementById("body");
	bar.style.position="fixed";
	bar.style.left=body.style.left=bar.style.top="0px";
	bar.style.width=body.style.width="100%";
	bar.style.backgroundColor="#169bd5";
	bar.style.height=body.style.top="3rem";
	body.style.position="fixed";
	let btn=bar.appendChild(document.createElement("img"));
	body.style.overflow="scroll";
	body.style.bottom="0px";
	btn.style.width="3rem";
	btn.style.height="3rem";
	btn.style.padding="0.5rem 0.5rem 0.5rem 1.25rem"
	btn.style.cursor="pointer";
	btn.src="../lib/back.png";
	btn.onclick=()=>{history.back();};
});