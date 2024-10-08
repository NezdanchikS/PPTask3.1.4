package ru.kata.spring.boot_security.demo.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @Value("${server.port}")
    private int serverPort;

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("serverPort", serverPort);
        return "index";
    }
}
