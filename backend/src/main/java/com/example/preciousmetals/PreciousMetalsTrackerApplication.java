package com.example.preciousmetals;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PreciousMetalsTrackerApplication {
  public static void main(String[] args) {
    SpringApplication.run(PreciousMetalsTrackerApplication.class, args);
  }
}
