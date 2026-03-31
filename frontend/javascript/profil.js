import { getNavbar } from "./locale.js";
import { modalInit } from "./modal.js";
$(async function(){

    await getNavbar("hu", "http://127.0.0.1:3000/profil".split("/"));
    await modalInit("hu");

    try {
        const response = await fetch('api/LoginCheck', {
            method: 'GET',
        });

        const data = await response.json();
        if (!data.allapot) {
            window.location.href="/"
        }
        else{
            alert("Be vagy jeletnkezve")
        }
    } catch (error) {
        console.log("hiba: " + error)
    }
});

/*
aktív foglásaim
korábbi foglásaim

rolunk cim id => class
*/