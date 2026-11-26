package com.openlodge.openlodge.model;

// la reserva es inmediata: si las fechas estan libres nace CONFIRMADA (no hay paso de aceptar)
public enum EstadoReserva {
    CONFIRMADA,
    CANCELADA
}