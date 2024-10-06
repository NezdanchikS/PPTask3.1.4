$(async function () {
    const data = await (await fetch("http://localhost:8080/api/user")).json()
    const roles = data["roles"]
    if (roles.some(role => role.name === "ROLE_ADMIN")) {
        await loadAdminTable()
        await $("#sidebar").html("<li class=\"nav-item\">\n" +
            "                <a id=\"admin-button\" href=\"#\" class=\"nav-link active\" aria-current=\"page\">\n" +
            "                    Admin\n" +
            "                </a>\n" +
            "            </li>\n" +
            "            <li class=\"nav-item\">\n" +
            "                <a id=\"user-button\" href=\"#\" class=\"nav-link\" aria-current=\"page\">\n" +
            "                    User\n" +
            "                </a>\n" +
            "            </li>")
    } else if (roles.some(role => role.name === "ROLE_USER")) {
        await loadUserTable()
        await $("#sidebar").html("<li class=\"nav-item\">\n" +
            "                <a id=\"user-button\" href=\"#\" class=\"nav-link active\" aria-current=\"page\">\n" +
            "                    User\n" +
            "                </a>\n" +
            "            </li>")
    }

    fetch("http://localhost:8080/api/user")
        .then(res => res.json())
        .then(data => {
            $('#header-username').append(data.username);
            let roles = data.roles.map(role => " " + role.name.substring(5));
            $('#header-roles').append(roles);
        })

})
$(document).on("click", "#user-button", async function (event) {
    event.preventDefault()
    if (!$(this).hasClass("active")) {
        await loadUserTable()
    }
})

async function loadUserTable() {
    await loadTable("http://localhost:8080/api/user")
    await $("h1").text("User panel")
    await $("h5").text("About user")
    await $("#admin-button").removeClass("active")
    await $("#user-button").addClass("active")
    await $("#admin-panel").remove()
    await $("thead").html("<tr>\n" +
        "                            <th>\n" +
        "                                ID\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                First Name\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Last Name\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Age\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Email\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Role\n" +
        "                            </th>\n")
}

$(document).on("click", "#admin-button", async function (event) {
    event.preventDefault()
    if (!$(this).hasClass("active")) {
        await loadAdminTable()
    }
})

async function loadAdminTable() {
    await loadTable("http://localhost:8080/api/users")
    await $("h1").text("Admin panel")
    await $("h5").text("All users")
    await $("#admin-button").addClass("active")
    await $("#user-button").removeClass("active")
    const panel = await $("<ul id=\"admin-panel\" class=\"nav nav-tabs\">\n" +
        "                <li class=\"nav-item\">\n" +
        "                    <a id=\"admin-page-button\" class=\"nav-link active\" aria-current=\"page\" href=\"#\">User table</a>\n" +
        "                </li>\n" +
        "                <li class=\"nav-item\">\n" +
        "                    <a id=\"add-page-button\" class=\"nav-link\" href=\"#\">New User</a>\n" +
        "                </li>\n" +
        "            </ul>")
    await $("#id5").prepend(panel)
    await $("thead").html("<tr>\n" +
        "                            <th>\n" +
        "                                ID\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                First Name\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Last Name\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Age\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Email\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Role\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Edit\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Delete\n" +
        "                            </th>")
}

async function loadTable(url) {
    const heading = document.querySelector("thead")
    const table = document.querySelector("tbody")
    const response = await fetch(url);
    let data = await response.json();

    let flag = true
    if (typeof data[Symbol.iterator] !== 'function') {
        data = [data]
        flag = false
    }
    table.innerHTML = ""

    for (const row of data) {
        const rowElement = document.createElement("tr");

        const {id, firstName, lastName, age, username, roles} = row;

        const elements = [id, firstName, lastName, age, username]
        let roleNames = ''
        roles.forEach(role => {
            if (role.name === "ROLE_USER") {
                roleNames += "USER "
            } else if (role.name === "ROLE_ADMIN") {
                roleNames += "ADMIN "
            }
        })
        roleNames.trim()
        elements.push(roleNames)
        for (const element of elements) {
            const cellElement = document.createElement("td")

            cellElement.textContent = element
            rowElement.appendChild(cellElement)
        }

        if (flag) {
            const editButton = document.createElement("button")
            editButton.type = "button"
            editButton.classList.add("btn")
            editButton.classList.add("btn-primary")
            editButton.setAttribute("data-bs-toggle", "modal")
            editButton.setAttribute("data-bs-target", "#modalEdit")
            editButton.setAttribute("edit-id", id)
            editButton.textContent = "Edit"


            const deleteButton = document.createElement("button")
            deleteButton.type = "button"
            deleteButton.classList.add("btn")
            deleteButton.classList.add("btn-danger")
            deleteButton.setAttribute("data-bs-toggle", "modal")
            deleteButton.setAttribute("data-bs-target", "#modalDelete")
            deleteButton.setAttribute("delete-id", id)
            deleteButton.textContent = "Delete"

            const cellEdit = document.createElement("td")
            cellEdit.appendChild(editButton)
            rowElement.appendChild(cellEdit)

            const cellDelete = document.createElement("td")
            cellDelete.appendChild(deleteButton)
            rowElement.appendChild(cellDelete)
        }

        table.appendChild(rowElement)
    }

}

$(document).on("click", ".btn[edit-id]", async function () {
    await updateModal($(this), "edit")
})

$(document).on("click", ".btn[delete-id]", async function () {
    await updateModal($(this), "delete")
})

async function updateModal(object, prefix) {
    const id = object.attr(prefix + "-id")
    const response = await fetch("http://localhost:8080/api/users/" + id);
    let data = await response.json();
    const {firstName, lastName, age, username, password, roles} = data
    await $("form").trigger("reset")
    await $(`#${prefix}InputId`).attr("value", id)
    await $(`#${prefix}InputFirstName`).attr("value", firstName)
    await $(`#${prefix}InputLastName`).attr("value", lastName)
    await $(`#${prefix}InputAge`).attr("value", age)
    await $(`#${prefix}InputEmail`).attr("value", username)
    await $(`#${prefix}InputPassword`).attr("value", password)
    const values = []
    roles.forEach(role => {
        if (role.name === "ROLE_ADMIN") {
            values.push(2)
        } else if (role.name === "ROLE_USER") {
            values.push(1)
        }
    })
    await $(`#${prefix}InputState`).val(values)
}

$(document).on("submit", "#inputEditForm", async function (event) {
    event.preventDefault()
    const roles = []
    $("#editInputState").val().forEach(role => {
        roles.push({
            "id": parseInt(role)
        })
    })
    await fetch("http://localhost:8080/api/users", {
        method: "PATCH",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: parseInt($("#editInputId").val()),
            username: $("#editInputEmail").val(),
            password: $("#editInputPassword").val(),
            firstName: $("#editInputFirstName").val(),
            lastName: $("#editInputLastName").val(),
            age: parseInt($("#editInputAge").val()),
            roles: roles
        })
    })
    $("#modalEdit").modal("hide")
    await loadTable("http://localhost:8080/api/users")
})

$(document).submit("#inputPostForm", async function (event) {
    console.log(event)
    event.preventDefault()
    const roles = []
    $("#inputState").val().forEach(role => {
        roles.push({
            "id": parseInt(role)
        })
    })
    await fetch("http://localhost:8080/api/users", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: $("#email").val(),
            password: $("#password").val(),
            firstName: $("#firstName").val(),
            lastName: $("#lastName").val(),
            age: parseInt($("#age").val()),
            roles: roles
        })
    })
    await loadAdminPage()
})

$("#inputDeleteForm").on("submit", async function (event) {
    event.preventDefault()
    await fetch("http://localhost:8080/api/users/" + $("#deleteInputId").val(), {
        method: "DELETE"
    })
    $("#modalDelete").modal("hide")
    await loadTable("http://localhost:8080/api/users")
})

$(document).on("click", "#admin-page-button", async function (event) {
    event.preventDefault()
    if (!$(this).hasClass("active")) {
        await loadAdminPage()
    }
})

async function loadAdminPage() {
    await $("#admin-page-button").addClass("active")
    await $("#add-page-button").removeClass("active")
    await $("#page").html("<div class=\"d-flex align-items-center highlight-toolbar ps-3 pe-2 py-1 border-0 border-bottom\">\n" +
        "                    <h5>All users</h5>\n" +
        "                </div>\n" +
        "\n" +
        "                <div style=\"background-color: white; padding: 1rem;\">\n" +
        "                    <table class=\"table table-striped\">\n" +
        "                        <thead>\n" +
        "                        <tr>\n" +
        "                            <th>\n" +
        "                                ID\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                First Name\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Last Name\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Age\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Email\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Role\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Edit\n" +
        "                            </th>\n" +
        "                            <th>\n" +
        "                                Delete\n" +
        "                            </th>\n" +
        "                        </tr>\n" +
        "                        </thead>\n" +
        "                        <tbody id=\"user-list\">\n" +
        "                        </tbody>\n" +
        "                    </table>\n" +
        "\n" +
        "                </div>")
    await loadTable("http://localhost:8080/api/users")
}

$(document).on("click", "#add-page-button", async function (event) {
    event.preventDefault()
    if (!$(this).hasClass("active")) {
        await loadAddPage()
    }
})

async function loadAddPage() {
    await $("#add-page-button").addClass("active")
    await $("#admin-page-button").removeClass("active")
    await $("#page").html("<div class=\"d-flex align-items-center highlight-toolbar ps-3 pe-2 py-1 border-0 border-bottom\">\n" +
        "                    <h5>Add new user</h5>\n" +
        "                </div>\n" +
        "\n" +
        "                <div style=\"background-color: white; padding: 10pt;\">\n" +
        "                    <form id=\"inputPostForm\">\n" +
        "                        <div class=\"form-group mb-2 mx-auto col-5 col-md-4 col-lg-3\">\n" +
        "                            <label for=\"firstName\"><b>First name</b></label>\n" +
        "                            <input type=\"text\" class=\"form-control\" id=\"firstName\" placeholder=\"First name\" required>\n" +
        "                        </div>\n" +
        "                        <div class=\"form-group mb-2 mx-auto col-5 col-md-4 col-lg-3\">\n" +
        "                            <label for=\"lastName\"><b>Last name</b></label>\n" +
        "                            <input type=\"text\" class=\"form-control\" id=\"lastName\" placeholder=\"Last name\" required>\n" +
        "                        </div>\n" +
        "                        <div class=\"form-group mb-2 mx-auto col-5 col-md-4 col-lg-3\">\n" +
        "                            <label for=\"age\"><b>Age</b></label>\n" +
        "                            <input type=\"number\" class=\"form-control\" id=\"age\" placeholder=\"Age\" required>\n" +
        "                        </div>\n" +
        "                        <div class=\"form-group mb-2 mx-auto col-5 col-md-4 col-lg-3\">\n" +
        "                            <label for=\"email\"><b>Email</b></label>\n" +
        "                            <input type=\"email\" class=\"form-control\" id=\"email\" placeholder=\"Email\"\n" +
        "                                   aria-describedby=\"emailHelp\" required>\n" +
        "                        </div>\n" +
        "                        <div class=\"form-group mb-2 mx-auto col-5 col-md-4 col-lg-3\">\n" +
        "                            <label for=\"password\"><b>Password</b></label>\n" +
        "                            <input type=\"password\" class=\"form-control\" id=\"password\" placeholder=\"Password\" required>\n" +
        "                        </div>\n" +
        "                        <div class=\"form-group mb-2 mx-auto col-5 col-md-4 col-lg-3\">\n" +
        "                            <label for=\"inputState\"><b>Role</b></label>\n" +
        "                            <select id=\"inputState\" multiple size=\"2\" class=\"form-control\">\n" +
        "                                <option value=\"1\">USER</option>\n" +
        "                                <option value=\"2\">ADMIN</option>\n" +
        "                            </select>\n" +
        "                        </div>\n" +
        "                        <button type=\"submit\" class=\"btn btn-success btn-lg\" style=\"margin: 10pt;\">Add new user</button>\n" +
        "                    </form>\n" +
        "\n" +
        "                </div>")
}

$(window).on('beforeunload', function () {
    $(window).scrollTop(0);
});