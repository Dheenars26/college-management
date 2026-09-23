package com.example.collegemanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = "com.example.collegemanagement")
@EnableJpaRepositories(basePackages = "com.example.collegemanagement.repository")
public class CollegeManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(CollegeManagementApplication.class, args);
    }
}