package com.preswatch.calendar;

import com.preswatch.calendar.dto.CalendarDayResponse;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/calendar")
@RequiredArgsConstructor
@Validated
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping
    public ResponseEntity<Map<String, CalendarDayResponse>> getCalendarData(
            @RequestParam @Pattern(regexp = "\\d{4}-\\d{2}", message = "Formato de mes inválido (yyyy-MM)") String month) {
        return ResponseEntity.ok(calendarService.getCalendarData(month));
    }
}
