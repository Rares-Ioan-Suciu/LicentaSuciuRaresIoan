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
public class A_CSLevelInitializer {

    @Bean
    public CommandLineRunner initInformaticsLevel(
            GameLevelRepository gameLevelRepository,
            GameTaskRepository gameTaskRepository,
            JdbcTemplate jdbcTemplate) {
        return args -> {
            String levelTitle = "Informatica: Grafuri si Arbori";

            if (gameLevelRepository.findByTitle(levelTitle).isPresent()) {
                System.out.println("LOG: Scenariul de Informatica exista deja.");
                return;
            }

            System.out.println("Creem Scenariul '" + levelTitle + "'");
            GameLevel infoLevel = GameLevel.builder()
                    .title(levelTitle)
                    .description("Misiune critică: Restabilește conexiunea cu rețeaua de sateliți rezolvând probleme de Grafuri și Cod C++ la nivel de Bacalaureat.")
                    .imageUrl("/assets/cs_intro.jpg")
                    .difficulty(3)
                    .build();

            infoLevel = gameLevelRepository.save(infoLevel);
            List<GameTask> tasks = new ArrayList<>();
            ObjectMapper mapper = new ObjectMapper();

            String imgInfo = "/assets/cs_intro.jpg";
            String svgG1 = "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='50 50 500 500' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,600.000000) scale(0.100000,-0.100000)' fill='#22d3ee' stroke='none'><path d='M2730 3958 c-61 -31 -92 -85 -87 -153 2 -27 5 -56 8 -63 2 -9 -114 -90 -326 -227 -322 -208 -331 -212 -350 -195 -64 57 -144 63 -214 17 -128 -85 -65 -297 88 -297 50 0 89 15 122 46 l27 26 48 -25 c27 -14 132 -72 234 -129 102 -56 232 -128 288 -158 75 -40 100 -59 96 -70 -17 -43 -14 -87 8 -129 38 -74 108 -108 185 -91 97 22 137 97 121 227 -3 18 46 52 330 232 184 116 336 211 338 211 3 0 17 -11 32 -25 15 -14 42 -28 61 -31 l34 -7 -6 -231 c-4 -127 -7 -306 -7 -397 l0 -167 -35 -6 c-40 -8 -90 -46 -110 -87 -23 -43 -19 -120 8 -159 39 -58 71 -75 141 -75 53 0 68 4 98 27 102 78 79 242 -39 284 l-48 17 2 126 c12 628 14 671 35 671 56 0 126 72 135 138 7 55 -12 105 -56 145 -65 59 -156 57 -221 -3 l-31 -29 -344 186 c-298 162 -342 189 -334 204 27 50 -9 154 -65 189 -53 32 -113 35 -166 8z m140 -17 c110 -58 107 -207 -5 -261 -98 -47 -205 21 -205 131 0 111 114 182 210 130z m168 -268 c48 -26 121 -66 162 -88 42 -22 155 -82 251 -134 l175 -95 -1 -65 c0 -36 4 -74 9 -83 5 -11 4 -18 -2 -18 -5 0 -159 -95 -342 -210 l-332 -210 -29 24 c-16 13 -44 29 -63 36 l-34 11 -6 82 c-4 45 -8 227 -9 405 -2 304 -1 322 16 322 24 0 68 23 91 49 11 12 21 21 24 21 2 0 43 -21 90 -47z m-347 21 c17 -21 63 -44 89 -44 20 0 20 -5 20 -232 0 -128 3 -310 7 -404 l6 -171 -37 -13 c-21 -7 -52 -25 -70 -40 l-32 -28 -279 155 c-154 85 -306 168 -337 185 -52 27 -57 32 -47 50 11 20 8 90 -4 118 -5 11 73 67 321 227 180 116 332 212 338 212 6 1 17 -6 25 -15z m1155 -280 c99 -47 111 -198 20 -253 -52 -31 -90 -35 -140 -12 -57 25 -86 69 -86 132 0 109 109 179 206 133z m-1928 -78 c52 -27 75 -62 80 -121 4 -46 1 -61 -19 -89 -32 -47 -68 -66 -127 -66 -145 0 -195 194 -70 270 39 23 98 26 136 6z m981 -543 c47 -36 65 -70 65 -123 0 -84 -60 -144 -144 -144 -111 0 -179 108 -131 208 39 80 142 109 210 59z m942 -516 c39 -26 69 -79 69 -122 0 -78 -69 -145 -149 -145 -128 0 -193 155 -103 245 34 34 56 44 108 44 27 1 53 -7 75 -22z'/><path d='M2780 3846 c0 -10 6 -13 15 -10 8 4 15 2 15 -4 0 -6 -6 -13 -12 -15 -10 -4 -10 -6 0 -6 6 -1 12 -8 12 -16 0 -18 -17 -20 -23 -2 -2 6 -8 9 -12 5 -4 -4 -2 -14 5 -23 22 -26 50 -1 47 43 -2 30 -6 38 -24 40 -15 2 -23 -2 -23 -12z'/><path d='M3283 3455 c0 -8 4 -12 9 -9 5 3 6 10 3 15 -9 13 -12 11 -12 -6z'/><path d='M3772 3298 c-22 -34 -21 -51 3 -41 10 3 15 -1 15 -13 1 -18 1 -18 15 0 10 13 11 23 5 31 -5 6 -7 21 -3 33 8 33 -12 27 -35 -10z m18 -18 c0 -5 -5 -10 -11 -10 -5 0 -7 5 -4 10 3 6 8 10 11 10 2 0 4 -4 4 -10z'/><path d='M1840 3239 c-11 -8 -12 -12 -2 -16 14 -6 17 -53 2 -53 -5 0 -10 -4 -10 -9 0 -5 12 -8 26 -8 18 0 24 4 20 14 -3 8 -6 30 -6 49 0 36 -6 40 -30 23z'/><path d='M2790 2705 c0 -18 16 -20 23 -2 3 6 6 2 6 -9 1 -12 -6 -27 -14 -34 -25 -21 -18 -37 15 -32 17 2 30 9 30 14 0 6 -7 8 -15 4 -19 -7 -19 3 0 27 7 11 11 25 8 33 -7 19 -53 18 -53 -1z'/><path d='M3740 2175 c0 -16 6 -25 15 -25 8 0 15 -7 15 -15 0 -18 -16 -20 -23 -2 -3 7 -6 4 -6 -6 -1 -14 5 -18 22 -15 31 4 35 43 5 53 l-23 8 23 4 c30 6 28 23 -3 23 -20 0 -25 -5 -25 -25z'/><path d='M2086 3428 c3 -5 10 -6 15 -3 13 9 11 12 -6 12 -8 0 -12 -4 -9 -9z'/><path d='M1696 3052 c-3 -5 1 -9 9 -9 8 0 12 4 9 9 -3 4 -7 8 -9 8 -2 0 -6 -4 -9 -8z'/></g></svg>";
            String svgG2 = "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='50 50 500 500' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,600.000000) scale(0.100000,-0.100000)' fill='#22d3ee' stroke='none'><path d='M2813 4399 c-47 -30 -75 -81 -75 -137 0 -26 2 -53 3 -61 3 -9 -153 -97 -461 -261 l-465 -247 -30 27 c-43 39 -68 50 -115 50 -106 0 -185 -93 -165 -196 10 -55 78 -121 133 -130 27 -4 42 -12 42 -21 0 -17 77 -709 85 -764 4 -33 2 -38 -19 -43 -36 -9 -87 -55 -102 -93 -33 -78 1 -170 76 -210 54 -28 91 -29 147 -2 62 30 88 71 90 142 l1 58 380 153 380 152 27 -34 c84 -104 243 -70 285 61 25 79 -40 187 -122 204 l-30 6 6 76 c4 62 21 770 21 916 0 38 2 41 47 58 136 52 153 237 28 302 -43 22 -128 19 -167 -6z m166 -18 c67 -48 87 -121 52 -189 -34 -66 -110 -97 -178 -71 -105 40 -131 173 -48 246 21 18 47 34 59 36 34 8 89 -3 115 -22z m-198 -235 c11 -14 40 -32 65 -42 l46 -18 -6 -115 c-3 -64 -9 -280 -12 -481 -8 -470 -4 -430 -48 -445 -37 -13 -63 -30 -82 -54 -8 -11 -98 39 -465 259 l-454 273 0 78 0 79 440 231 c242 128 449 238 460 245 28 18 35 17 56 -10z m-1034 -417 c42 -26 65 -69 65 -125 0 -54 -25 -96 -72 -123 -94 -53 -206 4 -217 110 -12 119 121 201 224 138z m519 -491 l454 -273 -7 -30 c-4 -16 -7 -46 -6 -66 l2 -37 -379 -152 -380 -152 -26 31 c-31 38 -57 53 -104 61 l-35 5 -12 115 c-22 221 -74 675 -78 687 -2 7 14 21 38 31 23 10 48 26 56 35 7 10 15 17 18 17 2 0 209 -123 459 -272z m682 -228 c34 -21 72 -87 72 -125 0 -38 -37 -102 -72 -123 -66 -41 -160 -21 -202 43 -26 40 -30 104 -9 145 39 75 139 104 211 60z m-1075 -426 c47 -25 69 -70 64 -137 -3 -46 -9 -63 -32 -87 -94 -98 -255 -36 -255 97 0 56 30 104 81 131 47 25 87 24 142 -4z'/><path d='M2883 4303 c-22 -8 -14 -25 7 -18 11 3 20 2 20 -3 0 -5 -9 -21 -20 -35 -26 -33 -25 -37 10 -37 17 0 30 5 30 10 0 6 -7 10 -16 10 -14 0 -14 2 0 22 9 12 16 26 16 30 0 11 -33 26 -47 21z'/><path d='M2394 3732 c-109 -52 -134 -184 -50 -268 105 -105 278 -33 278 116 0 59 -23 104 -70 135 -52 34 -107 40 -158 17z m113 -13 c107 -40 133 -173 48 -248 -85 -75 -205 -36 -240 77 -17 58 27 141 90 168 37 16 65 17 102 3z'/><path d='M2430 3614 c0 -11 6 -14 21 -9 l20 7 -21 -41 c-11 -23 -16 -41 -10 -41 10 0 50 71 50 90 0 5 -13 10 -30 10 -21 0 -30 -5 -30 -16z'/><path d='M1645 3640 c-3 -5 -1 -10 4 -10 15 0 14 -57 -1 -63 -7 -3 3 -6 22 -6 26 -1 31 2 22 11 -7 7 -12 27 -12 45 0 32 -21 46 -35 23z'/><path d='M2160 3246 c0 -2 8 -10 18 -17 15 -13 16 -12 3 4 -13 16 -21 21 -21 13z'/><path d='M2847 2933 c-13 -12 -7 -25 8 -20 8 4 17 2 20 -3 4 -6 -2 -10 -12 -10 -17 -1 -17 -1 0 -11 24 -14 22 -32 -3 -24 -14 5 -20 2 -20 -9 0 -17 26 -21 46 -8 17 10 12 71 -6 82 -18 12 -25 12 -33 3z'/><path d='M1797 2496 c-3 -8 -4 -25 -1 -38 4 -20 3 -21 -4 -3 -9 19 -9 19 -21 -3 -10 -19 -9 -22 8 -22 11 0 22 -6 24 -12 7 -18 29 12 22 30 -3 8 -5 25 -5 38 0 26 -15 33 -23 10z'/><path d='M2099 3893 c-13 -16 -12 -17 4 -4 9 7 17 15 17 17 0 8 -8 3 -21 -13z'/><path d='M3825 2462 c-80 -37 -119 -115 -98 -194 l10 -38 -121 -73 c-66 -41 -223 -135 -348 -211 l-226 -137 -42 30 c-54 39 -105 47 -158 25 -80 -31 -126 -118 -103 -194 24 -81 106 -138 181 -125 50 9 104 48 123 88 19 39 22 109 7 137 -8 16 -6 21 12 31 13 7 158 94 323 194 165 100 314 190 332 200 l31 18 35 -30 c105 -92 267 -14 267 127 0 117 -122 200 -225 152z m122 -22 c130 -59 102 -254 -40 -277 -44 -7 -119 25 -143 62 -9 14 -19 47 -21 73 -6 64 20 110 77 140 54 27 73 27 127 2z m-994 -594 c99 -42 121 -164 43 -242 -69 -69 -188 -47 -228 44 -35 79 -8 159 67 193 48 22 75 23 118 5z'/><path d='M3860 2336 c0 -16 7 -26 21 -29 12 -3 18 -10 14 -17 -4 -6 -13 -9 -21 -6 -15 6 -19 -9 -5 -18 17 -11 41 6 41 29 0 16 -7 25 -22 28 l-23 4 23 8 c30 10 28 25 -3 25 -20 0 -25 -5 -25 -24z'/><path d='M2887 1749 c-21 -12 -22 -62 -1 -79 12 -11 18 -11 30 2 17 16 9 48 -12 48 -8 0 -14 5 -14 11 0 6 7 9 15 5 8 -3 15 -1 15 4 0 15 -14 19 -33 9z' m23 -60 c0 -5 -4 -9 -10 -9 -5 0 -10 7 -10 16 0 8 5 12 10 9 6 -3 10 -10 10 -16z'/><path d='M4060 2461 c0 -6 4 -13 10 -16 6 -3 7 1 4 9 -7 18 -14 21 -14 7z'/><path d='M1606 2362 c-3 -5 1 -9 9 -9 8 0 12 4 9 9 -3 4 -7 8 -9 8 -2 0 -6 -4 -9 -8z'/><path d='M1960 2341 c0 -6 4 -13 10 -16 6 -3 7 1 4 9 -7 18 -14 21 -14 7z'/><path d='M3420 1981 c0 -6 4 -13 10 -16 6 -3 7 1 4 9 -7 18 -14 21 -14 7z'/></g></svg>";
            String svgG3 = "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='50 50 500 500' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,600.000000) scale(0.100000,-0.100000)' fill='#22d3ee' stroke='none'><path d='M2705 4071 c-3 -5 -2 -12 3 -15 5 -3 9 1 9 9 0 17 -3 19 -12 6z'/><path d='M2475 4035 c-46 -25 -63 -44 -81 -91 -21 -54 -14 -103 21 -156 l26 -40 -24 -36 c-13 -21 -116 -172 -228 -337 l-204 -300 -42 14 c-77 27 -166 -20 -198 -104 -21 -53 -15 -98 20 -149 l25 -36 -117 -158 c-388 -524 -364 -494 -392 -485 -51 15 -128 9 -158 -13 -98 -73 -99 -205 -1 -277 41 -30 115 -34 167 -8 90 47 117 177 51 249 -11 11 -20 23 -20 25 0 2 104 142 230 313 127 170 236 318 243 328 11 16 16 17 36 7 13 -7 48 -13 78 -14 l55 -2 75 -170 c42 -93 115 -260 164 -370 l89 -200 -26 -19 c-33 -25 -64 -87 -64 -131 0 -48 32 -108 72 -137 45 -32 143 -33 185 -2 74 55 97 156 51 224 -40 58 -72 75 -142 75 l-62 0 -61 140 c-34 77 -107 245 -164 373 l-103 233 26 22 c43 36 60 72 60 126 -1 52 -12 82 -42 116 -18 19 -15 24 100 195 65 96 167 248 227 337 101 152 110 162 133 156 28 -8 108 -10 128 -3 9 3 81 -111 218 -349 112 -195 204 -358 204 -362 0 -4 -6 -12 -14 -16 -27 -16 -56 -78 -56 -122 0 -66 33 -116 97 -147 40 -20 61 -25 87 -20 l34 7 152 -382 153 -382 -31 -26 c-59 -50 -80 -138 -47 -200 34 -66 121 -109 184 -91 l32 9 182 -370 182 -370 -23 -15 c-35 -23 -65 -99 -59 -145 17 -127 163 -190 262 -115 95 73 88 204 -15 274 -29 20 -44 23 -93 20 l-59 -4 -179 365 -179 365 29 30 c54 57 65 121 31 190 -28 58 -79 90 -146 91 l-54 1 -153 380 -152 380 42 39 c68 66 71 154 6 226 -43 48 -99 66 -154 50 -44 -13 -49 -14 -49 -2 0 5 -31 62 -69 127 -37 66 -127 222 -200 348 l-132 229 24 26 c37 39 47 65 47 119 0 54 -25 100 -72 135 -37 27 -123 33 -163 12z m145 -20 c65 -34 95 -147 52 -204 -51 -69 -135 -90 -200 -51 -95 58 -95 192 0 250 39 24 107 26 148 5z m-642 -962 c48 -36 67 -71 66 -124 -1 -84 -61 -143 -144 -143 -111 0 -179 108 -130 209 39 80 140 109 208 58z m1212 -42 c126 -67 98 -250 -42 -276 -50 -9 -121 23 -148 67 -28 46 -27 115 3 158 26 39 80 70 122 70 17 0 46 -8 65 -19z m-1899 -884 c64 -42 85 -120 51 -187 -55 -110 -213 -107 -263 5 -22 50 -19 93 11 142 37 62 138 82 201 40z m1138 -122 c16 -8 40 -28 55 -45 50 -61 27 -174 -45 -212 -98 -52 -219 18 -219 127 0 105 117 178 209 130z m1191 -74 c109 -57 106 -212 -4 -262 -52 -23 -71 -23 -123 1 -110 49 -112 208 -3 262 45 23 87 23 130 -1z m527 -1041 c42 -25 66 -74 65 -129 -1 -109 -133 -179 -223 -118 -61 41 -86 125 -55 185 16 30 53 66 76 75 35 13 106 6 137 -13z'/><path d='M2535 3926 c-11 -9 -14 -16 -7 -16 15 0 16 -42 0 -58 -9 -9 -4 -12 23 -12 19 0 29 4 22 8 -6 4 -13 27 -15 50 -3 41 -4 42 -23 28z'/><path d='M1809 2973 c-13 -16 -12 -17 4 -4 9 7 17 15 17 17 0 8 -8 3 -21 -13z'/><path d='M1877 2973 c-14 -13 -6 -24 13 -18 11 4 20 2 20 -4 0 -6 -8 -11 -17 -11 -15 0 -14 -2 3 -14 10 -8 16 -18 12 -22 -4 -4 -14 -1 -23 6 -12 10 -15 10 -15 -4 0 -22 26 -31 45 -16 15 12 15 55 1 78 -8 13 -29 16 -39 5z'/><path d='M3097 2923 c-14 -13 -6 -24 13 -18 26 8 27 -16 0 -40 -11 -10 -17 -22 -14 -26 7 -12 54 -11 54 1 0 6 -7 10 -17 10 -15 0 -15 1 0 18 21 23 22 48 1 56 -20 8 -29 8 -37 -1z'/><path d='M1189 2029 c-8 -16 -8 -28 0 -46 14 -30 45 -27 49 5 3 17 -2 22 -18 22 -13 0 -20 5 -17 13 2 6 11 11 21 9 9 -2 16 2 16 8 0 19 -39 10 -51 -11z m31 -45 c0 -8 -4 -12 -10 -9 -5 3 -10 10 -10 16 0 5 5 9 10 9 6 0 10 -7 10 -16z'/><path d='M2279 1933 c-13 -16 -12 -17 4 -4 9 7 17 15 17 17 0 8 -8 3 -21 -13z'/><path d='M2340 1896 c0 -16 7 -26 21 -29 12 -3 18 -10 14 -17 -5 -8 -11 -8 -21 1 -11 9 -14 8 -14 -5 0 -21 46 -21 54 0 8 20 -1 34 -20 34 -8 0 -14 5 -14 10 0 6 7 10 15 10 8 0 15 5 15 10 0 6 -11 10 -25 10 -20 0 -25 -5 -25 -24z'/><path d='M3543 1815 c-28 -42 -28 -45 -3 -45 11 0 20 -4 20 -10 0 -16 17 -11 25 7 3 10 2 19 -4 21 -6 2 -8 16 -4 33 7 39 -7 37 -34 -6z m14 -27 c-3 -8 -6 -5 -6 6 -1 11 2 17 5 13 3 -3 4 -12 1 -19z'/><path d='M4040 796 c0 -16 3 -17 12 -8 24 24 28 11 8 -28 -11 -22 -16 -40 -10 -40 11 0 36 45 42 74 2 15 -3 19 -24 20 -22 1 -28 -3 -28 -18z'/><path d='M2690 4021 c0 -6 4 -13 10 -16 6 -3 7 1 4 9 -7 18 -14 21 -14 7z'/><path d='M2210 3326 c0 -2 8 -10 18 -17 15 -13 16 -12 3 4 -13 16 -21 21 -21 13z'/><path d='M3906 1193 c-6 -14 -5 -15 5 -6 7 7 10 15 7 18 -3 3 -9 -2 -12 -12z'/></g></svg>";
            String svgG4 = "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='50 50 500 500' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,600.000000) scale(0.100000,-0.100000)' fill='#22d3ee' stroke='none'><path d='M2970 4059 c-53 -31 -73 -65 -78 -129 -5 -68 12 -107 65 -147 32 -24 45 -28 103 -27 l67 0 41 -80 c39 -76 72 -139 258 -494 l75 -142 -31 -31 c-17 -18 -34 -45 -37 -61 -5 -25 -9 -28 -32 -24 -24 6 -415 53 -650 79 l-104 12 -12 48 c-21 81 -79 127 -163 127 -121 0 -199 -129 -143 -238 11 -22 28 -45 37 -50 13 -7 -15 -56 -162 -293 -98 -156 -187 -301 -198 -322 -16 -29 -25 -36 -41 -32 -59 17 -91 16 -135 -7 -113 -58 -129 -208 -30 -278 45 -32 124 -38 174 -15 40 19 86 77 86 108 0 17 5 19 43 13 23 -3 177 -17 342 -31 437 -37 402 -30 408 -72 17 -105 139 -163 237 -113 60 31 85 73 85 146 0 51 -4 66 -29 98 -38 50 -86 70 -152 63 l-51 -5 -93 176 c-52 98 -105 200 -120 227 -158 294 -172 323 -151 334 10 6 29 31 41 57 18 37 27 45 44 41 11 -3 186 -25 388 -48 l366 -44 6 -36 c13 -79 83 -139 164 -139 132 0 211 150 136 257 -11 14 -23 31 -28 38 -6 7 5 33 30 72 22 33 111 175 199 316 119 191 164 255 175 251 111 -45 230 34 230 151 0 60 -25 106 -80 143 -29 20 -45 23 -91 20 -69 -5 -114 -35 -141 -95 l-19 -44 -47 6 c-26 3 -173 16 -327 30 -154 13 -307 27 -341 30 l-60 6 -11 42 c-7 24 -21 54 -32 69 -46 58 -146 75 -211 37z m161 -22 c129 -86 60 -277 -94 -264 -38 3 -56 11 -83 38 -53 51 -62 118 -25 187 33 61 139 82 202 39z m1112 -96 c85 -56 95 -160 23 -231 -29 -27 -45 -34 -88 -38 -44 -3 -59 0 -88 20 -93 62 -91 191 2 248 42 26 113 26 151 1z m-653 -81 c445 -39 403 -31 417 -83 7 -24 23 -55 38 -71 l26 -28 -127 -201 c-70 -111 -161 -255 -202 -320 -60 -94 -78 -116 -91 -110 -9 4 -43 8 -76 7 l-60 -1 -188 359 -189 359 32 32 c17 18 34 44 37 60 3 16 12 27 22 27 9 0 171 -14 361 -30z m-1035 -710 c93 -57 85 -202 -15 -252 -126 -64 -255 69 -194 197 36 77 131 102 209 55z m1105 -129 c68 -36 93 -127 56 -199 -52 -100 -207 -95 -258 8 -65 128 75 259 202 191z m-1200 -158 c19 -2 46 0 60 5 24 9 28 2 216 -354 l191 -364 -33 -36 c-19 -19 -34 -41 -34 -47 -1 -38 -12 -39 -186 -23 -93 8 -254 22 -359 31 -260 22 -255 21 -255 51 0 29 -14 60 -42 91 -24 26 -41 -8 176 341 95 152 178 287 185 300 9 16 18 21 29 17 9 -4 33 -9 52 -12z m-507 -622 c65 -25 109 -113 89 -179 -40 -131 -224 -141 -278 -15 -19 44 -18 69 7 120 33 68 113 100 182 74z m1153 -122 c78 -73 70 -184 -18 -240 -26 -15 -45 -19 -86 -16 -46 3 -59 9 -90 41 -35 34 -37 40 -37 102 0 64 1 66 43 106 43 39 45 40 103 36 45 -3 65 -10 85 -29z'/><path d='M3043 3962 c-9 -6 -10 -17 -4 -40 6 -20 6 -32 0 -32 -5 0 -9 -4 -9 -10 0 -5 11 -10 25 -10 14 0 25 5 25 10 0 6 -4 10 -9 10 -6 0 -11 18 -13 40 -2 28 -6 37 -15 32z'/><path d='M4140 3854 c0 -10 6 -14 15 -10 9 3 15 0 15 -8 0 -7 -7 -19 -15 -26 -23 -19 -18 -36 9 -35 27 0 49 15 23 15 -20 0 -21 4 -5 29 6 10 8 26 5 35 -8 21 -47 21 -47 0z'/><path d='M2463 3045 c-28 -42 -28 -45 -4 -45 11 0 22 -6 24 -12 7 -18 29 12 22 30 -3 8 -5 25 -5 38 0 33 -11 30 -37 -11z'/><path d='M2565 3061 c-3 -5 -2 -12 3 -15 5 -3 9 1 9 9 0 17 -3 19 -12 6z'/><path d='M3573 2943 c-7 -3 -13 -9 -13 -15 0 -6 7 -8 15 -4 8 3 15 1 15 -4 0 -6 -4 -10 -10 -10 -5 0 -10 -4 -10 -10 0 -5 7 -10 15 -10 17 0 20 -16 5 -25 -5 -3 -10 -1 -10 4 0 6 -4 11 -10 11 -5 0 -10 -7 -10 -15 0 -18 34 -20 48 -2 12 15 4 74 -12 80 -6 2 -17 2 -23 0z'/><path d='M1870 2125 c0 -18 5 -25 20 -25 20 0 26 -11 13 -23 -3 -4 -12 -2 -20 4 -10 9 -13 8 -13 -5 0 -28 54 -17 58 12 3 17 -2 22 -17 22 -12 0 -21 5 -21 10 0 6 7 10 15 10 8 0 15 5 15 10 0 6 -11 10 -25 10 -20 0 -25 -5 -25 -25z'/><path d='M2994 2036 c-12 -30 1 -71 22 -74 31 -4 41 29 15 47 -24 16 -28 33 -6 25 8 -4 15 -1 15 5 0 16 -40 13 -46 -3z m31 -45 c3 -5 1 -12 -4 -15 -5 -3 -11 1 -15 9 -6 16 9 21 19 6z'/></g></svg>";
            String svgG5 = "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='50 50 500 500' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,600.000000) scale(0.100000,-0.100000)' fill='#22d3ee' stroke='none'><path d='M2925 4800 c-77 -17 -125 -78 -125 -159 0 -56 18 -102 50 -124 19 -13 12 -27 -175 -338 l-195 -324 -64 3 c-74 4 -112 -11 -150 -60 -49 -66 -46 -146 9 -207 l33 -37 -181 -331 -181 -331 -56 5 c-63 6 -98 -7 -142 -54 -118 -127 32 -329 193 -259 13 5 41 -30 129 -161 63 -92 160 -237 217 -321 l104 -152 -27 -36 c-40 -51 -45 -135 -12 -183 34 -50 71 -73 125 -78 135 -13 223 117 161 237 -39 76 -116 103 -213 76 -17 -5 -52 41 -238 316 l-217 322 24 25 c13 14 29 43 36 64 6 20 12 37 13 37 10 2 696 29 737 29 l55 0 23 -49 c29 -62 79 -95 142 -95 25 0 54 3 66 8 19 7 41 -25 229 -324 178 -284 206 -333 191 -341 -24 -13 -56 -82 -56 -120 0 -53 39 -120 85 -146 31 -18 51 -22 92 -19 163 11 211 212 73 305 -28 19 -45 23 -85 20 -27 -3 -57 -7 -65 -11 -11 -4 -33 23 -84 106 -39 62 -132 211 -208 331 -114 181 -136 221 -123 228 8 5 25 28 36 50 56 109 -22 238 -143 238 -27 0 -58 -4 -68 -10 -16 -8 -43 29 -229 310 l-212 320 27 36 c50 65 43 167 -16 222 -19 18 -17 22 175 343 150 248 199 323 213 321 34 -7 97 -6 122 1 24 7 34 -7 223 -310 158 -253 196 -321 188 -333 -49 -67 -52 -75 -49 -135 4 -63 20 -94 67 -130 30 -22 128 -33 159 -16 15 8 21 8 25 -2 3 -7 95 -153 205 -324 197 -308 200 -312 180 -330 -72 -65 -61 -194 21 -248 72 -47 138 -45 198 8 96 84 78 218 -36 277 -28 14 -118 15 -135 1 -10 -8 -48 45 -161 222 -82 127 -175 272 -207 322 -56 88 -57 90 -39 110 29 31 51 81 51 114 0 104 -112 192 -208 163 -28 -9 -39 -9 -48 1 -6 6 -97 150 -203 320 l-192 307 25 31 c55 64 57 147 5 213 -36 46 -105 70 -164 56z m114 -38 c99 -74 86 -216 -24 -258 -148 -56 -270 130 -157 239 51 49 130 58 181 19z m567 -918 c89 -42 109 -153 43 -229 -77 -87 -217 -53 -248 61 -32 119 92 221 205 168z m-1149 -14 c54 -24 83 -70 83 -130 0 -186 -267 -200 -287 -16 -10 82 61 161 147 165 8 0 34 -8 57 -19z m-20 -292 c25 7 47 11 48 10 1 -2 97 -146 212 -320 l210 -318 -24 -22 c-14 -13 -29 -42 -36 -65 -8 -33 -16 -43 -32 -43 -41 0 -554 -19 -667 -25 l-118 -6 0 24 c0 24 -30 71 -59 93 -11 9 -3 30 47 120 33 60 78 141 99 179 21 39 76 141 123 226 l84 156 34 -10 c24 -8 46 -7 79 1z m1773 -627 c39 -28 70 -80 70 -118 0 -137 -161 -201 -255 -103 -50 52 -45 164 9 209 49 41 128 46 176 12z m-1125 -12 c93 -56 85 -201 -15 -251 -126 -64 -255 69 -194 199 37 76 131 99 209 52z m-1138 -39 c36 -21 73 -85 73 -125 0 -40 -37 -104 -73 -125 -72 -44 -173 -13 -208 64 -23 52 -23 71 1 123 35 78 134 108 207 63z m1727 -899 c46 -30 66 -70 66 -129 0 -47 -4 -57 -38 -94 -34 -36 -45 -42 -93 -45 -45 -4 -60 -1 -89 19 -93 62 -91 191 2 248 43 26 113 26 152 1z m-1106 -21 c126 -77 74 -270 -73 -270 -52 0 -101 26 -126 67 -27 43 -23 131 7 164 53 60 132 76 192 39z'/><path d='M2952 4659 c-26 -43 -27 -49 -7 -49 8 0 15 -4 15 -10 0 -14 17 -12 23 3 2 7 2 30 -2 52 l-6 40 -23 -36z m18 -23 c0 -3 -4 -8 -10 -11 -5 -3 -10 -1 -10 4 0 6 5 11 10 11 6 0 10 -2 10 -4z'/><path d='M3529 3753 c-1 -5 -2 -25 -3 -45 -1 -31 3 -37 22 -41 12 -2 22 0 22 4 0 5 -5 9 -11 9 -7 0 -10 15 -7 40 2 28 0 40 -9 40 -7 0 -14 -3 -14 -7z'/><path d='M2370 3729 c0 -6 7 -9 15 -5 8 3 15 1 15 -4 0 -6 -4 -10 -10 -10 -5 0 -10 -4 -10 -10 0 -5 7 -10 15 -10 8 0 15 -5 15 -11 0 -6 -9 -9 -20 -6 -13 3 -20 0 -20 -9 0 -17 34 -18 48 -1 5 6 7 27 5 45 -4 26 -10 32 -29 32 -13 0 -24 -5 -24 -11z'/><path d='M2304 3409 c-3 -6 -2 -15 3 -20 5 -5 9 -1 -9 11 0 23 -2 24 -12 9z'/><path d='M4110 2825 c0 -9 6 -12 15 -9 19 8 19 -4 0 -36 -17 -29 -18 -40 -6 -40 9 0 41 71 41 90 0 6 -11 10 -25 10 -15 0 -25 -6 -25 -15z'/><path d='M2980 2816 c0 -10 6 -13 15 -10 9 4 15 0 15 -9 0 -8 -7 -20 -15 -27 -8 -7 -15 -18 -15 -25 0 -14 47 -17 56 -4 3 5 -5 9 -17 9 -21 0 -21 1 -5 19 10 11 16 28 14 38 -4 23 -48 31 -48 9z'/><path d='M1847 2783 c-14 -13 -6 -41 13 -46 11 -3 20 -10 20 -17 0 -7 -8 -9 -20 -5 -12 4 -20 2 -20 -5 0 -17 29 -23 45 -10 21 18 19 41 -5 47 -23 6 -27 23 -5 23 8 0 15 5 15 10 0 11 -33 14 -43 3z'/><path d='M1905 2661 c-3 -5 -2 -12 3 -15 5 -3 9 1 9 9 0 17 -3 19 -12 6z'/><path d='M3584 1882 c-18 -12 -16 -82 3 -89 24 -9 42 22 34 59 -7 33 -19 43 -37 30z m26 -16 c0 -3 -4 -8 -10 -11 -5 -3 -10 -1 -10 4 0 6 5 11 10 11 6 0 10 -2 10 -4z m0 -47 c0 -5 -4 -9 -10 -9 -5 0 -10 7 -10 16 0 8 5 12 10 9 6 -3 10 -10 10 -16z'/><path d='M2477 1853 c-4 -3 -7 -21 -7 -40 0 -39 23 -54 47 -30 17 17 10 37 -13 37 -8 0 -14 7 -14 15 0 9 6 12 15 9 8 -4 15 -1 15 5 0 12 -32 15 -43 4z m28 -52 c3 -5 1 -12 -4 -15 -5 -3 -11 1 -15 9 -6 16 9 21 19 6z'/><path d='M3925 2991 c-3 -5 -2 -12 3 -15 5 -3 9 1 9 9 0 17 -3 19 -12 6z'/></g></svg>";
            String svgG6 = "<svg version='1.0' xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' viewBox='50 50 500 500' preserveAspectRatio='xMidYMid meet'><g transform='translate(0.000000,600.000000) scale(0.100000,-0.100000)' fill='#22d3ee' stroke='none'><path d='M3435 4226 c-39 -17 -80 -65 -95 -110 -17 -53 3 -112 55 -162 l43 -42 -117 -352 -116 -352 -45 -2 c-25 -1 -61 -10 -80 -19 l-35 -18 -44 48 c-25 26 -145 150 -268 275 l-223 228 20 32 c13 22 20 51 20 84 0 122 -128 201 -237 145 -107 -54 -121 -206 -26 -278 48 -37 129 -44 176 -15 l35 20 269 -277 269 -276 -19 -33 c-10 -17 -20 -51 -21 -74 l-2 -42 -305 -81 c-167 -45 -337 -91 -376 -102 -69 -19 -73 -19 -78 -2 -3 9 -23 33 -45 52 -138 126 -340 -40 -249 -203 54 -98 199 -111 268 -25 26 34 44 90 39 119 -5 22 5 26 246 90 302 80 454 120 482 130 17 5 26 -1 46 -31 14 -21 38 -45 54 -53 16 -8 30 -15 32 -16 2 -1 -116 -472 -179 -717 -8 -29 -14 -37 -26 -33 -27 11 -96 -15 -129 -48 -44 -44 -61 -103 -45 -158 26 -87 121 -143 200 -120 78 24 121 78 124 159 l2 47 375 122 c206 68 380 123 385 123 6 1 18 -12 27 -28 22 -39 86 -71 141 -71 84 0 157 75 157 162 0 60 -19 98 -67 135 -49 37 -135 40 -182 5 l-31 -23 -282 248 c-156 136 -284 247 -285 248 -2 1 6 19 17 40 11 22 20 50 20 62 0 54 -63 153 -98 153 -7 0 -12 6 -9 13 2 6 55 168 118 359 l114 348 44 0 c55 0 115 33 144 79 27 45 29 123 3 166 -40 68 -142 103 -211 71z m146 -29 c64 -43 86 -121 50 -187 -57 -109 -211 -107 -261 3 -11 23 -20 51 -20 62 0 38 38 104 72 125 46 28 115 27 159 -3z m-1109 -243 c39 -29 58 -67 58 -119 0 -58 -20 -97 -63 -124 -125 -77 -275 59 -209 189 27 55 77 83 138 78 29 -3 62 -13 76 -24z m757 -784 c41 -20 81 -85 81 -128 0 -36 -25 -87 -55 -110 -80 -63 -192 -37 -231 55 -19 44 -18 69 6 118 37 76 123 104 199 65z m340 -499 l278 -243 -19 -37 c-12 -22 -18 -51 -16 -73 2 -21 3 -38 2 -38 -1 0 -174 -56 -385 -125 -347 -112 -384 -123 -393 -107 -15 26 -67 72 -82 72 -8 0 -14 3 -14 8 0 4 43 174 94 377 l93 370 51 6 c27 4 61 14 73 23 13 9 27 15 32 13 4 -1 133 -112 286 -246z m-1423 213 c69 -33 104 -127 70 -191 -22 -43 -68 -79 -111 -87 -49 -10 -122 26 -149 73 -26 45 -25 114 1 149 50 67 121 88 189 56z m1900 -430 c45 -21 77 -75 77 -129 0 -152 -207 -201 -275 -65 -64 126 69 255 198 194z m-1115 -345 c112 -38 141 -171 54 -248 -89 -77 -219 -31 -241 86 -12 64 37 143 102 163 40 12 46 12 85 -1z'/><path d='M3470 4105 c0 -8 5 -15 10 -15 6 0 10 5 10 10 0 6 5 10 10 10 17 0 11 -26 -10 -45 -28 -25 -25 -35 10 -35 17 0 30 5 30 10 0 6 -7 10 -17 10 -15 0 -14 2 2 20 9 10 15 26 12 35 -8 20 -57 20 -57 0z'/><path d='M2377 3855 c-26 -38 -27 -40 -7 -43 11 -2 20 -8 20 -13 0 -13 17 -11 22 4 2 6 1 30 -2 52 l-5 40 -28 -40z'/><path d='M3140 3080 c-10 -6 -11 -10 -2 -10 7 0 12 -13 12 -29 0 -16 -6 -32 -12 -34 -7 -3 3 -5 22 -5 19 0 29 2 23 5 -8 2 -13 22 -13 44 0 41 -5 45 -30 29z'/><path d='M2060 2784 c-19 -22 -1 -69 25 -69 29 0 34 45 6 52 -11 3 -18 9 -16 14 3 4 12 6 20 2 8 -3 15 0 15 6 0 16 -36 13 -50 -5z m30 -50 c0 -8 -4 -12 -10 -9 -5 3 -10 10 -10 16 0 5 5 9 10 9 6 0 10 -7 10 -16z'/><path d='M3950 2359 c0 -6 7 -9 15 -5 8 3 15 1 15 -4 0 -6 -4 -10 -10 -10 -5 0 -10 -4 -10 -10 0 -5 7 -10 15 -10 8 0 15 -5 15 -11 0 -6 -9 -9 -20 -6 -13 3 -20 0 -20 -9 0 -17 34 -18 48 -1 5 6 7 27 5 45 -4 26 -10 32 -29 32 -13 0 -24 -5 -24 -11z'/><path d='M2860 1995 c0 -15 6 -25 14 -25 17 0 31 -18 22 -27 -3 -3 -12 0 -21 7 -12 10 -15 10 -15 -3 0 -23 16 -30 40 -17 26 14 26 40 0 47 -23 6 -27 23 -5 23 8 0 15 5 15 10 0 6 -11 10 -25 10 -20 0 -25 -5 -25 -25z'/><path d='M3655 4231 c-3 -5 -2 -12 3 -15 5 -3 9 1 9 9 0 17 -3 19 -12 6z'/><path d='M2180 2940 c-9 -6 -10 -10 -3 -10 6 0 15 5 18 10 8 12 4 12 -15 0z'/><path d='M2223 2575 c0 -8 4 -12 9 -9 5 3 6 10 3 15 -9 13 -12 11 -12 -6z'/></g></svg>";
            String svgG7 = "<svg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'>" +
                    "<line x1='150' y1='200' x2='150' y2='400' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='150' y1='200' x2='300' y2='300' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='150' y1='400' x2='300' y2='300' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='300' y1='300' x2='450' y2='200' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='300' y1='300' x2='450' y2='400' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='450' y1='200' x2='450' y2='400' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='450' y1='400' x2='550' y2='400' stroke='#22d3ee' stroke-width='4'/>" +
                    "<circle cx='150' cy='200' r='20' fill='none' stroke='#22d3ee' stroke-width='3'/><text x='143' y='206' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>1</text>" +
                    "<circle cx='150' cy='400' r='20' fill='none' stroke='#22d3ee' stroke-width='3'/><text x='143' y='406' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>2</text>" +
                    "<circle cx='300' cy='300' r='20' fill='none' stroke='#22d3ee' stroke-width='3'/><text x='293' y='306' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>3</text>" +
                    "<circle cx='450' cy='200' r='20' fill='none' stroke='#22d3ee' stroke-width='3'/><text x='443' y='206' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>4</text>" +
                    "<circle cx='450' cy='400' r='20' fill='none' stroke='#22d3ee' stroke-width='3'/><text x='443' y='406' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>5</text>" +
                    "<circle cx='550' cy='400' r='20' fill='none' stroke='#22d3ee' stroke-width='3'/><text x='543' y='406' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>6</text>" +
                    "</svg>";


            String svgG8 = "<svg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'>" +
                    "<defs><marker id='arrow' viewBox='0 0 10 10' refX='22' refY='5' markerWidth='6' markerHeight='6' orient='auto-start-reverse'>" +
                    "<path d='M 0 0 L 10 5 L 0 10 z' fill='#22d3ee' /></marker></defs>" +
                    "<line x1='100' y1='250' x2='250' y2='150' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<line x1='250' y1='150' x2='250' y2='350' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<line x1='250' y1='350' x2='100' y2='250' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<line x1='250' y1='350' x2='400' y2='350' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<line x1='400' y1='350' x2='400' y2='150' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<line x1='400' y1='150' x2='250' y2='350' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<line x1='400' y1='150' x2='500' y2='250' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)'/>" +
                    "<path d='M100,250 Q300,550 500,250' fill='transparent' stroke='#22d3ee' stroke-width='4' marker-end='url(#arrow)' />" +
                    "<circle cx='100' cy='250' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='93' y='256' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>1</text>" +
                    "<circle cx='250' cy='150' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='243' y='156' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>2</text>" +
                    "<circle cx='250' cy='350' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='243' y='356' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>3</text>" +
                    "<circle cx='400' cy='350' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='393' y='356' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>4</text>" +
                    "<circle cx='400' cy='150' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='393' y='156' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>5</text>" +
                    "<circle cx='500' cy='250' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='493' y='256' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>6</text>" +
                    "</svg>";

            String svgG9 = "<svg viewBox='0 0 600 600' xmlns='http://www.w3.org/2000/svg'>" +

                    "<line x1='300' y1='100' x2='490' y2='238' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='300' y1='100' x2='418' y2='462' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='300' y1='100' x2='182' y2='462' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='300' y1='100' x2='110' y2='238' stroke='#22d3ee' stroke-width='4'/>" +

                    "<line x1='490' y1='238' x2='418' y2='462' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='490' y1='238' x2='182' y2='462' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='490' y1='238' x2='110' y2='238' stroke='#22d3ee' stroke-width='4'/>" +

                    "<line x1='418' y1='462' x2='182' y2='462' stroke='#22d3ee' stroke-width='4'/>" +
                    "<line x1='418' y1='462' x2='110' y2='238' stroke='#22d3ee' stroke-width='4'/>" +

                    "<line x1='182' y1='462' x2='110' y2='238' stroke='#22d3ee' stroke-width='4'/>" +

                    "<circle cx='300' cy='100' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='293' y='106' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>1</text>" +
                    "<circle cx='490' cy='238' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='483' y='244' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>2</text>" +
                    "<circle cx='418' cy='462' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='411' y='468' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>3</text>" +
                    "<circle cx='182' cy='462' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='175' y='468' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>4</text>" +
                    "<circle cx='110' cy='238' r='20' fill='#0f172a' stroke='#22d3ee' stroke-width='3'/><text x='103' y='244' fill='#22d3ee' font-size='20' font-family='monospace' font-weight='bold'>5</text>" +
                    "</svg>";


            tasks.add(createTask(infoLevel, 1, TaskType.MultipleChoice,
                    "HQ: Analizează legăturile din Sectorul G1. Câte elemente de '1' există în matricea de adiacență a acestui sistem neorientat?",
                    "Într-un graf neorientat, matricea este simetrică. Numărul de elemente nenule (de 1) este egal cu 2 * m (unde m = numărul de muchii).",
                    Map.of("options", List.of("6", "10", "12", "5"), "correctAnswer", "12", "svgContent", svgG1), mapper));

            tasks.add(createTask(infoLevel, 2, TaskType.MultipleChoice,
                    "Care este gradul MINIM (δ(G)) al serverelor din Sectorul G1?",
                    "Gradul minim reprezintă nodul cu cele mai puține legături. Caută nodurile marginale.",
                    Map.of("options", List.of("5", "2", "3", "4"), "correctAnswer", "5", "svgContent", svgG1), mapper));

            tasks.add(createTask(infoLevel, 3, TaskType.VisualID,
                    "Identifică punctul slab. Dă click pe terminalul (nodul) care are un grad de conectare egal cu 1.",
                    "Un nod cu gradul 1 este o extremitate (nod terminal/frunză) legată printr-o singură conexiune.",
                    Map.of("targetZone", Map.of("x", 557, "y", 607, "width", 88, "height", 84), "svgContent", svgG1), mapper));

            tasks.add(createTask(infoLevel, 4, TaskType.MultipleChoice,
                    "Un graf neorientat are 6 noduri, numerotate de la 1 la 6, și muchiile [1,2], [1,3], [2,3], [3,4], [3,5], [4,5], [5,6]. Indicați un ciclu elementar al acestui graf.",
                    "Un ciclu elementar se termină cu același nod cu care a început și nu repetă niciun alt nod pe traseu.",
                    Map.of("options", List.of("1, 2, 3", "1, 2, 3, 1", "1, 2, 3, 4, 5, 3, 1", "1, 2, 3, 4, 5, 6, 1"),
                            "correctAnswer", "1, 2, 3, 1",
                            "svgContent", svgG7), mapper));

            tasks.add(createTask(infoLevel, 5, TaskType.MultipleChoice,
                    "Ce proprietate matematică are matricea de adiacență a grafului G1?",
                    "Fiind un graf neorientat, muchia [x,y] implică existența muchiei [y,x].",
                    Map.of("options", List.of("Este asimetrică", "Este simetrică față de diagonala principală", "Are 1 pe diagonala principală", "Nu poate fi reprezentată"), "correctAnswer", "Este simetrică față de diagonala principală", "svgContent", svgG1), mapper));

            tasks.add(createTask(infoLevel, 6, TaskType.MultipleChoice,
                    "Un graf orientat are 6 vârfuri, numerotate de la 1 la 6, și arcele (1,2), (1,6), (2,3), (3,1), (3,4), (4,5), (5,3), (5,6). Indicați un circuit elementar al acestui graf.",
                    "Un circuit elementar nu repetă noduri interne. Urmărește săgețile pentru a forma un circuit valid care se întoarce la nodul inițial.",
                    Map.of("options", List.of("1, 2, 3", "1, 2, 3, 1", "1, 2, 3, 4, 5, 3, 1", "1, 2, 3, 4, 5, 6, 1"),
                            "correctAnswer", "1, 2, 3, 1",
                            "svgContent", svgG8), mapper));

            tasks.add(createTask(infoLevel, 7, TaskType.MultipleChoice,
                    "Matematică - Un graf neorientat, complet, are exact 300 de muchii. Câte noduri are sistemul?",
                    "Folosește formula m = n*(n-1)/2. Deci 300 = n*(n-1)/2. Ecuația devine n*(n-1) = 600.",
                    Map.of("options", List.of("25", "30", "299", "301"), "correctAnswer", "25", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 8, TaskType.MultipleChoice,
                    "Arbori - Un arbore cu 10 noduri este dat prin vectorul de tați: (7,4,6,7,4,7,0,9,6,5). Care este numărul de noduri 'frunză' (terminale)?",
                    "Nodurile frunză sunt nodurile care NU apar în vectorul de tați (nu au descendenți). Caută cifrele de la 1 la 10 care lipsesc din șirul dat.",
                    Map.of("options", List.of("6", "5", "4", "2"), "correctAnswer", "5", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 9, TaskType.MultipleChoice,
                    "Câte componente conexe are sistemul din Sectorul G2? Este grav fragmentat?",
                    "O componentă conexă este un subgraf maximal în care se poate ajunge de la orice nod la oricare altul.",
                    Map.of("options", List.of("1", "2", "3", "4"), "correctAnswer", "3", "svgContent", svgG2), mapper));

            tasks.add(createTask(infoLevel, 10, TaskType.VisualID,
                    "Avem un satelit complet izolat în G2! Apasă pe el pentru a-i face ping.",
                    "Nodul izolat are gradul 0 (niciun semnal către alții, formează singur o componentă conexă).",
                    Map.of("targetZone", Map.of("x", 399, "y", 360, "width", 45, "height", 65), "svgContent", svgG2), mapper));

            tasks.add(createTask(infoLevel, 11, TaskType.MultipleChoice,
                    "Dacă am vrea să conectăm TOATE componentele conexe din G2 într-o singură rețea unitară, câte muchii minime trebuie să adăugăm?",
                    "Dacă ai p componente conexe, ai nevoie de minim p-1 muchii pentru a le lega.",
                    Map.of("options", List.of("1", "2", "3", "Nu se poate"), "correctAnswer", "2", "svgContent", svgG2), mapper));

            tasks.add(createTask(infoLevel, 12, TaskType.MultipleChoice,
                    "Analizează Sectorul G3 (Graf Orientat). Care este nodul destinație absolută (grad extern = 0, grad intern maxim)?",
                    "Atenție la sensul săgeților. Caută nodul în care DOAR intră semnale (niciunul nu iese).",
                    Map.of("options", List.of("Nod 1", "Nod 4", "Nod 5", "Nu există"), "correctAnswer", "Nu există", "svgContent", svgG8), mapper));

            tasks.add(createTask(infoLevel, 13, TaskType.MultipleChoice,
                    "Cum se numește graful în care între ORICARE două noduri x și y există un drum DUS-ÎNTORS?",
                    "Cuvântul cheie este 'Tare'.",
                    Map.of("options", List.of("Graf Complet", "Graf Tare Conex", "Arbore Binar", "Graf Eulerian"), "correctAnswer", "Graf Tare Conex", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 14, TaskType.MultipleChoice,
                    "Ce afirmă Teorema sumei gradelor într-un Graf Orientat?",
                    "Fiecare arc contribuie cu 1 la gradul intern al unui nod și cu 1 la gradul extern al altui nod.",
                    Map.of("options", List.of("Suma gradelor externe = Suma gradelor interne = Nr. Arce", "Suma totală a gradelor = Nr. Arce", "Gradele interne sunt mereu pare", "Nu există o regulă"), "correctAnswer", "Suma gradelor externe = Suma gradelor interne = Nr. Arce", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 15, TaskType.MultipleChoice,
                    "Infrastructură Oraș: Există 5 piețe. Piața 1 este conectată direct cu piețele 2, 3, 4, 5. Celelalte nu sunt conectate între ele. Câte benzi (muchii) minime trebuie adăugate ca graful să devină EULERIAN?",
                    "Pentru a fi Eulerian, toate nodurile trebuie să aibă grad par. Nodul 1 are grad 4 (par). Nodurile 2,3,4,5 au grad 1 (impar). Adaugă muchii între ele pentru a le face de grad 2.",
                    Map.of("options", List.of("0", "2", "4", "6"), "correctAnswer", "2", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 16, TaskType.MultipleChoice,
                    "Verificare integritate: Dacă sistemul stelar A1 are 7 sateliți formați într-un ARBORE, câte conexiuni (muchii) există exact?",
                    "Teorema arborilor: Orice arbore cu n noduri are exact n-1 muchii. O conexiune în plus ar crea un scurt-circuit (ciclu).",
                    Map.of("options", List.of("7", "8", "6", "14"), "correctAnswer", "6", "svgContent", svgG3), mapper));

            tasks.add(createTask(infoLevel, 17, TaskType.VisualID,
                    "Apasă pe nodul 'Rădăcină' (Root) al arborelui A1 pentru a transfera datele primare.",
                    "Rădăcina este sursa principală, nodul cel mai de sus (Nodul 1), de la care derivă toți ceilalți sateliți în josul ierarhiei.",
                    Map.of("targetZone", Map.of("x", 402, "y", 299, "width", 59, "height", 78), "svgContent", svgG3), mapper));

            tasks.add(createTask(infoLevel, 18, TaskType.DragAndDrop,
                    "Sortează proprietățile de rețea în funcție de tipul de structură pe care îl descriu.",
                    "Un graf complet are conexiuni maxime (K_n). Un arbore este minimalist (conex, fără cicluri, are n-1 muchii).",
                    Map.of("items", List.of(
                                    Map.of("id", "i1", "text", "n*(n-1)/2 muchii", "category", "Graf Complet"),
                                    Map.of("id", "i2", "text", "n-1 muchii, conex", "category", "Arbore"),
                                    Map.of("id", "i3", "text", "Toate gradele = n-1", "category", "Graf Complet"),
                                    Map.of("id", "i4", "text", "Fără cicluri, conex minimal", "category", "Arbore")
                            ),
                            "zones", List.of("Graf Complet", "Arbore"), "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 19, TaskType.MultipleChoice,
                    "Un sistem de comunicații cu 5 noduri, unde orice nod e direct conectat cu absolut toate celelalte. Cum se numește în termeni tehnici?",
                    "Aceasta e definiția grafului complet K_5.",
                    Map.of("options", List.of("Graf Nul", "Graf Bipartit", "Graf Complet", "Arbore Binar"), "correctAnswer", "Graf Complet", "svgContent", svgG9), mapper));

            tasks.add(createTask(infoLevel, 20, TaskType.MultipleChoice,
                    "În acest graf (G5), câte conexiuni active (muchii) trebuie să întreținem dacă e complet (K_5)?",
                    "Folosește formula n*(n-1)/2 unde n=5.",
                    Map.of("options", List.of("5", "10", "20", "15"), "correctAnswer", "10", "svgContent", svgG9), mapper));

            tasks.add(createTask(infoLevel, 21, TaskType.MultipleChoice,
                    "Un graf este Eulerian dacă...",
                    "Conform teoremei lui Euler, trebuie să fie conex și toate nodurile să aibă grad par.",
                    Map.of("options", List.of("Are gradele tuturor nodurilor pare", "Este graf complet", "Este un arbore", "Toate nodurile au grad impar"), "correctAnswer", "Are gradele tuturor nodurilor pare", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 22, TaskType.VisualID,
                    "Avertizare: Există o vulnerabilitate critică (Muchie vulnerabilă). Dă click pe muchia care, dacă pică, va sparge rețeaua în două părți.",
                    "O punte (bridge) este muchia care nu face parte din niciun ciclu.",
                    Map.of("targetZone", Map.of("x", 438, "y", 489, "width", 130, "height", 30), "svgContent", svgG4), mapper));

            tasks.add(createTask(infoLevel, 23, TaskType.MultipleChoice,
                    "Dacă puntea dintre nodul 3 și 4 pică din graf (G6 devine neconex), câte muchii minime trebuie să adăugăm pentru a face graful conex la loc?",
                    "Dacă un graf se rupe în fix 2 componente, este nevoie de 1 singură muchie pentru a le reuni.",
                    Map.of("options", List.of("1", "2", "0", "Depinde de noduri"), "correctAnswer", "1", "svgContent", svgG4), mapper));

            tasks.add(createTask(infoLevel, 24, TaskType.MultipleChoice,
                    "Analizează Sectorul G7. Este sigur să o clasificăm ca o rețea de tip Arbore?",
                    "Un arbore este obligatoriu conex și aciclic. Privește atent muchiile, există un poligon închis (ciclu)?",
                    Map.of("options", List.of("Da", "Nu"), "correctAnswer", "Nu", "svgContent", svgG5), mapper));

            tasks.add(createTask(infoLevel, 25, TaskType.VisualID,
                    "Sectorul G8 are nevoie de o actualizare de firmware. Identifică terminalul (nodul) care consumă cele mai multe resurse (are GRADUL MAXIM).",
                    "Nu te lăsa indus în eroare de cum e desenat graful. Numără strict câte linii pleacă din fiecare punct central.",
                    Map.of("targetZone", Map.of("x", 501, "y", 475, "width", 40, "height", 35), "svgContent", svgG6), mapper));

            tasks.add(createTask(infoLevel, 26, TaskType.SentenceBuilder,
                    "Formează o buclă care afișează toate nodurile cu gradul IMPAR dintr-un vector de grade 'd':",
                    "Verifici divizibilitatea cu 2. Dacă restul modulo 2 este diferit de 0 (sau egal cu 1), atunci este impar.",
                    Map.of("words", List.of("if(d[i] % 2 != 0)", "cout << i << \" \";", "for(int i=1; i<=n; i++)"),
                            "correctOrder", List.of("for(int i=1; i<=n; i++)", "if(d[i] % 2 != 0)", "cout << i << \" \";"), "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 27, TaskType.SentenceBuilder,
                    "Cum calculezi gradul unui nod 'k' dintr-o matrice de adiacență 'a' (Graf neorientat)?",
                    "Parcurgi linia 'k' și aduni la o variabilă 'grad' valoarea a[k][i].",
                    Map.of("words", List.of("for(int i=1; i<=n; i++)", "grad = grad + a[k][i];", "int grad = 0;"),
                            "correctOrder", List.of("int grad = 0;", "for(int i=1; i<=n; i++)", "grad = grad + a[k][i];"), "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 28, TaskType.MultipleChoice,
                    "Ce returnează apelul funcției f(2026)? \n\nint f(int n){\n  if(n==0) return 0;\n  return n%10 + f(n/10);\n}",
                    "Aceasta este o funcție care calculează suma cifrelor unui număr. Fă suma: 2+0+2+6.",
                    Map.of("options", List.of("10", "8", "2026", "26"), "correctAnswer", "10", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 29, TaskType.MultipleChoice,
                    "Ce returnează funcția f(4)? \n\nint f(int n) { \n  if(n<=1) return 1; \n  return n * f(n-1); \n}",
                    "Aceasta este funcția factorial. Calculează 4! = 4 * 3 * 2 * 1.",
                    Map.of("options", List.of("24", "10", "16", "4"), "correctAnswer", "24", "imageUrl", imgInfo), mapper));

          tasks.add(createTask(infoLevel, 30, TaskType.MultipleChoice,
                  " Într-o rețea cu 10 sateliți, suma gradelor tuturor nodurilor este exact 20. Câte conexiuni (muchii) active există în sistem?",
                  "Folosește Lema de adunare a gradelor: Suma gradelor este întotdeauna egală cu de două ori numărul de muchii (Suma = 2 * M).",
                  Map.of("options", List.of("10", "20", "5", "40"),
                          "correctAnswer", "10",
                          "imageUrl", imgInfo), mapper));
            tasks.add(createTask(infoLevel, 31, TaskType.MultipleChoice,
                    "Ce semnifică faptul că a[i][j] = 1 într-o matrice de adiacență?",
                    "Matricea de adiacență stochează legăturile dintre noduri. Valoarea 1 înseamnă că există o legătură.",
                    Map.of("options", List.of("Există o muchie între i și j", "Graful este orientat", "Nodul i are gradul 1", "Nu există muchie"), "correctAnswer", "Există o muchie între i și j", "imageUrl", imgInfo), mapper));

            tasks.add(createTask(infoLevel, 32, TaskType.MultipleChoice,
                    "ALERTA MAXIMĂ! Sistemul a fost corupt. Singura modalitate de a restabili conexiunea este introducerea Codului de Override generat de Serverul Central (Robotul din clasă).",
                    "Mergi la robot, ascultă sau citește cele 4 cifre de pe ecran și alege varianta corectă.",
                    Map.of("options", List.of("1984", "0000", "7392", "4040"), "correctAnswer", "7392", "imageUrl", imgInfo), mapper));

            gameTaskRepository.saveAll(tasks);
            System.out.println("LOG: Jocul cu grafuri a fost creat cu succes.");
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