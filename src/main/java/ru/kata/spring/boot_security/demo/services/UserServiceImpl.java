package ru.kata.spring.boot_security.demo.services;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.kata.spring.boot_security.demo.models.Role;
import ru.kata.spring.boot_security.demo.models.User;
import ru.kata.spring.boot_security.demo.repositories.RoleRepository;
import ru.kata.spring.boot_security.demo.repositories.UserRepository;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final BCryptPasswordEncoder bCryptPasswordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Autowired
    public UserServiceImpl(BCryptPasswordEncoder bCryptPasswordEncoder, RoleRepository roleRepository, UserRepository userRepository) {
        this.bCryptPasswordEncoder = bCryptPasswordEncoder;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
    }


    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByUsername(username);
        if (user == null) {
            throw new UsernameNotFoundException(String.format("User %s not found", username));
        }
        return user;
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Override
    @Transactional
    public void saveUser(User user) {
        user.setPassword(bCryptPasswordEncoder.encode(user.getPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void addRole(Role role) {
        roleRepository.save(role);
    }

    @Override
    public User getUser(Long id) {
        return userRepository.findById(id).orElseThrow();
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void updateUser(User user) {
        userRepository.save(user);
    }
}
