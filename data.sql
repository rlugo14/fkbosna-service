-- -------------------------------------------------------------
-- TablePlus 4.0.0(370)
--
-- https://tableplus.com/
--
-- Database: fkbosna
-- Generation Time: 2021-07-02 14:54:16.8160
-- -------------------------------------------------------------


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


DROP TABLE IF EXISTS `_prisma_migrations`;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `colors`;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hexCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `colors.name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `players`;
CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `colorId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `colorId` (`colorId`),
  CONSTRAINT `players_ibfk_1` FOREIGN KEY (`colorId`) REFERENCES `colors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=27 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users.email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('0f39ad3b-aeba-4d73-90ba-a98cc4deabb4', '14dd78d21a768372e6f1d99fbd33a40f596d07a532e7766741d2c9345495a157', '2021-07-02 12:41:52.807', '20210624165252_', NULL, NULL, '2021-07-02 12:41:52.770', 1),
('43b92490-8647-430b-b36f-2e4e14b63a32', 'd106c38bf0b0c2494601a9ccc65fd7682537c05bf19a1fb4c13fa1966a3d66cf', '2021-07-02 12:41:52.936', '20210624170001_dev', NULL, NULL, '2021-07-02 12:41:52.815', 1),
('4d198ae3-2b97-45c3-a014-511279c2f78f', 'c402f8e06229b9fb80e67ab662a72a07c62bcc983c7faa5e0928fc4172e50232', '2021-07-02 12:41:53.408', '20210625134825_dev', NULL, NULL, '2021-07-02 12:41:53.055', 1),
('a0ebcba7-291c-4e75-9ba6-5bf6c21579b8', '0cad0fb8bf711760c9e43f1e26bc14c4cdb8f2934843689f2beca7b8194ace4b', '2021-07-02 12:41:53.532', '20210625154637_dev', NULL, NULL, '2021-07-02 12:41:53.414', 1),
('a1fa7921-9f57-4de7-8ceb-53aca84fb444', '2c10ab7a2ec6984390418dbd474d3ad0df4d28fce33cbd1c0b6611d37d7ba4e5', '2021-07-02 12:41:52.758', '20210624095417_dev', NULL, NULL, '2021-07-02 12:41:52.685', 1),
('a6adc8ca-536e-41ef-b893-9e4d8e6b0a8f', '3050bb3375c20c98d4d7485e0a06d38fb11cc4879e8fa63dbe7764a272022c1b', '2021-07-02 12:41:53.046', '20210625084022_dev', NULL, NULL, '2021-07-02 12:41:52.945', 1),
('b75b482b-9182-4978-8ed5-de6fc8f2fb04', '4eab9d2129f57b80e93caf488ed703bfa5df97b13fa71ee9bb54890706c8efc3', '2021-07-02 12:41:52.674', '20210624091343_dev', NULL, NULL, '2021-07-02 12:41:52.341', 1);

INSERT INTO `colors` (`id`, `name`, `hexCode`) VALUES
(1, 'YELLOW', '#FFC000'),
(2, 'BLUE', '#0070C0'),
(3, 'RED', '#EA0202');

INSERT INTO `players` (`id`, `firstname`, `lastname`, `colorId`) VALUES
(1, 'Hakim', 'Boussaria', 1),
(2, 'Kevin', 'Leuschner', 1),
(3, 'Hazim', 'Muharemovic', 1),
(4, 'Tino', 'Divkovic', 1),
(5, 'Raul', 'Lugo', 1),
(6, 'Alexander', 'Breuer', 1),
(7, 'Ramiz', 'Sabotic', 1),
(8, 'Ademin', 'Hadzic', 1),
(9, 'Mirnes', 'Mehovic', 1),
(10, 'Semir', 'Borogovac', 2),
(11, 'Dario', 'Priesmeyer', 2),
(12, 'Mohammed', 'Jeha', 2),
(13, 'Khashayar', 'Goudarzi', 2),
(14, 'Patrick', 'Werchau', 2),
(15, 'Milutin', 'Jovanovic', 2),
(16, 'Adin', 'Civa', 2),
(17, 'Charisma', 'Kumah', 2),
(18, 'Elwin', 'Hadzic', 2),
(19, 'Veli', 'Velija', 3),
(20, 'Andreas', 'Sabelfeld', 3),
(21, 'Eldar', 'Junuzovic', 3),
(22, 'Haris', 'Dedic', 3),
(23, 'Mirnes', 'Selamovic', 3),
(24, 'Benedict', 'Stoffels', 3),
(25, 'Frederik', 'Hützen', 3),
(26, 'Isi', 'Agic', 3);



/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;