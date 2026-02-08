$(async function(){
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