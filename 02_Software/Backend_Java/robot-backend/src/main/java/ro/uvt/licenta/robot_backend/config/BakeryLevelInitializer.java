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

            System.out.println("Creem Scenariul '" + levelTitle + "'");
            GameLevel bakeryLevel = GameLevel.builder()
                    .title(levelTitle)
                    .description("Mission secrète: Remplissez vos objectifs à Paris en parlant français.")
                    .imageUrl("/assets/bg_bakery_shop.png")
                    .difficulty(1)
                    .build();

            bakeryLevel = gameLevelRepository.save(bakeryLevel);
            List<GameTask> tasks = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            String imgBakery = "/assets/bg_bakery_shop.png";

            tasks.add(createTask(bakeryLevel, 1, TaskType.VisualID,
                    "HQ: Cible localisée. Cliquez sur le Boulanger pour initier le contact.",
                    "Caută persoana cu șorț alb din spatele tejghelei.",
                    Map.of("targetZone", Map.of("x", 410, "y", 475, "width", 410, "height", 525), "wrongZones", List.of("window", "bread"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 2, TaskType.MultipleChoice,
                    "Vous entrez dans la boulangerie. Que dites-vous en premier ?",
                    "În Franța, salutăm mereu când intrăm. Spune 'Bună ziua!'.",
                    Map.of("options", List.of("Bonne nuit!", "Au revoir!", "Bonjour!", "Je veux du pain."), "correctAnswer", "Bonjour!", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 3, TaskType.MultipleChoice,
                    "Le boulanger demande si vous avez trouvé l'adresse. Que répondez-vous ? (Verbe: Trouver)",
                    "Avoir + participiul trecut în -é. (Oui, j'ai trouvé l'adresse).",
                    Map.of("options", List.of("Oui, je trouve l'adresse.", "Oui, j'ai trouvé l'adresse.", "Oui, je suis trouvé l'adresse.", "Oui, j'ai trouver l'adresse."), "correctAnswer", "Oui, j'ai trouvé l'adresse.", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 4, TaskType.MultipleChoice,
                    "HQ: L'ennemi écoute! Dites que vous ne voulez pas de pain: 'Je ___ veux ___ de pain.'",
                    "Negația simplă se face cu ne...pas.",
                    Map.of("options", List.of("ne ... pas", "ne ... rien", "ne ... jamais", "non ... pas"), "correctAnswer", "ne ... pas", "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 5, TaskType.DragAndDrop,
                    "Utilisez l'adjectif démonstratif pour désigner ces produits.",
                    "'Croissant' e masculin (ce). 'Baguette' e feminin (cette). 'Gâteaux' e plural (ces).",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "Croissant (masculin)", "category", "Ce"),
                            Map.of("id", "i2", "text", "Baguette (féminin)", "category", "Cette"),
                            Map.of("id", "i3", "text", "Gâteaux (pluriel)", "category", "Ces")
                    ), "zones", List.of("Ce", "Cette", "Ces"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 6, TaskType.VisualID,
                    "Mission: Trouvez les produits sucrés. Cliquez sur 'Les Croissants'.",
                    "Au formă de semilună. (Croissant)",
                    Map.of("targetZone", Map.of("x", 44, "y", 543, "width", 502, "height", 162), "wrongZones", List.of("baguette"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 7, TaskType.SentenceBuilder,
                    "Commandez discrètement en français : 'Eu aș dori acest croissant'.",
                    "Așează cuvintele în ordine (Je voudrais...). Folosește demonstrativul potrivit.",
                    Map.of("words", List.of("Je", "voudrais", "ce", "croissant", "cette"),
                            "correctOrder", List.of("Je", "voudrais", "ce", "croissant"), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 8, TaskType.SentenceBuilder,
                    "Traduisez en français pour confirmer l'achat : 'Am cumpărat pâinea'. (Verbe: Acheter)",
                    "Folosește auxiliarul AVOIR + participiul 'acheté'.",
                    Map.of("words", List.of("J'ai", "acheté", "le", "pain.", "suis"),
                            "correctOrder", List.of("J'ai", "acheté", "le", "pain."), "imageUrl", imgBakery), mapper));

            tasks.add(createTask(bakeryLevel, 9, TaskType.MultipleChoice,
                    "Combien devez-vous payer si le prix est de 'deux' Euros ?",
                    "Doi = 2.",
                    Map.of("options", List.of("1 Euro", "2 Euros", "5 Euros", "10 Euros"), "correctAnswer", "2 Euros", "imageUrl", imgBakery), mapper));


            String imgGendarme = "/assets/bg_gendarme_street.jpg";

            tasks.add(createTask(bakeryLevel, 10, TaskType.VisualID,
                    "HQ: Attention! Une policière vous arrête. Cliquez sur elle (La Policière).",
                    "Caută persoana în uniformă cu insignă.",
                    Map.of("targetZone", Map.of("x", 399, "y", 348, "width", 180, "height", 456), "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 11, TaskType.MultipleChoice,
                    "Elle demande vos documents. Le mot 'Passeport' est masculin. Choisissez l'adjectif possessif.",
                    "Pentru un cuvânt masculin, la persoana I singular (al meu), folosim 'mon'.",
                    Map.of("options", List.of("Voici ma passeport.", "Voici mon passeport.", "Voici mes passeport.", "Voici ta passeport."), "correctAnswer", "Voici mon passeport.", "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 12, TaskType.SentenceBuilder,
                    "Protégez votre équipement. Dites en français : 'Acestea sunt lucrurile mele'.",
                    "Affaires este la plural. 'Acestea sunt' = 'Ce sont'.",
                    Map.of("words", List.of("Ce", "sont", "mes", "affaires.", "mon"),
                            "correctOrder", List.of("Ce", "sont", "mes", "affaires."), "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 13, TaskType.DragAndDrop,
                    "Triez les adjectifs possessifs par genre (Masculin, Féminin, Pluriel).",
                    "Mon este pentru masculin. Ma pentru feminin. Mes pentru plural.",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "Mon passeport", "category", "Masculin"),
                            Map.of("id", "i2", "text", "Ma valise", "category", "Féminin"),
                            Map.of("id", "i3", "text", "Mes clés", "category", "Pluriel")
                    ), "zones", List.of("Masculin", "Féminin", "Pluriel"), "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 14, TaskType.MultipleChoice,
                    "La policière demande si vous avez des armes. Niez totalement: 'Je n'ai ___ !'",
                    "Folosește 'rien' pentru a spune 'nimic'.",
                    Map.of("options", List.of("pas", "jamais", "rien", "personne"), "correctAnswer", "rien", "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 15, TaskType.SentenceBuilder,
                    "Traduisez la phrase pour l'interrogatoire : 'Nu am văzut nimic.'",
                    "Atenție: 'rien' (nimic) stă între auxiliar (ai) și participiu (vu).",
                    Map.of("words", List.of("Je", "n'ai", "rien", "vu.", "pas"),
                            "correctOrder", List.of("Je", "n'ai", "rien", "vu."), "imageUrl", imgGendarme), mapper));

            tasks.add(createTask(bakeryLevel, 16, TaskType.MultipleChoice,
                    "Elle demande ce que vous avez fait hier. Choisissez la forme correcte au Passé Composé (Verbe: Visiter).",
                    "Verbele care se termină în -er fac participiul în -é. (J'ai visité)",
                    Map.of("options", List.of("J'ai visiter Paris.", "J'ai visité Paris.", "Je suis visité Paris.", "Je visité Paris."), "correctAnswer", "J'ai visité Paris.", "imageUrl", imgGendarme), mapper));

            String imgGare = "/assets/bg_metro_station.jpg";

            tasks.add(createTask(bakeryLevel, 17, TaskType.VisualID,
                    "Vous arrivez à la gare. Cliquez sur l'horloge (L'horloge) pour vérifier l'heure.",
                    "Caută ceasul mare și rotund din stația de tren.",
                    Map.of("targetZone", Map.of("x", 448, "y", 1, "width", 125, "height", 660), "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 18, TaskType.MultipleChoice,
                    "Vous êtes en retard! Complétez: 'J' ___ ___ une erreur!' (Verbe: Faire)",
                    "Avoir (J'ai) + participiul neregulat 'fait' (am făcut o greșeală).",
                    Map.of("options", List.of("J'ai fait", "Je suis fait", "J'ai faire", "Je fais"), "correctAnswer", "J'ai fait", "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 19, TaskType.MultipleChoice,
                    "Avez-vous mangé dans le train ? (Verbe: Manger)",
                    "Participiul trecut pentru -er se termină în -é.",
                    Map.of("options", List.of("Oui, j'ai mangé.", "Oui, j'ai manger.", "Oui, je mange.", "Oui, j'ai mangez."), "correctAnswer", "Oui, j'ai mangé.", "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 20, TaskType.SentenceBuilder,
                    "Traduisez pour le contrôleur : 'Am cumpărat un bilet.'",
                    "J'ai + participiul trecut de la 'acheter'.",
                    Map.of("words", List.of("J'ai", "acheté", "un", "billet.", "suis"),
                            "correctOrder", List.of("J'ai", "acheté", "un", "billet."), "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 21, TaskType.MultipleChoice,
                    "Avez-vous déjà voyagé en Russie ? Utilisez la négation 'jamais' (niciodată).",
                    "'Jamais' înlocuiește 'pas' când vorbim despre ceva ce nu s-a întâmplat niciodată.",
                    Map.of("options", List.of("Non, je n'ai pas voyagé.", "Non, je n'ai jamais voyagé.", "Non, je n'ai rien voyagé.", "Non, je ne personne voyagé."), "correctAnswer", "Non, je n'ai jamais voyagé.", "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 22, TaskType.SentenceBuilder,
                    "HQ: Le train est parti. Traduisez: 'Am așteptat trenul'. (Verbe: Attendre)",
                    "Pentru verbele în -re, participiul se termină de obicei în -u. (Attendu).",
                    Map.of("words", List.of("J'ai", "attendu", "le", "train.", "attendre"),
                            "correctOrder", List.of("J'ai", "attendu", "le", "train."), "imageUrl", imgGare), mapper));

            tasks.add(createTask(bakeryLevel, 23, TaskType.SentenceBuilder,
                    "Votre contact n'est pas là. Dites en français : 'Nu e nimeni.'",
                    "Nu e nimeni = Il n'y a personne.",
                    Map.of("words", List.of("Il", "n'y", "a", "personne.", "rien"),
                            "correctOrder", List.of("Il", "n'y", "a", "personne."), "imageUrl", imgGare), mapper));

            String imgLouvre = "/assets/bg_louvre_museum.jpg";

            tasks.add(createTask(bakeryLevel, 24, TaskType.VisualID,
                    "HQ: Dernière étape ! Cliquez sur le tableau de La Joconde (Mona Lisa) au musée.",
                    "Privește pe peretele din dreapta, portretul femeii.",
                    Map.of("targetZone", Map.of("x", 316, "y", 138, "width", 301, "height", 395), "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 25, TaskType.MultipleChoice,
                    "Avez-vous vu le tableau ? Complétez au Passé Composé (Verbe: Voir).",
                    "Participiul trecut pentru 'voir' (a vedea) este 'vu'.",
                    Map.of("options", List.of("Oui, j'ai voir le tableau.", "Oui, j'ai vu le tableau.", "Oui, j'ai voyé le tableau.", "Oui, j'a vu le tableau."), "correctAnswer", "Oui, j'ai vu le tableau.", "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 26, TaskType.SentenceBuilder,
                    "HQ: Prenez les documents! Traduisez: 'Am luat documentele'. (Verbe: Prendre)",
                    "Prendre are participiul neregulat 'pris'.",
                    Map.of("words", List.of("J'ai", "pris", "les", "documents.", "prendu"),
                            "correctOrder", List.of("J'ai", "pris", "les", "documents."), "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 27, TaskType.MultipleChoice,
                    "Avez-vous fait une photo ? Complétez au Passé Composé (Verbe: Faire).",
                    "Participiul trecut pentru 'faire' (a face) este 'fait'.",
                    Map.of("options", List.of("J'ai faisé une photo.", "J'ai fait une photo.", "Je suis fait une photo.", "J'ai faire une photo."), "correctAnswer", "J'ai fait une photo.", "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 28, TaskType.DragAndDrop,
                    "Associez l'infinitif avec son participe passé irrégulier.",
                    "Avoir -> eu / Lire -> lu / Dire -> dit",
                    Map.of("items", List.of(
                            Map.of("id", "i1", "text", "J'ai eu", "category", "AVOIR"),
                            Map.of("id", "i2", "text", "J'ai lu", "category", "LIRE"),
                            Map.of("id", "i3", "text", "J'ai dit", "category", "DIRE")
                    ), "zones", List.of("AVOIR", "LIRE", "DIRE"), "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 29, TaskType.SentenceBuilder,
                    "Envoyez le message final. Traduisez : 'Am terminat misiunea.'",
                    "Avoir + Fini (Participiul lui 'finir' este 'fini').",
                    Map.of("words", List.of("J'ai", "fini", "la", "mission.", "finir"),
                            "correctOrder", List.of("J'ai", "fini", "la", "mission."), "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 30, TaskType.MultipleChoice,
                    "ALERTE ROUGE! Alarmă declanșată. Pour désactiver, complétez: 'J'ai ___ le code !' (Verbe: Entendre)",
                    "Verbele în -re fac participiul în -u. (Am auzit = J'ai entendu).",
                    Map.of("options", List.of("entendre", "entendu", "entendis", "entendez"), "correctAnswer", "entendu", "imageUrl", imgLouvre), mapper));

            tasks.add(createTask(bakeryLevel, 31, TaskType.MultipleChoice,
                    "Vite ! Le code a été transmis à notre agent (Robotul). Du-te la el, ascultă și introdu codul!",
                    "Mergi fizic la robot, ascultă cele 4 cifre și selectează opțiunea corectă.",
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