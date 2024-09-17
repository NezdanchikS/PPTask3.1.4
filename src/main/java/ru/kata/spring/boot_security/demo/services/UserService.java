package ru.kata.spring.boot_security.demo.services;


import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;

import java.util.List;

public interface UserService extends UserDetailsService {
    @Override
    UserDetails loadUserByUsername(String username) throws UsernameNotFoundException;

    List<User> getAllUsers();

    void saveUser(User user);

    User getUser(Long id);

    void deleteUser(Long id);

    void updateUser(User user);

    void addRole (Role role);
}
