package ru.kata.spring.boot_security.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.services.UserService;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class RESTUserController {

    private final UserService userService;

    @Autowired
    public RESTUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/user")
    public UserDetails showUser(Principal principal) {
        return userService.loadUserByUsername(principal.getName());
    }

    @GetMapping("/users")
    public List<User> showAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/users/{id}")
    public User showUser(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @PostMapping("/users")
    public User createNewUser(@RequestBody User user) {
        userService.saveUser(user);
        return user;
    }

    @PatchMapping("/users")
    public User updateUser(@RequestBody User user) {
        userService.updateUser(user);
        return user;
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable("id") long id) {
        userService.deleteUser(id);
        return "User with id = " + id + " was removed.";
    }

}
