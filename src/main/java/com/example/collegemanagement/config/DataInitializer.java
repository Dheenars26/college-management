package com.example.collegemanagement.config;

import com.example.collegemanagement.model.Student;
import com.example.collegemanagement.repository.StudentRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final StudentRepository repository;

    public DataInitializer(StudentRepository repository) {
        this.repository = repository;
    }

    @Override
    public void run(String... args) {
        if (repository.count() == 0) {
            Student s1 = new Student();
            s1.setName("Aarav Sharma");
            s1.setEmail("aarav.sharma@college.edu");
            s1.setDepartment("Computer Science");
            s1.setYear(3);

            Student s2 = new Student();
            s2.setName("Priya Patel");
            s2.setEmail("priya.patel@college.edu");
            s2.setDepartment("Information Technology");
            s2.setYear(2);

            Student s3 = new Student();
            s3.setName("Dheena Dhayalan");
            s3.setEmail("dheena@college.edu");
            s3.setDepartment("Electronics & Communication");
            s3.setYear(4);

            Student s4 = new Student();
            s4.setName("Ananya Iyer");
            s4.setEmail("ananya.iyer@college.edu");
            s4.setDepartment("Mechanical Engineering");
            s4.setYear(1);

            repository.save(s1);
            repository.save(s2);
            repository.save(s3);
            repository.save(s4);
            System.out.println("Initialized database with sample students.");
        }
    }
}
