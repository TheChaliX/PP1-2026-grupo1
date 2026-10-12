package com.openlodge.openlodge.dto;

import java.time.LocalDate;

public record OcupacionDto(
        LocalDate fechaCheckIn,
        LocalDate fechaCheckOut
) {
}