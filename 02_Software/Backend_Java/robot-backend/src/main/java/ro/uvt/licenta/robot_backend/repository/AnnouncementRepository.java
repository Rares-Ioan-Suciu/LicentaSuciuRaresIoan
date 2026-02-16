package ro.uvt.licenta.robot_backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ro.uvt.licenta.robot_backend.model.Announcement;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

}