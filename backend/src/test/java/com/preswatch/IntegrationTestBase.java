package com.preswatch;

import com.preswatch.auth.JwtService;
import com.preswatch.user.User;
import com.preswatch.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class IntegrationTestBase {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected JwtService jwtService;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    protected User testUser;
    protected String testToken;

    @BeforeEach
    void setUpUser() {
        userRepository.deleteAll();
        testUser = userRepository.save(User.builder()
                .email("test@preswatch.com")
                .username("testuser")
                .password(passwordEncoder.encode("Test1234!"))
                .build());
        testToken = jwtService.generateToken(testUser);
    }
}
