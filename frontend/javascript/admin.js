$(async function(){
    try {
        const response = await fetch('api/AdminCheck', {
            method: 'GET',
        });

        const data = await response.json();
        if (!data.admin) {
            window.location.href="/"
        }
        else{
            alert("Admin vagy")
        }
    } catch (error) {
        
    }
});