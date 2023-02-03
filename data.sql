-- MySQL dump 10.13  Distrib 8.0.29, for Linux (x86_64)
--
-- Host: localhost    Database: fkbosna
-- ------------------------------------------------------
-- Server version	8.0.29

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0f39ad3b-aeba-4d73-90ba-a98cc4deabb4','14dd78d21a768372e6f1d99fbd33a40f596d07a532e7766741d2c9345495a157','2021-07-02 12:41:52.807','20210624165252_',NULL,NULL,'2021-07-02 12:41:52.770',1),('43b92490-8647-430b-b36f-2e4e14b63a32','d106c38bf0b0c2494601a9ccc65fd7682537c05bf19a1fb4c13fa1966a3d66cf','2021-07-02 12:41:52.936','20210624170001_dev',NULL,NULL,'2021-07-02 12:41:52.815',1),('4d198ae3-2b97-45c3-a014-511279c2f78f','c402f8e06229b9fb80e67ab662a72a07c62bcc983c7faa5e0928fc4172e50232','2021-07-02 12:41:53.408','20210625134825_dev',NULL,NULL,'2021-07-02 12:41:53.055',1),('64157640-2e2e-4c55-b2c8-98f8b91ef568','0c2e27ebb95c747392353a4f0404248eeaa92b5c577cb73b5f527a95dd098f96','2021-09-14 08:59:31.767','20210914085931_dev',NULL,NULL,'2021-09-14 08:59:31.608',1),('a0ebcba7-291c-4e75-9ba6-5bf6c21579b8','0cad0fb8bf711760c9e43f1e26bc14c4cdb8f2934843689f2beca7b8194ace4b','2021-07-02 12:41:53.532','20210625154637_dev',NULL,NULL,'2021-07-02 12:41:53.414',1),('a1fa7921-9f57-4de7-8ceb-53aca84fb444','2c10ab7a2ec6984390418dbd474d3ad0df4d28fce33cbd1c0b6611d37d7ba4e5','2021-07-02 12:41:52.758','20210624095417_dev',NULL,NULL,'2021-07-02 12:41:52.685',1),('a6adc8ca-536e-41ef-b893-9e4d8e6b0a8f','3050bb3375c20c98d4d7485e0a06d38fb11cc4879e8fa63dbe7764a272022c1b','2021-07-02 12:41:53.046','20210625084022_dev',NULL,NULL,'2021-07-02 12:41:52.945',1),('b75b482b-9182-4978-8ed5-de6fc8f2fb04','4eab9d2129f57b80e93caf488ed703bfa5df97b13fa71ee9bb54890706c8efc3','2021-07-02 12:41:52.674','20210624091343_dev',NULL,NULL,'2021-07-02 12:41:52.341',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `colors`
--

DROP TABLE IF EXISTS `colors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `colors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `hexCode` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `colors_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `colors`
--

LOCK TABLES `colors` WRITE;
/*!40000 ALTER TABLE `colors` DISABLE KEYS */;
INSERT INTO `colors` VALUES (1,'YELLOW','#FFC000'),(2,'BLUE','#0070C0'),(3,'RED','#EA0202');
/*!40000 ALTER TABLE `colors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `players`
--

DROP TABLE IF EXISTS `players`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `players` (
  `id` int NOT NULL AUTO_INCREMENT,
  `firstname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `lastname` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `colorId` int DEFAULT NULL,
  `fupaSlug` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '',
  PRIMARY KEY (`id`),
  KEY `colorId` (`colorId`),
  CONSTRAINT `players_colorId_fkey` FOREIGN KEY (`colorId`) REFERENCES `colors` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `players`
--

LOCK TABLES `players` WRITE;
/*!40000 ALTER TABLE `players` DISABLE KEYS */;
INSERT INTO `players` VALUES (2,'Kevin','Leuschner',1,'kevin-leuschner-129908'),(3,'Hazim','Muharemovic',1,'hazim-muharemovic-757704'),(4,'Tino','Divkovic',1,'tino-divkovic-1883331'),(5,'Raul','Lugo',1,'raul-andres-lugo-rodriguez-721663'),(6,'Alexander','Breuer',1,'alexander-breuer-532648'),(8,'Ademin','Hadzic',2,'ademin-hadzic-1780788'),(10,'Semir','Borogovac',2,'semir-borogovac-572840'),(11,'Dario','Priesmeyer',1,'dario-priesmeyer-130234'),(12,'Mohammed','Jeha',2,'mohamed-jeha-112333'),(16,'Adin','Civa',2,'adin-civa-361130'),(17,'Charisma','Kumah',2,'charisma-kumah-193095'),(20,'Andreas','Sabelfeld',3,'andreas-sabelfeld-682819'),(21,'Eldar','Junuzovic',3,'eldar-junuzovic-1904508'),(23,'Mirnes','Selamovic',3,'mirnes-selamovic-1807653'),(24,'Benedict','Stoffels',3,'benedict-stoffels-157134'),(25,'Frederik','Hützen',3,'frederik-huetzen-821907'),(26,'Isi','Agic',3,'ismail-agic-719365'),(29,'Amer','Natur',NULL,'amer-natur-340182'),(30,'Anes','Vehab',3,'anes-vehab-1942688'),(32,'Amar','Prutina',3,'amar-prutina-1988120'),(34,'Davor','Todorovic',2,'davor-todorovic-1988118'),(36,'Tobias','Böhm',1,'tobias-juergen-boehm-129627'),(40,'Alen','Gosic',2,''),(42,'Adnan','Mujkic',1,''),(44,'Armin','Mustacevic',1,'');
/*!40000 ALTER TABLE `players` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'nermin@dimego.de','$2b$10$Y3nt34FTeH.xRgioBzzrvuCqCftrbeZa/QN.0a5u9Wh7Sh1FpgAYO'),(2,'raul@dimego.de','$2b$10$Y3nt34FTeH.xRgioBzzrvuCqCftrbeZa/QN.0a5u9Wh7Sh1FpgAYO'),(3,'adin@dimego.de','$2b$10$NEn1cA1L/QLW4YyI.8aHIeACBKBnqraeOfPbjdmo7CUDODbmSHB2i');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-02-03 17:45:18
