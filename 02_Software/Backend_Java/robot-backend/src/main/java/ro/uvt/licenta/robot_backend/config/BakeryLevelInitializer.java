package ro.uvt.licenta.robot_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;
import ro.uvt.licenta.robot_backend.model.game.GameLevel;
import ro.uvt.licenta.robot_backend.model.game.GameTask;
import ro.uvt.licenta.robot_backend.model.game.TaskType;
import ro.uvt.licenta.robot_backend.repository.GameLevelRepository;
import ro.uvt.licenta.robot_backend.repository.GameTaskRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Configuration
public class BakeryLevelInitializer {

    @Bean
    public CommandLineRunner initDatabase(
            GameLevelRepository gameLevelRepository,
            GameTaskRepository gameTaskRepository,
            JdbcTemplate jdbcTemplate) {
        return args -> {
            String levelTitle = "La Boulangerie";

            if (gameLevelRepository.findByTitle(levelTitle).isPresent()) {
                System.out.println("LOG: Scenariul există deja. Păstrăm sesiunile intacte.");
                return;
            }

            System.out.println("LOG: Resetare totală bază de date");
            jdbcTemplate.execute("TRUNCATE TABLE game_levels RESTART IDENTITY CASCADE");
            System.out.println("LOG:  Baza de date este curată. ID-ul următor va fi 1.");

            System.out.println("Creem Scenariul '" + levelTitle);
            GameLevel bakeryLevel = GameLevel.builder()
                    .title(levelTitle)
                    .description("Scenariu pentru brutarie")
                    .imageUrl("/assets/bg_bakery_shop.png")
                    .difficulty(1)
                    .build();

            bakeryLevel = gameLevelRepository.save(bakeryLevel);
            List<GameTask> tasks = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            tasks.add(createTask(bakeryLevel, 1, TaskType.MultipleChoice,
                    "Ai intrat în magazin. Ce spui?",
                    "În Franța, salutăm mereu când intrăm. Spune 'Bonjour'.",
                    Map.of("options", List.of("Noapte bună!", "Pa!", "Bonjour!", "Nimic"), "correctAnswer", "Bonjour!"), mapper));

            tasks.add(createTask(bakeryLevel, 2, TaskType.MultipleChoice,
                    "Vânzătorul este un bărbat. Cum îl saluți politicos?",
                    "Pentru bărbați adăugăm 'Monsieur'.",
                    Map.of("options", List.of("Bonjour, Madame!", "Bonjour, Monsieur!", "Salut, băiete!", "Bonjour, Papa!"), "correctAnswer", "Bonjour, Monsieur!"), mapper));

            tasks.add(createTask(bakeryLevel, 3, TaskType.MultipleChoice,
                    "Unde te afli acum?",
                     "Magazinul de pâine se numește Boulangerie.",
                    Map.of("options", List.of("La Farmacie", "La Școală", "La Boulangerie", "La Cinema"), "correctAnswer", "La Boulangerie"), mapper));

            tasks.add(createTask(bakeryLevel, 4, TaskType.VisualID,
                    "Apasă pe vânzător (Le Boulanger) pentru a începe.",
                    "Este persoana cu șorț alb din spatele tejghelei.",
                    Map.of("targetZone", Map.of(
                            "x", 410,
                            "y", 475,
                            "width", 410,
                            "height", 525
                    ), "wrongZones", List.of("window", "bread")), mapper));

            tasks.add(createTask(bakeryLevel, 5, TaskType.MultipleChoice,
                    "Brutarul te întreabă: 'Comment ça va?'. Ce răspunzi?",
                    "Înseamnă 'Ce mai faci?'. Răspunde că ești bine (Bien).",
                    Map.of("options", List.of("Nu știu.", "Ça va bien, merci.", "La revedere.", "Bonjour."), "correctAnswer", "Ça va bien, merci."), mapper));

            tasks.add(createTask(bakeryLevel, 6, TaskType.VisualID,
                    "Unde sunt 'Les Croissants' ?",
                    "Au formă de semilună.",
                    Map.of("targetZone", Map.of(
                            "x", 55,
                            "y", 550,
                            "width", 490,
                            "height", 90
                    ), "wrongZones", List.of("baguette")), mapper));

            tasks.add(createTask(bakeryLevel, 8, TaskType.MultipleChoice,
                    "Cum se numește produsul pătrat cu ciocolată?",
                    "Nu e croissant. Se numește Pâine cu ciocolată.",
                    Map.of("options", List.of("Croissant", "Sandwich", "Pain au chocolat", "Pizza"), "correctAnswer", "Pain au chocolat"), mapper));

            tasks.add(createTask(bakeryLevel, 9, TaskType.DragAndDrop,
                    "Sortează produsele: Dulce (Sucré) sau Sărat (Salé)?",
                    "Tarta e dulce. Sandwich-ul e sărat.",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "Tarte aux fruits", "category", "sweet"),
                            Map.of("id", "i2", "text", "Sandwich", "category", "salty"),
                            Map.of("id", "i3", "text", "Eclair", "category", "sweet")
                    ), "zones", List.of("sweet", "salty")), mapper));

            tasks.add(createTask(bakeryLevel, 10, TaskType.MultipleChoice,
                    "Din ce este făcută pâinea?",
                    "Făină se spune 'Farine'.",
                    Map.of("options", List.of("Apă și Zahăr", "Carne", "Farine (Făină)", "Ciocolată"), "correctAnswer", "Farine (Făină)"), mapper));

            tasks.add(createTask(bakeryLevel, 11, TaskType.MultipleChoice,
                    "Croissant este masculin. Cum spui 'Un croissant'?",
                    "Folosim 'Un' pentru masculin.",
                    Map.of("options", List.of("Une croissant", "Un croissant", "Des croissant", "La croissant"), "correctAnswer", "Un croissant"), mapper));

            tasks.add(createTask(bakeryLevel, 12, TaskType.MultipleChoice,
                    "Baguette este feminin. Cum spui 'O baghetă'?",
                    "Folosim 'Une' pentru feminin.",
                    Map.of("options", List.of("Un baguette", "Le baguette", "Une baguette", "Lui baguette"), "correctAnswer", "Une baguette"), mapper));

            tasks.add(createTask(bakeryLevel, 13, TaskType.DragAndDrop,
                    "Pune cuvintele la locul lor: UN (Masculin) sau UNE (Feminin).",
                    "Gâteau, Eclair și Sandwich sunt masculine (Un). Brioche și Galette sunt feminine (Une).",
                    Map.of("items", List.of(
                            Map.of("id", "g1", "text", "Gâteau", "category", "un"),
                            Map.of("id", "g2", "text", "Brioche", "category", "une"),
                            Map.of("id", "g3", "text", "Sandwich", "category", "un"),
                            Map.of("id", "g4", "text", "Galette", "category", "une"),
                            Map.of("id", "g5", "text", "Eclair", "category", "un")
                    ), "zones", List.of("un", "une")), mapper));


            tasks.add(createTask(bakeryLevel, 14, TaskType.MultipleChoice,
                    "Vrei mai multe cornuri (plural). Ce cuvânt pui în față?",
                    "Pentru plural folosim 'Des'.",
                    Map.of("options", List.of("Un", "Une", "Des", "Le"), "correctAnswer", "Des"), mapper));

            tasks.add(createTask(bakeryLevel, 15, TaskType.MultipleChoice,
                    "Cum scriem corect la plural?",
                    "Trebuie să aibă 's' la final.",
                    Map.of("options", List.of("Des croissant", "Des croissants", "Des croissante", "Des croissanturi"), "correctAnswer", "Des croissants"), mapper));

            tasks.add(createTask(bakeryLevel, 16, TaskType.SentenceBuilder,
                    "Spune 'Eu iau un croissant'. (Fără politețe complicată).",
                    "Folosește verbul 'Je prends' (Eu iau).",

                    Map.of("words", List.of("Je", "prends", "un", "croissant", "tu", "il"),
                            "correctOrder", List.of("Je", "prends", "un", "croissant")), mapper));

            tasks.add(createTask(bakeryLevel, 17, TaskType.SentenceBuilder,
                    "Ai cerut produsul. Ce spui la final ca să fii politicos?",
                    "S'il vous plaît (Vă rog).",
                    Map.of("words", List.of("s'il", "merci", "plaît", "vous", "te"),
                            "correctOrder", List.of("s'il", "vous", "plaît")), mapper));

            tasks.add(createTask(bakeryLevel, 18, TaskType.MultipleChoice,
                    "Vânzătorul spune: 'Ça fait 2 Euros'. Cât costă?",
                    "Deux = 2.",
                    Map.of("options", List.of("1 Euro", "2 Euro", "5 Euro", "10 Euro"), "correctAnswer", "2 Euro"), mapper));

            tasks.add(createTask(bakeryLevel, 19, TaskType.MultipleChoice,
                    "Cumperi 2 baghete. Una costă 1 Euro. Cât fac 2 baghete?",
                    "1 + 1 = 2 (Deux).",
                    Map.of("options", List.of("Un Euro", "Deux Euros", "Trois Euros", "Mille Euros"), "correctAnswer", "Deux Euros"), mapper));

            tasks.add(createTask(bakeryLevel, 20, TaskType.MultipleChoice,
                    "Vrei să plătești cu cardul. Ce spui?",
                    "Card = Carte.",
                    Map.of("options", List.of("Cu bani.", "La carte, s'il vous plaît.", "Gratuit?", "Nu plătesc."), "correctAnswer", "La carte, s'il vous plaît."), mapper));

            tasks.add(createTask(bakeryLevel, 21, TaskType.MultipleChoice,
                    "Brutarul îți dă pâinea și spune 'Voilà!'. Ce îi răspunzi?",
                    "Când primești ceva, spui Mulțumesc (Merci).",
                    Map.of("options", List.of("Pardon.", "Merci!", "Nu vreau.", "Salut."), "correctAnswer", "Merci!"), mapper));

            tasks.add(createTask(bakeryLevel, 22, TaskType.SentenceBuilder,
                    "Vrei să pleci. Formează propoziția de rămas bun.",
                    "Au revoir (La revedere).",
                    Map.of("words", List.of("Au", "revoir", "bonjour", "salut"),
                            "correctOrder", List.of("Au", "revoir")), mapper));

            tasks.add(createTask(bakeryLevel, 23, TaskType.MultipleChoice,
                    "Este dimineață. Urează-i o zi bună.",
                    "Bonne journée (Zi bună). Bonne soirée e pentru seară.",
                    Map.of("options", List.of("Bonne nuit!", "Bonne journée!", "Pa!", "Merci!"), "correctAnswer", "Bonne journée!"), mapper));

            tasks.add(createTask(bakeryLevel, 24, TaskType.DragAndDrop,
                    "Ultimul test. Ce este mâncare și ce este politețe?",
                    "Croissant e mâncare. Merci și Bonjour sunt politețe.",
                    Map.of("items", List.of(
                            Map.of("id", "r1", "text", "Croissant", "category", "mancare"),
                            Map.of("id", "r2", "text", "Merci", "category", "politețe"),
                            Map.of("id", "r3", "text", "Baguette", "category", "mancare"),
                            Map.of("id", "r4", "text", "Bonjour", "category", "politețe")
                    ), "zones", List.of("mancare", "politețe")), mapper));

            tasks.add(createTask(bakeryLevel, 25, TaskType.MultipleChoice,
                    "Ai reușit! Ai cumpărat pâinea. Ești fericit?",
                    "Oui = Da.",
                    Map.of("options", List.of("Non.", "Oui, très content!", "Nu știu.", "Poate."), "correctAnswer", "Oui, très content!"), mapper));

            gameTaskRepository.saveAll(tasks);
            System.out.println("LOG: Scenariul a fost salvat cu succes (" + tasks.size() + " intrebari).");
        };




    }

    private GameTask createTask(GameLevel level, int index, TaskType type, String req, String hint, Map<String, Object> data, ObjectMapper mapper)
    {
        try {
            return GameTask.builder()
                    .gameLevel(level)
                    .orderIndex(index)
                    .type(type)
                    .requirement(req)
                    .aiHintContext(hint)
                    .taskData(mapper.writeValueAsString(data))
                    .build();
        } catch (Exception e){
            throw new RuntimeException("Eroare la generarea task-ului: " + e.getMessage());
        }
    }
}
