document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("login_button").addEventListener("click", login_modal);
});

function init_child_modal() {
    
    let modal_frame = document.getElementById("modal_frame");
    
    
    let childModal = document.createElement("div");
    childModal.id = "childModal";
    childModal.classList.add("modal", "fade");
    childModal.tabIndex = -1;
    childModal.ariaHidden = true;
    childModal.setAttribute("aria-labelledby", "childModalLabel");

    
    let childModal_dialog = document.createElement("div");
    childModal_dialog.classList.add("modal-dialog", "modal-dialog-centered");


    let childModal_content = document.createElement("div");
    childModal_content.classList.add("modal-content");
    childModal_content.id = "childModal_content";


    childModal_dialog.appendChild(childModal_content);
    childModal.appendChild(childModal_dialog);
    modal_frame.appendChild(childModal);

}


function init_modal_content_template(id, type){
    let modal_content = document.getElementById(id);
    modal_content.innerText = "";

    
    let modal_header = document.createElement("div");
    let modal_body = document.createElement("div");
    let modal_footer = document.createElement("div");

    modal_header.classList.add("modal-header");
    modal_header.id = type + "Modal_header"
    modal_body.classList.add("modal-body", "d-flex", "flex-column", "align-items-center");
    modal_body.id = type + "Modal_body"
    modal_footer.classList.add("modal-footer", "d-flex", "flex-column", "align-items-center");
    modal_footer.id = type + "Modal_footer";

    modal_content.appendChild(modal_header);
    modal_content.appendChild(modal_body);
    modal_content.appendChild(modal_footer);

}


function login_modal() {
    
    init_modal_content_template("monadModal_content", "monad");


    let modal_header = document.getElementById("monadModal_header");
    let modal_body = document.getElementById("monadModal_body");
    let modal_footer = document.getElementById("monadModal_footer");


    let title = document.createElement("h1");
    title.classList.add("text-danger", "modal-title", "fs-2");
    title.id = "modalMonadLabel";
    title.innerText = "Bejelentkezés";
    let close_button = document.createElement("button");
    close_button.classList.add("btn-close");
    close_button.type = "button";
    close_button.ariaLabel = "Close";
    close_button.setAttribute("data-bs-dismiss", "modal");

    let e_mail = document.createElement("input");
    e_mail.type = "email";
    e_mail.id = "usr_email";
    e_mail.placeholder = "E-mail";
    e_mail.classList.add("form-control", "modal_input", "w-75", "mb-4", "mt-2");
    let input_group_for_passw = document.createElement("div");
    input_group_for_passw.classList.add("input-group", "w-75", "mb-4");
    let passw = document.createElement("input");
    passw.type = "password";
    passw.id = "usr_passw";
    passw.placeholder = "Jelszó";
    passw.classList.add("form-control", "modal_input");
    let see_passw_button = document.createElement("button");
    see_passw_button.classList.add("btn", "btn-outline-secondary");
    see_passw_button.id = "passw_button";
    see_passw_button.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>";
    see_passw_button.addEventListener("click", seePassw);
    input_group_for_passw.appendChild(passw);
    input_group_for_passw.appendChild(see_passw_button);
    let login_button = document.createElement("button");
    login_button.classList.add("btn", "btn-danger", "w-75", "mb-2");
    login_button.innerText = "Bejelentkezés";
    login_button.type = "button";
    
    let p = document.createElement("p");
    p.classList.add("mt-2");
    p.innerText = "Nincs még fiókod? Hozz létre egyet!";
    let regis_button = document.createElement("button");
    regis_button.classList.add("btn", "btn-outline-danger", "w-75", "mb-2");
    regis_button.innerText = "Regisztráció";
    regis_button.type = "button";
    regis_button.setAttribute("data-bs-target", "#childModal");
    regis_button.setAttribute("data-bs-toggle", "modal");
    
    
    modal_header.appendChild(title);
    modal_header.appendChild(close_button);
    
    modal_body.appendChild(e_mail);
    modal_body.appendChild(input_group_for_passw);
    modal_body.appendChild(login_button);
    
    modal_footer.appendChild(p);
    modal_footer.appendChild(regis_button);

    init_child_modal();
    init_modal_content_template("childModal_content", "child");
    regis_modal();
    
}

function regis_modal() {

    
    let modal_header = document.getElementById("childModal_header");
    let modal_body = document.getElementById("childModal_body");
    let modal_footer = document.getElementById("childModal_footer");


    let title = document.createElement("h1");
    title.classList.add("text-danger", "modal-title", "fs-2");
    title.id = "modalChildLabel";
    title.innerText = "Regisztráció";
    let close_button = document.createElement("button");
    close_button.classList.add("btn-close");
    close_button.type = "button";
    close_button.ariaLabel = "Close";
    close_button.setAttribute("data-bs-dismiss", "modal");

    let input_group_for_name = document.createElement("div");
    input_group_for_name.classList.add("input-group", "w-75", "mb-4", "mt-2");
    let first_name = document.createElement("input");
    first_name.id = "first_name";
    first_name.type = "text"
    first_name.placeholder = "Keresztnév";
    first_name.classList.add("modal_input", "form-control");
    let last_name = document.createElement("input");
    last_name.id = "last_name";
    last_name.type = "text"
    last_name.placeholder = "Vezetéknév";
    last_name.classList.add("modal_input", "form-control");
    input_group_for_name.appendChild(last_name);
    input_group_for_name.appendChild(first_name);
    let birth_date = document.createElement("input");
    birth_date.id = "birth_date";
    birth_date.placeholder = "Születési dátum";
    birth_date.type = "text";
    birth_date.addEventListener("focus", birthDateOnFocus);
    birth_date.addEventListener("blur", birthDateLostFocus);
    birth_date.classList.add("form-control", "modal_input", "mb-4", "w-75");
    let e_mail = document.createElement("input");
    e_mail.type = "email";
    e_mail.id = "new_usr_email";
    e_mail.placeholder = "E-mail";
    e_mail.classList.add("form-control", "modal_input", "w-75", "mb-4");
    let input_group_for_passw = document.createElement("div");
    input_group_for_passw.classList.add("input-group", "w-75", "mb-4");
    let passw = document.createElement("input");
    passw.type = "password";
    passw.id = "new_usr_passw";
    passw.placeholder = "Jelszó";
    passw.classList.add("form-control", "modal_input");
    let see_passw_button = document.createElement("button");
    see_passw_button.classList.add("btn", "btn-outline-secondary");
    see_passw_button.id = "passw_button";
    see_passw_button.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>";
    see_passw_button.addEventListener("click", seePassw);
    input_group_for_passw.appendChild(passw);
    input_group_for_passw.appendChild(see_passw_button);
    
    let regis_button = document.createElement("button");
    regis_button.classList.add("btn", "btn-danger", "w-75", "mb-2", "mt-2");
    regis_button.innerText = "Regisztráció";
    regis_button.type = "button";

    
    modal_header.appendChild(title);
    modal_header.appendChild(close_button);
    
    modal_body.appendChild(input_group_for_name);
    modal_body.appendChild(birth_date);
    modal_body.appendChild(e_mail);
    modal_body.appendChild(input_group_for_passw);
    
    modal_footer.appendChild(regis_button);
    
}

function seePassw(){
    
    let passw_input = this.previousElementSibling;
    if (passw_input.type === "password") {
        passw_input.type = "text";
        this.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-slash-fill\" viewBox=\"0 0 16 16\"><path d=\"m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z\"/><path d=\"M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z\"/></svg>";
    } else {
        passw_input.type = "password";
        this.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>";
    }
}

function birthDateOnFocus(){
    this.type = "date";
    
    
}

function birthDateLostFocus(){
    this.type = "text";
}