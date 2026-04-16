package com.preswatch.stats;

import com.preswatch.stats.dto.MonthlyStatsResponse;
import com.preswatch.stats.dto.WeeklyBreakdown;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;
    private static final DateTimeFormatter MONTH_FMT = DateTimeFormatter.ofPattern("yyyy-MM");

    @GetMapping("/monthly")
    public ResponseEntity<MonthlyStatsResponse> monthly(
            @RequestParam(required = false) String month) {
        if (month == null || month.isBlank()) {
            month = YearMonth.now().format(MONTH_FMT);
        }
        return ResponseEntity.ok(statsService.getMonthlyStats(month));
    }

    @GetMapping("/weekly")
    public ResponseEntity<List<WeeklyBreakdown>> weekly(
            @RequestParam(required = false) String month) {
        if (month == null || month.isBlank()) {
            month = YearMonth.now().format(MONTH_FMT);
        }
        return ResponseEntity.ok(statsService.getWeeklyBreakdown(month));
    }
}
