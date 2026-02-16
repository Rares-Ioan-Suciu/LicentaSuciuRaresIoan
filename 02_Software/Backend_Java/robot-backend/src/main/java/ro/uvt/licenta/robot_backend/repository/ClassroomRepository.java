package ro.uvt.licenta.robot_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.uvt.licenta.robot_backend.model.Classroom;
import java.util.List;

public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    List<Classroom> findByTeacherId(Long teacherId);
}