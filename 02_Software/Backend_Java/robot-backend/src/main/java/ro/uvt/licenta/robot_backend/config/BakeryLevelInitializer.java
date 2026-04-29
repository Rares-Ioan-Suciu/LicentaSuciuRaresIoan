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
            // Păstrăm titlul exact cum era pentru a nu strica Frontend-ul
            String levelTitle = "La Boulangerie";

            if (gameLevelRepository.findByTitle(levelTitle).isPresent()) {
                System.out.println("LOG: Scenariul există deja. Păstrăm sesiunile intacte.");
                return;
            }

            System.out.println("LOG: Resetare totală bază de date");
            // jdbcTemplate.execute("TRUNCATE TABLE game_levels RESTART IDENTITY CASCADE");
            System.out.println("LOG: Baza de date este pregătită.");

            System.out.println("Creem Scenariul '" + levelTitle + "'");
            // Păstrăm setările de bază ale nivelului
            GameLevel bakeryLevel = GameLevel.builder()
                    .title(levelTitle)
                    .description("Mission secrète: Remplissez vos objectifs à Paris en parlant français.")
                    .imageUrl("/assets/bg_bakery_shop.png")
                    .difficulty(1)
                    .build();

            bakeryLevel = gameLevelRepository.save(bakeryLevel);
            List<GameTask> tasks = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            // ==========================================
            // ZONA 1: LA BOULANGERIE (Brutăria)
            // ==========================================
            String imgBakery = "/assets/bg_bakery_shop.png";

            tasks.add(createTask(bakeryLevel, 1, TaskType.VisualID,
                    "HQ: Cible localisée. Cliquez sur le Boulanger pour initier le contact.",
                    "Caută persoana cu șorț alb din spatele tejghelei.",
                    Map.of("targetZone", Map.of("x", 410, "y", 475, "width", 410, "height", 525), "wrongZones", List.of("window", "bread"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 2, TaskType.MultipleChoice,
                    "Vous entrez dans la boulangerie. Que dites-vous en premier ?",
                    "În Franța, salutăm mereu când intrăm. Spune 'Bonjour'.",
                    Map.of("options", List.of("Bonne nuit!", "Au revoir!", "Bonjour!", "Je veux du pain."), "correctAnswer", "Bonjour!", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 3, TaskType.MultipleChoice,
                    "Le vendeur est un homme. Comment le saluer poliment ?",
                    "Pentru bărbați adăugăm 'Monsieur'.",
                    Map.of("options", List.of("Bonjour, Madame!", "Bonjour, Monsieur!", "Salut, garçon!", "Coucou!"), "correctAnswer", "Bonjour, Monsieur!", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 4, TaskType.MultipleChoice,
                    "Le boulanger demande : 'Comment ça va ?'. Quelle est la bonne réponse ?",
                    "Înseamnă 'Ce mai faci?'. Răspunde că ești bine.",
                    Map.of("options", List.of("Je ne sais pas.", "Ça va bien, merci.", "Au revoir.", "Je suis un agent."), "correctAnswer", "Ça va bien, merci.", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 5, TaskType.VisualID,
                    "Mission: Trouvez les produits sucrés. Cliquez sur 'Les Croissants'.",
                    "Au formă de semilună. (Croissant)",
                    Map.of("targetZone", Map.of("x", 55, "y", 550, "width", 490, "height", 90), "wrongZones", List.of("baguette"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 6, TaskType.SentenceBuilder,
                    "Donnez le mot de passe: 'Je voudrais un croissant'.",
                    "Așează cuvintele în ordine: Eu aș dori un croissant.",
                    Map.of("words", List.of("Je", "voudrais", "un", "croissant", "tu", "il"),
                            "correctOrder", List.of("Je", "voudrais", "un", "croissant"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 7, TaskType.DragAndDrop,
                    "Test de couverture: Classez les produits (Sucré = Dulce, Salé = Sărat).",
                    "Tarta e dulce (sucré). Sandwich-ul e sărat (salé).",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "Tarte aux fruits", "category", "Sucré"),
                            Map.of("id", "i2", "text", "Sandwich", "category", "Salé"),
                            Map.of("id", "i3", "text", "Éclair", "category", "Sucré")
                    ), "zones", List.of("Sucré", "Salé"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 8, TaskType.MultipleChoice,
                    "Quel est le produit carré avec du chocolat ?",
                    "Nu e croissant. Se numește Pâine cu ciocolată (Pain au chocolat).",
                    Map.of("options", List.of("Croissant", "Sandwich", "Pain au chocolat", "Baguette"), "correctAnswer", "Pain au chocolat", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 9, TaskType.MultipleChoice,
                    "Le boulanger dit : 'Ça fait 2 Euros'. Que devez-vous payer ?",
                    "Deux = 2.",
                    Map.of("options", List.of("1 Euro", "2 Euros", "5 Euros", "10 Euros"), "correctAnswer", "2 Euros", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 10, TaskType.SentenceBuilder,
                    "Avant de partir, soyez poli: 'Merci, au revoir !'",
                    "Mulțumesc, la revedere!",
                    Map.of("words", List.of("Merci,", "au", "revoir", "bonjour", "!"),
                            "correctOrder", List.of("Merci,", "au", "revoir", "!"), "imageUrl", imgBakery), mapper));


            // ==========================================
            // ZONA 2: LE COMMISSARIAT (Strada / Poliția)
            // ==========================================
            String imgGendarme = "/assets/bg_gendarme_street.jpg";

            tasks.add(createTask(bakeryLevel, 11, TaskType.MultipleChoice,
                    "HQ: Attention! Une policière vous arrête. Elle demande: 'Où allez-vous ?'.",
                    "Răspunde 'Eu merg la gară'. Atenție la articol (à la gare).",
                    Map.of("options", List.of("Je vais au gare.", "Je vas à la gare.", "Je vais à la gare.", "Je suis le gare."), "correctAnswer", "Je vais à la gare.", "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 12, TaskType.VisualID,
                    "Cliquez sur la policière (La Policière) pour présenter vos documents.",
                    "Caută persoana în uniformă cu insignă (în partea stângă a străzii).",
                    Map.of("targetZone", Map.of("x", 250, "y", 400, "width", 150, "height", 300), "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 13, TaskType.SentenceBuilder,
                    "Montrez vos documents: 'Voici mon passeport, madame.'",
                    "Iată pașaportul meu, doamnă.",
                    Map.of("words", List.of("Voici", "mon", "ma", "passeport,", "madame."),
                            "correctOrder", List.of("Voici", "mon", "passeport,", "madame."), "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 14, TaskType.DragAndDrop,
                    "Mémorisez les directions: Classez les mots en 'Direction' et 'Position'.",
                    "La dreapta și Tot înainte sunt direcții de mișcare. În spate / În față sunt poziții.",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "À droite", "category", "Direction"),
                            Map.of("id", "i2", "text", "Derrière", "category", "Position"),
                            Map.of("id", "i3", "text", "Tout droit", "category", "Direction"),
                            Map.of("id", "i4", "text", "Devant", "category", "Position")
                    ), "zones", List.of("Direction", "Position"), "imageUrl", imgGendarme), mapper));


            // ==========================================
            // ZONA 3: LA GARE DU NORD (Gara)
            // ==========================================
            String imgGare = "/assets/bg_metro_station.jpg";

            tasks.add(createTask(bakeryLevel, 15, TaskType.VisualID,
                    "HQ: Vous êtes à la gare. Cherchez l'horloge (L'horloge) pour l'heure de l'extraction.",
                    "Caută ceasul mare și rotund din stația de tren.",
                    Map.of("targetZone", Map.of("x", 400, "y", 150, "width", 100, "height", 100), "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 16, TaskType.MultipleChoice,
                    "Quelle heure est-il si l'horloge montre 18:15 ?",
                    "18 = dix-huit. 15 minute se spune 'et quart' (și un sfert).",
                    Map.of("options", List.of("Dix-huit heures et demie", "Dix-neuf heures", "Dix-huit heures et quart", "Huit heures et quart"), "correctAnswer", "Dix-huit heures et quart", "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 17, TaskType.SentenceBuilder,
                    "Achetez votre billet: 'Un billet pour Londres, s'il vous plaît'.",
                    "Un bilet pentru Londra, vă rog.",
                    Map.of("words", List.of("Un billet", "pour", "Londres,", "s'il vous", "plaît", "avec"),
                            "correctOrder", List.of("Un billet", "pour", "Londres,", "s'il vous", "plaît"), "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 18, TaskType.DragAndDrop,
                    "Rapport de grammaire: Triez les verbes par Auxiliaire au Passé Composé (ÊTRE vs AVOIR).",
                    "Verbele de mișcare (aller, partir) folosesc ÊTRE. Restul folosesc AVOIR.",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "Aller", "category", "ÊTRE"),
                            Map.of("id", "i2", "text", "Manger", "category", "AVOIR"),
                            Map.of("id", "i3", "text", "Partir", "category", "ÊTRE"),
                            Map.of("id", "i4", "text", "Regarder", "category", "AVOIR")
                    ), "zones", List.of("ÊTRE", "AVOIR"), "imageUrl", imgGare), mapper));


            // ==========================================
            // ZONA 4: LE MUSÉE DU LOUVRE (Muzeul)
            // ==========================================
            String imgLouvre = "/assets/bg_louvre_museum.jpg";

            tasks.add(createTask(bakeryLevel, 19, TaskType.VisualID,
                    "HQ: Dernière étape ! Cliquez sur le tableau de La Joconde (Mona Lisa) au musée.",
                    "Privește pe peretele din dreapta, portretul clasic al femeii.",
                    Map.of("targetZone", Map.of("x", 650, "y", 300, "width", 150, "height", 180), "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 20, TaskType.MultipleChoice,
                    "Le guide dit: 'C'est un ____ tableau'. Choisissez l'adjectif pour 'vechi'.",
                    "Cuvântul 'tableau' este masculin, deci folosim 'vieux'.",
                    Map.of("options", List.of("vieille", "vieux", "vieil", "ancien"), "correctAnswer", "vieux", "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 21, TaskType.SentenceBuilder,
                    "Envoyez le message final: 'J'ai trouvé le tableau'.",
                    "Am găsit tabloul. (Passé Composé)",
                    Map.of("words", List.of("J'ai", "trouvé", "trouve", "le", "tableau", "au"),
                            "correctOrder", List.of("J'ai", "trouvé", "le", "tableau"), "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 22, TaskType.MultipleChoice,
                    "HQ: 'Avez-vous fini la mission ?'. Répondez affirmativement avec le pronom direct (la mission).",
                    "Înlocuim 'la mission' (feminin) cu 'la' (care devine l' în fața vocalei). Acordăm participiul cu 'e'.",
                    Map.of("options", List.of("Oui, je l'ai finie.", "Oui, j'ai fini elle.", "Oui, je le finis.", "Oui, je la fini."), "correctAnswer", "Oui, je l'ai finie.", "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 23, TaskType.MultipleChoice,
                    "ALERTE ROUGE! Alarmă declanșată. Pentru a ieși, ai nevoie de codul secret (PIN). Codul a été transmis à notre agent (Robotul). Du-te la el și află codul!",
                    "Mergi fizic la robot, ascultă sau citește cele 4 cifre de pe ecranul lui și selectează opțiunea corectă.",
                    Map.of(
                            "options", List.of("1984", "0000", "7392", "4040"),
                            "correctAnswer", "7392",
                            "imageUrl", imgLouvre
                    ), mapper));

            gameTaskRepository.saveAll(tasks);
            System.out.println("LOG: Scenariul a fost salvat cu succes (" + tasks.size() + " intrebari).");
        };
    }

    private GameTask createTask(GameLevel level, int index, TaskType type, String req, String hint, Map<String, Object> data, ObjectMapper mapper) {
        try {
            return GameTask.builder()
                    .gameLevel(level)
                    .orderIndex(index)
                    .type(type)
                    .requirement(req)
                    .aiHintContext(hint)
                    .taskData(mapper.writeValueAsString(data))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Eroare la generarea task-ului: " + e.getMessage());
        }
    }
}