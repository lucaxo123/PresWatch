package com.preswatch;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PresWatchApplication {
    public static void main(String[] args) {
        SpringApplication.run(PresWatchApplication.class, args);
    }
}
