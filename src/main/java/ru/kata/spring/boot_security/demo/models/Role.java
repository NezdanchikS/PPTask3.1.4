package ru.kata.spring.boot_security.demo.models;


import jakarta.persistence.*;
import lombok.Data;
import lombok.Generated;
import org.springframework.security.core.GrantedAuthority;

@Entity
@Data
@Table(name = "role")
public class Role implements GrantedAuthority {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    public Role() {
    }

    public Role(String name) {
        this.name = name;
    }

    @Override
    public String getAuthority() {
        return getName();
    }
}
