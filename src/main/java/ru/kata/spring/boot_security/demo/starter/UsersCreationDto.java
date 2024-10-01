package ru.kata.spring.boot_security.demo.starter;

import ru.kata.spring.boot_security.demo.models.User;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;


public class UsersCreationDto {
    private List<User> users;

    public UsersCreationDto() {
        this.users = new ArrayList<>();
    }

    public UsersCreationDto(List<User> users) {
        this.users = users;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UsersCreationDto that = (UsersCreationDto) o;
        return Objects.equals(users, that.users);
    }

    @Override
    public int hashCode() {
        return Objects.hashCode(users);
    }
}
