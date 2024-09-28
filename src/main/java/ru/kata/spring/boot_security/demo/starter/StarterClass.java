package ru.kata.spring.boot_security.demo.starter;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.RoleService;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;

@Component
@Transactional
public class StarterClass {
    private final UserService userService;
    private final RoleService roleService;

    @Autowired
    public StarterClass(RoleService roleService, UserService userService) {
        this.roleService = roleService;
        this.userService = userService;
    }


    @PostConstruct
    private void postConstruct() {

        Role role_user = new Role("ROLE_USER");
        roleService.addRole(role_user);
        Role role_admin = new Role("ROLE_ADMIN");
        roleService.addRole(role_admin);

        User user = new User("user", "user", "userfirstname", "userlastname", 1000, Collections.singleton(role_user));
        userService.saveUser(user);
        User admin = new User("admin", "admin", "admin", "admin", 25, new HashSet<>(Arrays.asList(role_user, role_admin)));
        userService.saveUser(admin);

    }

}
