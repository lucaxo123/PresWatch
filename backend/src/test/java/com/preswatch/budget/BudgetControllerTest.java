package com.preswatch.budget;

import com.preswatch.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BudgetControllerTest extends IntegrationTestBase {

    @Test
    void upsertCreatesBudget() throws Exception {
        mockMvc.perform(put("/api/budget")
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":150000,"month":"2026-04"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(150000))
                .andExpect(jsonPath("$.month").value("2026-04"));
    }

    @Test
    void upsertUpdatesSameMonth() throws Exception {
        mockMvc.perform(put("/api/budget")
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":100000,"month":"2026-05"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/budget")
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":200000,"month":"2026-05"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(200000));
    }

    @Test
    void getBudgetReturnsExisting() throws Exception {
        mockMvc.perform(put("/api/budget")
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":300000,"month":"2026-06"}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/budget?month=2026-06")
                        .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(300000));
    }

    @Test
    void getBudgetReturns404ForMissing() throws Exception {
        mockMvc.perform(get("/api/budget?month=2099-01")
                        .header("Authorization", "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void upsertRejectsInvalidMonth() throws Exception {
        mockMvc.perform(put("/api/budget")
                        .header("Authorization", "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":100,"month":"invalid"}
                                """))
                .andExpect(status().isBadRequest());
    }
}
