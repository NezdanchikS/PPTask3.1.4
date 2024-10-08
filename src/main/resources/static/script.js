$(async function () {
    const apiUrl = `${API_BASE_URL}/user`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        const roles = data["roles"];
        if (roles.some(role => role.name === "ROLE_ADMIN")) {
            await loadAdminTable();
            await $("#sidebar").html(`
                <li class="nav-item">
                    <a id="admin-button" href="#" class="nav-link active" aria-current="page">
                        Admin
                    </a>
                </li>
                <li class="nav-item">
                    <a id="user-button" href="#" class="nav-link" aria-current="page">
                        User
                    </a>
                </li>
            `);
        } else if (roles.some(role => role.name === "ROLE_USER")) {
            await loadUserTable();
            await $("#sidebar").html(`
                <li class="nav-item">
                    <a id="user-button" href="#" class="nav-link active" aria-current="page">
                        User
                    </a>
                </li>
            `);
        }

        // Используем уже полученные данные
        $('#header-username').append(data.username);
        let roleNames = data.roles.map(role => " " + role.name.substring(5));
        $('#header-roles').append(roleNames);
    } catch (error) {
        console.error("Ошибка при получении данных пользователя:", error);
    }
});

$(document).on("click", "#user-button", async function (event) {
    event.preventDefault();
    if (!$(this).hasClass("active")) {
        await loadUserTable();
    }
});

async function loadUserTable() {

    const userCreationForm = document.querySelector("#inputPostForm");
    if (userCreationForm) {
        userCreationForm.style.display = "none";
    }

    const adminPanel = document.querySelector("#admin-panel");
    if (adminPanel) {
        adminPanel.remove();
    }

    if (!document.querySelector("#user-table")) {
        $("#page").html(`
            <div class="d-flex align-items-center highlight-toolbar ps-3 pe-2 py-1 border-0 border-bottom">
                <h5>User panel</h5>
            </div>
            <div style="background-color: white; padding: 1rem;">
                <table class="table table-striped" id="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Age</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody></tbody>
                </table>
            </div>
        `);
    }


    await loadTable(`${API_BASE_URL}/user`);
    await $("h1").text("User panel");
    await $("h5").text("About user");
    await $("#admin-button").removeClass("active");
    await $("#user-button").addClass("active");
    await $("#admin-panel").remove();
    await $("thead").html(`
        <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Role</th>
        </tr>
    `);
}

$(document).on("click", "#admin-button", async function (event) {
    event.preventDefault();
    if (!$(this).hasClass("active")) {
        await loadAdminTable();
    }
});

async function loadAdminTable() {
    await loadTable(`${API_BASE_URL}/users`);
    await $("h1").text("Admin panel");
    await $("h5").text("All users");
    await $("#admin-button").addClass("active");
    await $("#user-button").removeClass("active");
    const panel = await $(`
        <ul id="admin-panel" class="nav nav-tabs">
            <li class="nav-item">
                <a id="admin-page-button" class="nav-link active" aria-current="page" href="#">User table</a>
            </li>
            <li class="nav-item">
                <a id="add-page-button" class="nav-link" href="#">New User</a>
            </li>
        </ul>
    `);
    await $("#id5").prepend(panel);
    await $("thead").html(`
        <tr>
            <th>ID</th>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Age</th>
            <th>Email</th>
            <th>Role</th>
            <th>Edit</th>
            <th>Delete</th>
        </tr>
    `);
}

async function loadTable(url) {
    const response = await fetch(url);
    if (!response.ok) {
        console.error(`Ошибка при загрузке таблицы: ${response.statusText}`);
        return;
    }
    let data = await response.json();

    let flag = true;
    if (typeof data[Symbol.iterator] !== 'function') {
        data = [data];
        flag = false;
    }

    const table = document.querySelector("tbody");
    table.innerHTML = "";

    for (const row of data) {
        const rowElement = document.createElement("tr");

        const {id, firstName, lastName, age, username, roles} = row;

        const elements = [id, firstName, lastName, age, username];
        let roleNames = '';
        roles.forEach(role => {
            if (role.name === "ROLE_USER") {
                roleNames += "USER ";
            } else if (role.name === "ROLE_ADMIN") {
                roleNames += "ADMIN ";
            }
        });
        roleNames = roleNames.trim();
        elements.push(roleNames);
        for (const element of elements) {
            const cellElement = document.createElement("td");
            cellElement.textContent = element;
            rowElement.appendChild(cellElement);
        }

        if (flag) {
            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.classList.add("btn", "btn-primary");
            editButton.setAttribute("data-bs-toggle", "modal");
            editButton.setAttribute("data-bs-target", "#modalEdit");
            editButton.setAttribute("edit-id", id);
            editButton.textContent = "Edit";

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.classList.add("btn", "btn-danger");
            deleteButton.setAttribute("data-bs-toggle", "modal");
            deleteButton.setAttribute("data-bs-target", "#modalDelete");
            deleteButton.setAttribute("delete-id", id);
            deleteButton.textContent = "Delete";

            const cellEdit = document.createElement("td");
            cellEdit.appendChild(editButton);
            rowElement.appendChild(cellEdit);

            const cellDelete = document.createElement("td");
            cellDelete.appendChild(deleteButton);
            rowElement.appendChild(cellDelete);
        }

        table.appendChild(rowElement);
    }
}

$(document).on("click", ".btn[edit-id]", async function () {
    await updateModal($(this), "edit");
});

$(document).on("click", ".btn[delete-id]", async function () {
    await updateModal($(this), "delete");
});

async function updateModal(object, prefix) {
    const id = object.attr(`${prefix}-id`);
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`);
        if (!response.ok) {
            throw new Error(`Ошибка при получении пользователя с id ${id}`);
        }
        let data = await response.json();
        const {firstName, lastName, age, username, password, roles} = data;
        $("form").trigger("reset");
        $(`#${prefix}InputId`).attr("value", id);
        $(`#${prefix}InputFirstName`).attr("value", firstName);
        $(`#${prefix}InputLastName`).attr("value", lastName);
        $(`#${prefix}InputAge`).attr("value", age);
        $(`#${prefix}InputEmail`).attr("value", username);
        $(`#${prefix}InputPassword`).attr("value", password);
        const values = [];
        roles.forEach(role => {
            if (role.name === "ROLE_ADMIN") {
                values.push(2);
            } else if (role.name === "ROLE_USER") {
                values.push(1);
            }
        });
        $(`#${prefix}InputState`).val(values);
    } catch (error) {
        console.error(`Ошибка при обновлении модального окна (${prefix}):`, error.message);
    }
}

$(document).on("submit", "#inputEditForm", async function (event) {
    event.preventDefault();
    const roles = $("#editInputState").val().map(role => ({
        "id": parseInt(role)
    }));
    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
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
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении пользователя');
        }

        $("#modalEdit").modal("hide");
        await loadTable(`${API_BASE_URL}/users`);
    } catch (error) {
        console.error("Ошибка при обновлении пользователя:", error.message);
        alert("Ошибка при обновлении пользователя: " + error.message);
    }
});

$(document).on("submit", "#inputPostForm", async function (event) {
    console.log("Отправка формы создания пользователя");
    event.preventDefault();

    const roles = $("#inputState").val().map(role => ({
        "id": parseInt(role)
    }));

    try {
        const response = await fetch(`${API_BASE_URL}/users`, {
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
        });

        if (!response.ok) {
            throw new Error('Ошибка при создании пользователя');
        }

        console.log("Пользователь успешно создан");
        await loadAdminPage();

    } catch (error) {
        console.error("Ошибка при создании пользователя:", error.message);
        alert("Ошибка при создании пользователя: " + error.message);
    }
});

$("#inputDeleteForm").on("submit", async function (event) {
    event.preventDefault();
    const id = $("#deleteInputId").val();
    try {
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Ошибка при удалении пользователя с id ${id}`);
        }
        $("#modalDelete").modal("hide");
        await loadTable(`${API_BASE_URL}/users`);
    } catch (error) {
        console.error("Ошибка при удалении пользователя:", error.message);
        alert("Ошибка при удалении пользователя: " + error.message);
    }
});

$(document).on("click", "#admin-page-button", async function (event) {
    event.preventDefault();
    if (!$(this).hasClass("active")) {
        await loadAdminPage();
    }
});

async function loadAdminPage() {
    $("#admin-page-button").addClass("active");
    $("#add-page-button").removeClass("active");
    $("#page").html(`
        <div class="d-flex align-items-center highlight-toolbar ps-3 pe-2 py-1 border-0 border-bottom">
            <h5>All users</h5>
        </div>

        <div style="background-color: white; padding: 1rem;">
            <table class="table table-striped">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>First Name</th>
                    <th>Last Name</th>
                    <th>Age</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Edit</th>
                    <th>Delete</th>
                </tr>
                </thead>
                <tbody id="user-list">
                </tbody>
            </table>
        </div>
    `);
    await loadTable(`${API_BASE_URL}/users`);
}

$(document).on("click", "#add-page-button", async function (event) {
    event.preventDefault();
    if (!$(this).hasClass("active")) {
        await loadAddPage();
    }
});

async function loadAddPage() {
    $("#add-page-button").addClass("active");
    $("#admin-page-button").removeClass("active");
    $("#page").html(`
        <div class="d-flex align-items-center highlight-toolbar ps-3 pe-2 py-1 border-0 border-bottom">
            <h5>Add new user</h5>
        </div>

        <div style="background-color: white; padding: 10pt;">
            <form id="inputPostForm">
                <div class="form-group mb-2 mx-auto col-5 col-md-4 col-lg-3">
                    <label for="firstName"><b>First name</b></label>
                    <input type="text" class="form-control" id="firstName" placeholder="First name" required>
                </div>
                <div class="form-group mb-2 mx-auto col-5 col-md-4 col-lg-3">
                    <label for="lastName"><b>Last name</b></label>
                    <input type="text" class="form-control" id="lastName" placeholder="Last name" required>
                </div>
                <div class="form-group mb-2 mx-auto col-5 col-md-4 col-lg-3">
                    <label for="age"><b>Age</b></label>
                    <input type="number" class="form-control" id="age" placeholder="Age" required>
                </div>
                <div class="form-group mb-2 mx-auto col-5 col-md-4 col-lg-3">
                    <label for="email"><b>Email</b></label>
                    <input type="email" class="form-control" id="email" placeholder="Email"
                           aria-describedby="emailHelp" required>
                </div>
                <div class="form-group mb-2 mx-auto col-5 col-md-4 col-lg-3">
                    <label for="password"><b>Password</b></label>
                    <input type="password" class="form-control" id="password" placeholder="Password" required>
                </div>
                <div class="form-group mb-2 mx-auto col-5 col-md-4 col-lg-3">
                    <label for="inputState"><b>Role</b></label>
                    <select id="inputState" multiple size="2" class="form-control">
                        <option value="1">USER</option>
                        <option value="2">ADMIN</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-success btn-lg" style="margin: 10pt;">Add new user</button>
            </form>
        </div>
    `);
}

$(window).on('beforeunload', function () {
    $(window).scrollTop(0);
});
