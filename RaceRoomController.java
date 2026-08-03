package com.oneohthreeonef.race;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Backend for night-circuit.html.
 *
 * Set CONFIG.apiBase in the page to wherever this is mounted, e.g.
 *     apiBase: 'https://1031f.com/api/race'
 *
 * Rooms live in memory and are swept after 6 hours. Nothing here is worth
 * persisting — a room is dead the moment the party ends.
 */
@RestController
@RequestMapping("/api/race")
@CrossOrigin(origins = {"https://1031f.com"})   // tighten or widen as needed
public class RaceRoomController {

    private static final long TTL_MILLIS = 6 * 60 * 60 * 1000L;
    private static final int  MAX_CARS   = 8;

    private final Map<String, Room> rooms = new ConcurrentHashMap<>();

    /** A room is a code, a grid of cars, and whatever the host last wrote as state. */
    public static class Room {
        public Map<String, Object> meta = new LinkedHashMap<>();
        public Map<String, Map<String, Object>> carsById = new LinkedHashMap<>();
        public Map<String, Object> state = new LinkedHashMap<>(Map.of("phase", "lobby"));
        public long touched = System.currentTimeMillis();
    }

    /** Shape the page expects back: { meta, cars: [...], state }. */
    private Map<String, Object> view(Room r) {
        return Map.of(
                "meta",  r.meta,
                "cars",  new ArrayList<>(r.carsById.values()),
                "state", r.state
        );
    }

    @PutMapping("/rooms/{code}")
    public ResponseEntity<?> createRoom(@PathVariable String code) {
        sweep();
        String key = normalize(code);
        Room room = new Room();
        room.meta = new LinkedHashMap<>(Map.of("code", key, "created", Instant.now().toString()));
        rooms.put(key, room);
        return ResponseEntity.ok(view(room));
    }

    @GetMapping("/rooms/{code}")
    public ResponseEntity<?> getRoom(@PathVariable String code) {
        Room room = rooms.get(normalize(code));
        if (room == null) return ResponseEntity.notFound().build();
        room.touched = System.currentTimeMillis();
        return ResponseEntity.ok(view(room));
    }

    @PutMapping("/rooms/{code}/cars/{carId}")
    public ResponseEntity<?> putCar(@PathVariable String code,
                                    @PathVariable String carId,
                                    @RequestBody Map<String, Object> car) {
        Room room = rooms.get(normalize(code));
        if (room == null) return ResponseEntity.notFound().build();
        if (!room.carsById.containsKey(carId) && room.carsById.size() >= MAX_CARS) {
            return ResponseEntity.status(409).body(Map.of("error", "grid full"));
        }
        room.carsById.put(carId, car);
        room.touched = System.currentTimeMillis();
        return ResponseEntity.ok(view(room));
    }

    @DeleteMapping("/rooms/{code}/cars")
    public ResponseEntity<?> clearCars(@PathVariable String code) {
        Room room = rooms.get(normalize(code));
        if (room == null) return ResponseEntity.notFound().build();
        room.carsById.clear();
        room.touched = System.currentTimeMillis();
        return ResponseEntity.ok(view(room));
    }

    @PutMapping("/rooms/{code}/state")
    public ResponseEntity<?> putState(@PathVariable String code,
                                      @RequestBody Map<String, Object> state) {
        Room room = rooms.get(normalize(code));
        if (room == null) return ResponseEntity.notFound().build();
        room.state = state;
        room.touched = System.currentTimeMillis();
        return ResponseEntity.ok(view(room));
    }

    private String normalize(String code) {
        return code == null ? "" : code.trim().toUpperCase(Locale.ROOT);
    }

    private void sweep() {
        long cutoff = System.currentTimeMillis() - TTL_MILLIS;
        rooms.entrySet().removeIf(e -> e.getValue().touched < cutoff);
    }
}
