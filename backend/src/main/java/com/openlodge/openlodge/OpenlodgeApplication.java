package com.openlodge.openlodge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class OpenlodgeApplication {

	public static void main(String[] args) {
		SpringApplication.run(OpenlodgeApplication.class, args);
	}

}
