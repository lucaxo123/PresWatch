package com.preswatch.expense;

import com.preswatch.IntegrationTestBase;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ExpenseControllerTest extends IntegrationTestBase {

    private static final String AUTH = "Authorization";

    @Test
    void createExpenseWithoutCategory() throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":2500,"description":"Almuerzo","expenseDate":"2026-04-10"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(2500))
                .andExpect(jsonPath("$.description").value("Almuerzo"))
                .andExpect(jsonPath("$.category").isEmpty());
    }

    @Test
    void createExpenseWithCategory() throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":800,"categoryId":1,"expenseDate":"2026-04-10"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category.id").value(1));
    }

    @Test
    void createExpenseRejectsNegativeAmount() throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":-100,"expenseDate":"2026-04-10"}
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void updateExpense() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/expenses")
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":1000,"expenseDate":"2026-04-10"}
                                """))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        int id = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(put("/api/expenses/" + id)
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":2000,"expenseDate":"2026-04-10"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(2000));
    }

    @Test
    void deleteExpense() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/expenses")
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":500,"expenseDate":"2026-04-10"}
                                """))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        int id = com.jayway.jsonpath.JsonPath.read(body, "$.id");

        mockMvc.perform(delete("/api/expenses/" + id)
                        .header(AUTH, "Bearer " + testToken))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/expenses/" + id)
                        .header(AUTH, "Bearer " + testToken))
                .andExpect(status().isNotFound());
    }

    @Test
    void listExpensesFilteredByMonth() throws Exception {
        mockMvc.perform(post("/api/expenses")
                        .header(AUTH, "Bearer " + testToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":100,"expenseDate":"2026-04-10"}
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/expenses?month=2026-04")
                        .header(AUTH, "Bearer " + testToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(1));
    }
}
