package ro.uvt.licenta.robot_backend.server.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import ro.uvt.licenta.robot_backend.model.*;
import ro.uvt.licenta.robot_backend.repository.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/classes")
public class ClassController {

    private final ClassroomRepository classroomRepository;
    private final UserRepository userRepository;
    private final AnnouncementRepository announcementRepository;

    public ClassController(ClassroomRepository classroomRepo, UserRepository userRepo, AnnouncementRepository annRepo) {
        this.classroomRepository = classroomRepo;
        this.userRepository = userRepo;
        this.announcementRepository = annRepo;
    }

    @GetMapping
    public List<Classroom> getClasses(@AuthenticationPrincipal User currentUser) {
        System.out.println("GET CLASSES Request by: " + currentUser.getEmail());

        if ("teacher".equals(currentUser.getRole())) {
            return classroomRepository.findByTeacherId(currentUser.getId());
        } else {
            List<Classroom> all = classroomRepository.findAll();
            List<Classroom> enrolled = new ArrayList<>();
            for (Classroom c : all) {
                if (c.getStudents().stream().anyMatch(s -> s.getId().equals(currentUser.getId()))) {
                    enrolled.add(c);
                }
            }
            return enrolled;
        }
    }

    @PostMapping
    public ResponseEntity<?> createClass(@RequestBody Map<String, String> payload,
                                         @AuthenticationPrincipal User currentUser) {

        System.out.println(STR."CREATE CLASS Request by: \{currentUser.getEmail()} Role: \{currentUser.getRole()}");

        if (!"teacher".equals(currentUser.getRole())) {
            return ResponseEntity.status(403).body("Doar profesorii pot crea clase.");
        }

        try {
            Classroom classroom = new Classroom(
                    payload.get("name"),
                    payload.get("description"),
                    currentUser.getId()
            );
            classroomRepository.save(classroom);
            System.out.println("Class created ID: " + classroom.getId());
            return ResponseEntity.ok(classroom);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Eroare la salvarea clasei");
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getClassDetails(@PathVariable Long id) {
        return classroomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/students")
    public ResponseEntity<?> getStudents(@PathVariable Long id) {
        return classroomRepository.findById(id)
                .map(cls -> ResponseEntity.ok(cls.getStudents()))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/announcements")
    public ResponseEntity<?> postAnnouncement(@PathVariable Long id,
                                              @RequestBody Map<String, String> payload,
                                              @AuthenticationPrincipal User author) {

        if (!"teacher".equals(author.getRole())) {
            return ResponseEntity.status(403).body("Doar profesorii pot posta anunțuri.");
        }

        return classroomRepository.findById(id).map(cls -> {
            Announcement ann = new Announcement(payload.get("content"), author.getFullName(), cls);
            announcementRepository.save(ann);
            return ResponseEntity.ok("Anunț postat!");
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<?> inviteStudent(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Optional<Classroom> cls = classroomRepository.findById(id);
        Optional<User> stud = userRepository.findByEmail(payload.get("email"));

        if (cls.isPresent() && stud.isPresent()) {
            cls.get().getStudents().add(stud.get());
            classroomRepository.save(cls.get());
            return ResponseEntity.ok("Student adăugat!");
        }
        return ResponseEntity.badRequest().body("Eroare la invitare: Email invalid sau clasă inexistentă.");
    }
}